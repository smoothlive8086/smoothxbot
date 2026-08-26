const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { checkSpam, resetSpam, checkPhotoSpam, resetPhotoSpam } = require('../utils/antiSpam');
const { hasForbiddenLink } = require('../utils/linkCheck');
const { checkFilteredWords, recordWordViolation } = require('../utils/wordFilter');
const ModerationLog = require('../../database/models/ModerationLog');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const guildId = message.guild.id;
    const channelId = message.channel.id;
    const userId = message.author.id;

    // Cache recent human messages for Anti-Nuke operator tracking
    if (!global.recentGuildMessages) {
      global.recentGuildMessages = new Map();
    }
    let list = global.recentGuildMessages.get(guildId) || [];
    list.push({ userId, timestamp: Date.now() });
    const limit = Date.now() - 60000;
    list = list.filter(m => m.timestamp > limit);
    global.recentGuildMessages.set(guildId, list);

    try {
      const settings = await getGuildSettings(guildId);

      const isWhitelisted = settings.moderation?.whitelistedUsers?.some(u => u.userId === userId);
      if (isWhitelisted) {
        console.log(`[Bot Debug] Skipping spam checks for ${message.author.tag} because they are whitelisted.`);
        return;
      }

      // --- AUTO MODERATION / WORD FILTER ---
      const wordFilterSettings = settings.moderation?.wordFilter;
      if (wordFilterSettings && wordFilterSettings.enabled && Array.isArray(wordFilterSettings.words) && wordFilterSettings.words.length > 0) {
        // Check User Whitelist for Word Filter
        const isUserWordWhitelisted = wordFilterSettings.whitelistedUsers?.some(u => u.userId === userId);
        
        // Check Role Whitelist for Word Filter
        const isRoleWordWhitelisted = message.member?.roles?.cache?.some(role => 
          wordFilterSettings.whitelistedRoles?.some(r => r.roleId === role.id)
        );

        if (!isUserWordWhitelisted && !isRoleWordWhitelisted) {
          const filterResult = checkFilteredWords(
            message.content, 
            wordFilterSettings.words, 
            wordFilterSettings.strictBypassProtection !== false
          );

          if (filterResult.containsForbidden) {
            console.log(`[AutoMod] Filtered word detected from ${message.author.tag}: "${filterResult.detectedWord}" (${filterResult.matchedPattern})`);

            const maxViolations = wordFilterSettings.maxViolations !== undefined && !isNaN(wordFilterSettings.maxViolations) ? Number(wordFilterSettings.maxViolations) : 3;
            const violationData = recordWordViolation(guildId, userId, maxViolations);

            let actionTakenStr = `Message Deleted (Offense ${violationData.count}/${maxViolations})`;
            const shouldDelete = wordFilterSettings.autoDelete !== false || wordFilterSettings.action !== 'delete_warn';
            const shouldTimeout = (wordFilterSettings.autoTimeout !== false || wordFilterSettings.action === 'delete_timeout') 
              && wordFilterSettings.action !== 'delete' 
              && violationData.isExceeded;
            const timeoutMins = wordFilterSettings.timeoutDuration || 10;

            // 1. Delete message
            if (shouldDelete) {
              await message.delete().catch(err => console.error('[AutoMod] Failed to delete message:', err.message));
            }

            // 2. Timeout user if moderatable & violation limit exceeded
            if (shouldTimeout && message.member && message.member.moderatable) {
              const timeoutMs = timeoutMins * 60 * 1000;
              await message.member.timeout(timeoutMs, `AutoMod: Exceeded filtered word limit (${violationData.count}/${maxViolations}) for "${filterResult.detectedWord}"`).catch(err => {
                console.error(`[AutoMod] Failed to timeout ${message.author.tag}:`, err.message);
              });
              actionTakenStr = `Message Deleted & User Timed Out (${timeoutMins} mins - Exceeded Limit ${violationData.count}/${maxViolations})`;
            }

            // 3. Send temporary alert message in channel
            if (wordFilterSettings.sendAlert !== false) {
              const alertMsgTemplate = wordFilterSettings.alertMessage || '{user}, your message contained a forbidden word and was removed.';
              const formattedAlert = alertMsgTemplate
                .replace('{user}', `<@${userId}>`)
                .replace('{username}', message.author.username)
                .replace('{server}', message.guild.name);

              const warningSuffix = violationData.isExceeded
                ? ` ⚠️ *(Limit Exceeded: ${violationData.count}/${maxViolations} - User Timed Out)*`
                : ` *(Warning ${violationData.count}/${maxViolations})*`;

              const alertMsg = await message.channel.send(`⚠️ ${formattedAlert}${warningSuffix}`).catch(() => {});
              if (alertMsg) {
                setTimeout(() => alertMsg.delete().catch(() => {}), 6000);
              }
            }

            // 4. Send detailed log to configured Discord Log Channel
            if (wordFilterSettings.logChannelId) {
              try {
                const logChannel = message.guild.channels.cache.get(wordFilterSettings.logChannelId) || 
                                   await message.guild.channels.fetch(wordFilterSettings.logChannelId).catch(() => null);

                if (logChannel && logChannel.isTextBased()) {
                  const logEmbed = new EmbedBuilder()
                    .setTitle(violationData.isExceeded ? '🛡️ Auto Moderation: Timeout Limit Exceeded' : '🛡️ Auto Moderation: Filtered Word Warning')
                    .setColor(violationData.isExceeded ? 0xff3366 : 0xf59e0b)
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                    .addFields(
                      { name: '👤 User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                      { name: '📍 Channel', value: `<#${message.channel.id}> (${message.channel.name || 'Text Channel'})`, inline: true },
                      { name: '🚫 Detected Word', value: `\`${filterResult.detectedWord}\` (${filterResult.matchedPattern})`, inline: true },
                      { name: '⚠️ Violation Count', value: `\`${violationData.count} / ${maxViolations}\` ${violationData.isExceeded ? '(Limit Exceeded!)' : '(Logged)'}`, inline: true },
                      { name: '🔨 Action Taken', value: actionTakenStr, inline: true },
                      { name: '⏱️ Timeout Duration', value: (shouldTimeout && message.member?.moderatable) ? `${timeoutMins} Minutes` : 'None (Under Limit)', inline: true },
                      { name: '📅 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                      { name: '💬 Message Content', value: message.content ? `\`\`\`\n${message.content.substring(0, 1000)}\n\`\`\`` : '*[Empty / Media Only]*', inline: false }
                    )
                    .setFooter({ text: `TIMO X MODE AutoMod System • Guild ID: ${guildId}` })
                    .setTimestamp();

                  await logChannel.send({ embeds: [logEmbed] }).catch(err => {
                    console.error('[AutoMod] Failed to send embed to log channel:', err.message);
                  });
                }
              } catch (logErr) {
                console.error('[AutoMod] Error processing log channel embed:', logErr.message);
              }
            }

            // 5. Store in ModerationLog DB
            try {
              await ModerationLog.create({
                guildId,
                actionType: (shouldTimeout && message.member?.moderatable) ? 'timeout' : 'message_delete',
                moderator: { id: 'AUTOMOD_BOT', username: 'TIMO X MODE AutoMod', avatar: '' },
                target: { id: userId, username: message.author.tag, avatar: message.author.displayAvatarURL() },
                details: `AutoMod Word Filter: Caught "${filterResult.detectedWord}" (${filterResult.matchedPattern}). Violation ${violationData.count}/${maxViolations}. Action: ${actionTakenStr}`,
                timestamp: new Date()
              });
            } catch (dbErr) {
              console.error('[AutoMod] Failed to log to DB:', dbErr.message);
            }

            return; // Stop processing further handlers for this deleted message
          }
        }
      }

      const spamSettings = settings.moderation.spam;
      if (spamSettings && spamSettings.enabled && spamSettings.protectedChannels && spamSettings.protectedChannels.includes(channelId)) {
        const spamResult = checkSpam(
          message,
          spamSettings.maxMessages, 
          spamSettings.timeWindow
        );

        if (spamResult.isSpamming) {
          // Delete all spam messages in the window
          for (const msg of spamResult.messages) {
            await msg.delete().catch(err => {
              console.error(`[Bot] Failed to delete spam message:`, err.message);
            });
          }
          
          if (message.member && message.member.moderatable) {
            const durationMs = spamSettings.timeoutDuration * 60 * 1000;
            await message.member.timeout(durationMs, 'Spamming messages').catch(err => {
              console.error(`Failed to timeout member ${userId}:`, err.message);
            });

            const alert = await message.channel.send(
              `⚠️ ${message.author}, you have been timed out for ${spamSettings.timeoutDuration} minutes due to spamming.`
            );
            setTimeout(() => alert.delete().catch(() => {}), 5000);
          } else {
            const alert = await message.channel.send(
              `⚠️ ${message.author}, please stop spamming.`
            );
            setTimeout(() => alert.delete().catch(() => {}), 5000);
          }

          resetSpam(userId, channelId);
          return;
        }
      }

      // Photo Spam Protection (Server-Wide with Whitelist Bypasses)
      const photoSpamSettings = settings.moderation?.photoSpam;
      if (photoSpamSettings && photoSpamSettings.enabled) {
        if (photoSpamSettings.whitelistedChannels && photoSpamSettings.whitelistedChannels.includes(channelId)) {
          console.log(`[Bot Debug] Skipping photo spam checks for ${message.author.tag} in whitelisted channel ${channelId}`);
        } else {
          console.log(`[Bot Debug] Running photo spam check for ${message.author.tag} with maxPhotos=${photoSpamSettings.maxPhotos}, timeWindow=${photoSpamSettings.timeWindow}`);
          const photoSpamResult = checkPhotoSpam(
            message,
            photoSpamSettings.maxPhotos,
            photoSpamSettings.timeWindow
          );
          console.log(`[Bot Debug] Photo spam check result:`, { isSpamming: photoSpamResult.isSpamming, messagesCount: photoSpamResult.messages?.length });

          if (photoSpamResult.isSpamming) {
            console.log(`[Bot Debug] User ${message.author.tag} is spamming photos! Deleting ${photoSpamResult.messages.length} messages.`);
            // Delete all photo spam messages in the window
            for (const msg of photoSpamResult.messages) {
              await msg.delete().catch(err => {
                console.error(`[Bot] Failed to delete photo spam message:`, err.message);
              });
            }
            
            if (message.member && message.member.moderatable) {
              const durationMs = photoSpamSettings.timeoutDuration * 60 * 1000;
              await message.member.timeout(durationMs, 'Spamming photos across the server').catch(err => {
                console.error(`Failed to timeout member ${userId} for photo spam:`, err.message);
              });

              const alert = await message.channel.send(
                `⚠️ ${message.author}, you have been timed out for ${photoSpamSettings.timeoutDuration} minutes due to spamming photos across the server.`
              );
              setTimeout(() => alert.delete().catch(() => {}), 5000);
            } else {
              const alert = await message.channel.send(
                `⚠️ ${message.author}, please stop spamming photos.`
              );
              setTimeout(() => alert.delete().catch(() => {}), 5000);
            }

            resetPhotoSpam(guildId, userId);
            return;
          }
        }
      }

      const linkSettings = settings.moderation.links;
      if (linkSettings && linkSettings.enabled && linkSettings.protectedChannels && linkSettings.protectedChannels.includes(channelId)) {
        const forbidden = hasForbiddenLink(message.content, linkSettings.allowedLinks);
        
        if (forbidden) {
          await message.delete().catch(() => {});
          
          const alert = await message.channel.send(
            `🚫 ${message.author}, links are not allowed in this channel.`
          );
          setTimeout(() => alert.delete().catch(() => {}), 5000);
          return;
        }
      }
    } catch (error) {
      console.error('[Bot] Error in messageCreate handler:', error);
    }
  }
};
