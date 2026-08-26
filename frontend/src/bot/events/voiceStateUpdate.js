const { ChannelType } = require('discord.js');
const { getGuildSettings } = require('../../database/settingsManager');
const { dispatchAuditLog } = require('../utils/auditLogger');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    const guild = newState.guild || oldState.guild;
    if (!guild) return;

    const member = newState.member || oldState.member;

    // 1. Audit Log Voice State Changes
    try {
      if (member && !member.user.bot) {
        // Voice Join
        if (!oldState.channelId && newState.channelId) {
          const channelName = newState.channel ? newState.channel.name : 'Voice Channel';
          await dispatchAuditLog(guild.id, {
            actionType: 'voice_join',
            moderator: { id: 'system', username: 'System', avatar: null },
            target: { id: member.id, username: member.user.username, avatar: member.user.avatar },
            details: `Joined voice channel #${channelName}`,
            timestamp: new Date()
          });
        }
        // Voice Disconnect
        else if (oldState.channelId && !newState.channelId) {
          const channelName = oldState.channel ? oldState.channel.name : 'Voice Channel';
          await dispatchAuditLog(guild.id, {
            actionType: 'voice_disconnect',
            moderator: { id: 'system', username: 'System', avatar: null },
            target: { id: member.id, username: member.user.username, avatar: member.user.avatar },
            details: `Disconnected from voice channel #${channelName}`,
            timestamp: new Date()
          });
        }
        // Voice Move
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
          const oldName = oldState.channel ? oldState.channel.name : 'Voice Channel';
          const newName = newState.channel ? newState.channel.name : 'Voice Channel';
          await dispatchAuditLog(guild.id, {
            actionType: 'voice_move',
            moderator: { id: 'system', username: 'System', avatar: null },
            target: { id: member.id, username: member.user.username, avatar: member.user.avatar },
            details: `Moved from #${oldName} to #${newName}`,
            timestamp: new Date()
          });
        }

        // Voice Mute / Server Mute
        if (oldState.serverMute !== newState.serverMute) {
          await dispatchAuditLog(guild.id, {
            actionType: 'voice_mute',
            moderator: { id: 'unknown', username: 'Moderator / System', avatar: null },
            target: { id: member.id, username: member.user.username, avatar: member.user.avatar },
            details: `Server Voice Mute changed to ${newState.serverMute ? 'MUTED' : 'UNMUTED'}`,
            timestamp: new Date()
          });
        }

        // Voice Deafen / Server Deafen
        if (oldState.serverDeaf !== newState.serverDeaf) {
          await dispatchAuditLog(guild.id, {
            actionType: 'voice_deafen',
            moderator: { id: 'unknown', username: 'Moderator / System', avatar: null },
            target: { id: member.id, username: member.user.username, avatar: member.user.avatar },
            details: `Server Voice Deafen changed to ${newState.serverDeaf ? 'DEAFENED' : 'UNDEAFENED'}`,
            timestamp: new Date()
          });
        }
      }
    } catch (auditErr) {
      console.error('[Voice Audit Error] Failed to log voiceStateUpdate:', auditErr.message);
    }

    // 2. Temp Voice Management
    try {
      const settings = await getGuildSettings(guild.id);
      if (!settings || !settings.tempVoice || !settings.tempVoice.enabled) return;

      const tempConfig = settings.tempVoice;
      
      // Gather all active trigger channel configs
      let triggerConfigs = [];
      if (Array.isArray(tempConfig.channels) && tempConfig.channels.length > 0) {
        triggerConfigs = tempConfig.channels.filter(c => c && c.channelId);
      }
      if (tempConfig.channelId && !triggerConfigs.some(c => c.channelId === tempConfig.channelId)) {
        triggerConfigs.push({
          channelId: tempConfig.channelId,
          categoryId: tempConfig.categoryId || '',
          nameTemplate: tempConfig.nameTemplate || "🔊 {username}'s Room"
        });
      }

      if (triggerConfigs.length === 0) return;

      const matchedConfig = triggerConfigs.find(c => c.channelId === newState.channelId);

      // User Joined one of the "Join to Create" trigger channels
      if (matchedConfig) {
        if (!member) return;

        const username = member.user.username;
        const template = matchedConfig.nameTemplate || tempConfig.nameTemplate || "🔊 {username}'s Room";
        const channelName = template.replace(/{username}/g, username);

        const triggerChannel = guild.channels.cache.get(matchedConfig.channelId);
        const parentId = matchedConfig.categoryId || tempConfig.categoryId || triggerChannel?.parentId || undefined;

        console.log(`[Temp Voice] Creating room "${channelName}" for ${username} in category ${parentId}`);

        const tempChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: parentId,
          permissionOverwrites: [
            {
              id: member.id,
              allow: ['ManageChannels', 'MoveMembers', 'MuteMembers', 'DeafenMembers', 'Connect', 'Speak']
            },
            {
              id: guild.id,
              allow: ['Connect', 'Speak']
            }
          ]
        });

        await member.voice.setChannel(tempChannel);
      }

      // User Left a Channel - Check if it was an empty temporary channel
      if (oldState.channelId && oldState.channelId !== newState.channelId) {
        const oldChannel = oldState.channel;
        const allTriggerIds = triggerConfigs.map(c => c.channelId);

        if (oldChannel && !allTriggerIds.includes(oldChannel.id)) {
          if (oldChannel.type === ChannelType.GuildVoice && oldChannel.members.size === 0) {
            const isInCategory = triggerConfigs.some(c => {
              const triggerCh = guild.channels.cache.get(c.channelId);
              const targetCat = c.categoryId || tempConfig.categoryId || triggerCh?.parentId;
              return targetCat ? oldChannel.parentId === targetCat : true;
            });

            if (isInCategory) {
              const nameMatches = oldChannel.name.includes("'s Room") || 
                                  oldChannel.name.includes("'s Channel") || 
                                  oldChannel.name.startsWith('🔊') ||
                                  triggerConfigs.some(c => c.nameTemplate && oldChannel.name.includes(c.nameTemplate.replace(/{username}/g, '').trim())) ||
                                  (tempConfig.nameTemplate && oldChannel.name.includes(tempConfig.nameTemplate.replace(/{username}/g, '').trim()));

              if (nameMatches) {
                console.log(`[Temp Voice] Deleting empty temporary voice channel "${oldChannel.name}"`);
                await oldChannel.delete('Temporary Voice Channel - Empty').catch(err => {
                  console.error('[Temp Voice] Failed to delete empty channel:', err.message);
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('[Temp Voice] Error in voiceStateUpdate handler:', error);
    }
  }
};
