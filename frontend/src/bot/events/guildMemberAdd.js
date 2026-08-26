const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { generateWelcomeCard } = require('../utils/welcomeCard');
const config = require('../../config');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const guildId = member.guild.id;
    console.log(`[Bot Event] guildMemberAdd triggered for member ${member.user.tag} (${member.user.id}) in guild ${guildId}`);

    if (member.user.bot) {
      console.log(`[Bot Event] Added member ${member.user.tag} is a bot. Running Anti-Bot checks...`);
      try {
        const { AuditLogEvent } = require('discord.js');
        const { getAuditLogExecutor, isWhitelisted, executePunishment } = require('../utils/antinukeTracker');
        const config = await getGuildSettings(guildId);

        if (config?.antinuke?.enabled && config.antinuke.antiBot) {
          // Delay briefly to allow audit log to populate
          await new Promise(resolve => setTimeout(resolve, 2500));

          const executor = await getAuditLogExecutor(member.guild, AuditLogEvent.BotAdd, member.id);
          if (executor) {
            if (executor.id !== member.guild.ownerId && executor.id !== member.guild.client.user.id) {
              const whitelisted = await isWhitelisted(member.guild, executor.id, 'bot_add');
              if (!whitelisted) {
                console.log(`[Anti-Bot Triggered] Executor ${executor.tag} invited bot ${member.user.tag} without authorization.`);
                // Punish the bot itself
                await executePunishment(member.guild, member.user, config.antinuke, 'Unauthorized bot addition (Bot)');
                // Punish the human operator who added the bot
                await executePunishment(member.guild, executor, config.antinuke, 'Unauthorized bot addition (Operator)');
                return;
              }
            }
          }
        }
      } catch (err) {
        console.error(`[Anti-Bot Error] Failed to process Anti-Bot check:`, err.message);
      }
      return;
    }

    try {
      const { dispatchAuditLog } = require('../utils/auditLogger');
      await dispatchAuditLog(guildId, {
        actionType: 'member_join',
        moderator: { id: 'system', username: 'System', avatar: null },
        target: { id: member.id, username: member.user.username, avatar: member.user.avatar },
        details: 'User joined the server',
        timestamp: new Date()
      });
    } catch (auditErr) {
      console.error('[Audit Error] Failed to log member join:', auditErr.message);
    }

    try {
      const settings = await getGuildSettings(guildId);
      console.log(`[Bot Event] Settings retrieved. Welcome status: ${settings?.welcome?.enabled ? 'ENABLED' : 'DISABLED'}, channelId: ${settings?.welcome?.channelId || 'not configured'}`);

      const autoRole = settings.autoRole;
      if (autoRole && autoRole.enabled && autoRole.roleId) {
        const role = member.guild.roles.cache.get(autoRole.roleId);
        if (role) {
          await member.roles.add(role).catch(err => {
            console.error(`[Bot] Failed to assign auto-role to ${member.user.tag}:`, err.message);
          });
        }
      }

      const autoNick = settings.autoNickname;
      if (autoNick && autoNick.enabled) {
        const template = autoNick.template || autoNick.format || '{DISPLAY_NAME}';
        const sourceName = autoNick.sourceName || 'displayName';
        const casing = autoNick.casing || 'original';

        const rawName = sourceName === 'username' ? member.user.username : member.user.displayName;
        let transformedName = rawName;

        if (casing === 'upper') {
          transformedName = rawName.toUpperCase();
        } else if (casing === 'lower') {
          transformedName = rawName.toLowerCase();
        }

        let nickname = template
          .replace(/\{username\}/gi, transformedName)
          .replace(/\{display_name\}/gi, transformedName)
          .replace(/\{tag\}/gi, member.user.tag);

        if (nickname.length > 32) {
          nickname = nickname.substring(0, 32);
        }

        await member.setNickname(nickname).catch(err => {
          console.error(`[Bot] Failed to set auto-nickname for ${member.user.tag}:`, err.message);
        });
      }

      const welcome = settings.welcome;
      if (welcome && welcome.enabled && welcome.channelId) {
        let channel = member.guild.channels.cache.get(welcome.channelId);
        if (!channel) {
          console.log(`[Bot Event] Welcome channel ${welcome.channelId} not found in cache, trying to fetch...`);
          try {
            channel = await member.guild.channels.fetch(welcome.channelId);
          } catch (fetchErr) {
            console.error(`[Bot Event] Failed to fetch welcome channel ${welcome.channelId}:`, fetchErr.message);
          }
        }

        if (channel) {
          console.log(`[Bot Event] Sending welcome message to channel: ${channel.name} (${channel.id}) using layout: ${welcome.layoutType || 'classic'}`);
          let messageText = welcome.message || 'Welcome {user} to the server!';
          messageText = messageText
            .replace(/{user}/g, member.toString())
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name);

          if (welcome.redirectChannelId) {
            messageText = messageText.replace(/{channel}/g, `<#${welcome.redirectChannelId}>`);
          } else {
            messageText = messageText.replace(/{channel}/g, '');
          }
          if (welcome.redirectChannelId2) {
            messageText = messageText.replace(/{channel2}/g, `<#${welcome.redirectChannelId2}>`);
          } else {
            messageText = messageText.replace(/{channel2}/g, '');
          }
          if (welcome.redirectChannelId3) {
            messageText = messageText.replace(/{channel3}/g, `<#${welcome.redirectChannelId3}>`);
          } else {
            messageText = messageText.replace(/{channel3}/g, '');
          }

          // Build redirect channel buttons if configured
          let components = [];
          let buttons = [];
          const redirectIds = [
            welcome.redirectChannelId,
            welcome.redirectChannelId2,
            welcome.redirectChannelId3
          ].filter(Boolean);

          for (const redirectId of redirectIds) {
            try {
              const redirectChannel = member.guild.channels.cache.get(redirectId) ||
                await member.guild.channels.fetch(redirectId).catch(() => null);
              const channelName = redirectChannel ? redirectChannel.name : 'channel';

              const redirectButton = new ButtonBuilder()
                .setLabel(`#${channelName}`)
                .setURL(`https://discord.com/channels/${guildId}/${redirectId}`)
                .setStyle(ButtonStyle.Link);

              buttons.push(redirectButton);
            } catch (btnErr) {
              console.error(`[Bot] Failed to create welcome redirect button for ${redirectId}:`, btnErr.message);
            }
          }

          if (buttons.length > 0) {
            components.push(new ActionRowBuilder().addComponents(buttons));
          }

          const isGif = welcome.gifSupport && welcome.background && welcome.background.toLowerCase().includes('.gif');

          const formatStr = (str) => {
            if (!str) return '';
            let s = str
              .replace(/{user}/g, member.toString())
              .replace(/{username}/g, member.user.username)
              .replace(/{server}/g, member.guild.name);
            if (welcome.redirectChannelId) s = s.replace(/{channel}/g, `<#${welcome.redirectChannelId}>`);
            if (welcome.redirectChannelId2) s = s.replace(/{channel2}/g, `<#${welcome.redirectChannelId2}>`);
            if (welcome.redirectChannelId3) s = s.replace(/{channel3}/g, `<#${welcome.redirectChannelId3}>`);
            return s;
          };

          const resolveMediaUrl = (urlStr) => {
            if (!urlStr) return '';
            let resolved = urlStr.trim();
            if (resolved.startsWith('/')) {
              resolved = `${config.frontendUrl.replace(/\/$/, '')}${resolved}`;
            }
            return resolved;
          };

          const buildWelcomeEmbed = (cardAttachmentUrl = null) => {
            const embed = new EmbedBuilder();

            // Author
            if (welcome.embedAuthorName) {
              const authorData = { name: formatStr(welcome.embedAuthorName) };
              if (welcome.embedAuthorIcon) {
                const icon = resolveMediaUrl(welcome.embedAuthorIcon);
                if (icon) authorData.iconURL = icon;
              }
              if (welcome.embedAuthorUrl) {
                authorData.url = welcome.embedAuthorUrl;
              }
              embed.setAuthor(authorData);
            }

            // Title
            if (welcome.embedTitle) {
              embed.setTitle(formatStr(welcome.embedTitle));
            } else {
              embed.setTitle(`Welcome to ${member.guild.name}!`);
            }
            if (welcome.embedTitleUrl) {
              embed.setURL(welcome.embedTitleUrl);
            }

            // Description
            if (messageText) {
              embed.setDescription(messageText);
            }

            // Color
            const colorHex = welcome.embedColor || welcome.textColor || '#2563eb';
            embed.setColor(colorHex.startsWith('#') ? colorHex : `#${colorHex}`);

            // Thumbnail
            const thumbConfig = welcome.embedThumbnail;
            if (thumbConfig === '{server_icon}') {
              const serverIcon = member.guild.iconURL({ extension: 'png', size: 256 });
              if (serverIcon) embed.setThumbnail(serverIcon);
            } else if (thumbConfig === 'none') {
              // No thumbnail
            } else if (thumbConfig && thumbConfig !== '{user_avatar}') {
              const customThumb = resolveMediaUrl(formatStr(thumbConfig));
              if (customThumb) embed.setThumbnail(customThumb);
            } else {
              // Default: member user avatar
              embed.setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
            }

            // Main Image
            if (welcome.embedImage && welcome.embedImage.trim() !== '') {
              embed.setImage(resolveMediaUrl(formatStr(welcome.embedImage)));
            } else if (cardAttachmentUrl) {
              embed.setImage(cardAttachmentUrl);
            } else if (isGif && welcome.background) {
              embed.setImage(resolveMediaUrl(welcome.background));
            }

            // Fields
            if (Array.isArray(welcome.embedFields) && welcome.embedFields.length > 0) {
              const validFields = welcome.embedFields
                .filter(f => f && f.name && f.value)
                .map(f => ({
                  name: formatStr(f.name),
                  value: formatStr(f.value),
                  inline: Boolean(f.inline)
                }));
              if (validFields.length > 0) {
                embed.addFields(validFields);
              }
            }

            // Footer
            if (welcome.embedFooterText) {
              const footerData = { text: formatStr(welcome.embedFooterText) };
              if (welcome.embedFooterIcon) {
                const footerIcon = resolveMediaUrl(welcome.embedFooterIcon);
                if (footerIcon) footerData.iconURL = footerIcon;
              }
              embed.setFooter(footerData);
            }

            // Timestamp
            if (welcome.embedTimestamp !== false) {
              embed.setTimestamp();
            }

            return embed;
          };

          const layout = welcome.layoutType || 'classic';

          if (layout === 'text-only') {
            await channel.send({ content: messageText, components }).catch(err => {
              console.error(`[Bot] Failed to send text-only welcome message:`, err.message);
            });
            return;
          }

          if (layout === 'embed-only') {
            const embed = buildWelcomeEmbed();
            await channel.send({ content: `${member}`, embeds: [embed], components }).catch(err => {
              console.error(`[Bot] Failed to send embed-only welcome message:`, err.message);
            });
            return;
          }

          if (isGif) {
            const embed = buildWelcomeEmbed();
            await channel.send({ content: `${member}`, embeds: [embed], components }).catch(err => {
              console.error(`[Bot] Failed to send welcome embed:`, err.message);
            });
          } else {
            try {
              const imageBuffer = await generateWelcomeCard(member, welcome);
              const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome.png' });

              if (layout === 'embed-card') {
                const embed = buildWelcomeEmbed('attachment://welcome.png');

                await channel.send({
                  content: `${member}`,
                  embeds: [embed],
                  files: [attachment],
                  components
                });
              } else {
                // Classic layout
                await channel.send({
                  content: messageText,
                  files: [attachment],
                  components
                });
              }
            } catch (err) {
              console.error('[Bot] Canvas welcome card generation failed:', err.message);
              await channel.send({ content: messageText, components }).catch(() => { });
            }
          }
        } else {
          console.warn(`[Bot Event] Welcome channel ${welcome.channelId} could not be resolved (not found or bot lacks permissions).`);
        }
      } else {
        console.log(`[Bot Event] Welcome feature skipped. Enabled: ${welcome?.enabled}, Channel ID: ${welcome?.channelId}`);
      }
    } catch (error) {
      console.error('[Bot] Error in guildMemberAdd handler:', error);
    }
  }
};
