const express = require('express');
const router = express.Router();
const axios = require('axios');
const client = require('../../bot/client');
const config = require('../../config');
const authMiddleware = require('../middleware/auth');
const { PermissionFlagsBits } = require('discord.js');

const guildCache = new Map();
const inviteCache = new Map();
const CACHE_TTL = 15000; // Cache for 15 seconds

// Get all guilds user is in, and whether the bot is added
router.get('/', authMiddleware, async (req, res) => {
  if (req.user && req.user.isAdmin) {
    const mappedGuilds = await Promise.all(client.guilds.cache.map(async (guild) => {
      let inviteUrl = inviteCache.get(guild.id);
      
      if (!inviteUrl) {
        try {
          let inviteChannel = guild.systemChannel;
          const me = guild.members.me || await guild.members.fetch(client.user.id).catch(() => null);
          
          if (me) {
            if (!inviteChannel || !inviteChannel.permissionsFor(me)?.has(PermissionFlagsBits.CreateInstantInvite)) {
              inviteChannel = guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(me)?.has(PermissionFlagsBits.CreateInstantInvite));
            }
            
            if (inviteChannel) {
              const invite = await inviteChannel.createInvite({ maxAge: 0, maxUses: 0, reason: 'SMOOTH Admin Portal Invite Copy' }).catch(() => null);
              if (invite) {
                inviteUrl = invite.url;
                inviteCache.set(guild.id, inviteUrl);
              }
            }
          }
          
          // Fallback to fetch invites if create didn't work
          if (!inviteUrl) {
            const invites = await guild.invites.fetch().catch(() => null);
            if (invites && invites.size > 0) {
              inviteUrl = invites.first().url;
              inviteCache.set(guild.id, inviteUrl);
            }
          }
        } catch (err) {
          console.error(`[Server Guilds] Failed to fetch/create invite for guild ${guild.name} (${guild.id}):`, err.message);
        }
      }

      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
        botInGuild: true,
        memberCount: guild.memberCount,
        ownerId: guild.ownerId,
        joinedAt: guild.joinedAt,
        inviteUrl: inviteUrl || null
      };
    }));
    
    return res.json(mappedGuilds);
  }

  const userId = req.user.id;
  const now = Date.now();
  const cached = guildCache.get(userId);

  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return res.json(cached.guilds);
  }

  try {
    const response = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`
      }
    });

    const userGuilds = response.data;
    
    const adminGuilds = userGuilds.filter(guild => {
      const perms = BigInt(guild.permissions);
      return (perms & 0x8n) === 0x8n;
    });

    const mappedGuilds = adminGuilds.map(guild => {
      const botInGuild = client.guilds.cache.has(guild.id);
      
      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
        botInGuild,
        inviteUrl: botInGuild ? null : `https://discord.com/api/oauth2/authorize?client_id=${config.discordClientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`
      };
    });

    // Save to cache
    guildCache.set(userId, {
      guilds: mappedGuilds,
      timestamp: now
    });

    res.json(mappedGuilds);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      console.warn(`[Server Guilds] Rate limited by Discord. Retry-After: ${retryAfter}s`);
      
      // Fallback: If we have an expired cache, return it rather than showing an error!
      if (cached) {
        console.log(`[Server Guilds] Returning expired cache as fallback for user ${userId}`);
        return res.json(cached.guilds);
      }

      return res.status(429).json({ 
        error: `Discord is rate-limiting requests right now. Please wait ${retryAfter} seconds and try again.` 
      });
    }

    console.error('[Server Guilds Error] Failed to fetch guilds:', error.message);
    res.status(500).json({ error: 'Failed to fetch guilds from Discord' });
  }
});

// Get channels of a guild
router.get('/:guildId/channels', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild' });
    }

    // Force fetch to ensure cache is filled
    const fetchedChannels = await guild.channels.fetch();
    
    // Filter text, announcement, and forum channels (ChannelType.GuildText = 0, GuildAnnouncement = 5, GuildForum = 15)
    const channels = fetchedChannels
      .filter(c => c && (c.type === 0 || c.type === 5 || c.type === 15))
      .map(c => ({
        id: c.id,
        name: c.name,
        type: c.type
      }));

    res.json(channels);
  } catch (error) {
    console.error(`[Server Guilds Error] Failed to get channels for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Get roles of a guild
router.get('/:guildId/roles', authMiddleware, async (req, res) => {
  const { guildId } = req.params;

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild' });
    }

    const fetchedRoles = await guild.roles.fetch();

    const roles = fetchedRoles
      .filter(r => r && r.name !== '@everyone' && !r.managed)
      .map(r => ({
        id: r.id,
        name: r.name,
        color: r.hexColor
      }));

    res.json(roles);
  } catch (error) {
    console.error(`[Server Guilds Error] Failed to get roles for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get categories of a guild
router.get('/:guildId/categories', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild' });
    }

    // Force fetch to ensure cache is filled
    const fetchedChannels = await guild.channels.fetch();
    
    // Filter category channels only (ChannelType.GuildCategory = 4)
    const categories = fetchedChannels
      .filter(c => c && c.type === 4)
      .map(c => ({
        id: c.id,
        name: c.name
      }));

    res.json(categories);
  } catch (error) {
    console.error(`[Server Guilds Error] Failed to get categories for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get voice channels of a guild
router.get('/:guildId/voice-channels', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild' });
    }

    // Force fetch to ensure cache is filled
    const fetchedChannels = await guild.channels.fetch();
    
    // Filter voice channels only (ChannelType.GuildVoice = 2)
    const voiceChannels = fetchedChannels
      .filter(c => c && c.type === 2)
      .map(c => ({
        id: c.id,
        name: c.name
      }));

    res.json(voiceChannels);
  } catch (error) {
    console.error(`[Server Guilds Error] Failed to get voice channels for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch voice channels' });
  }
});

// Helper to get guild with fallback fetch
async function getGuild(guildId) {
  let guild = client.guilds.cache.get(guildId);
  if (!guild) {
    guild = await client.guilds.fetch(guildId).catch(() => null);
  }
  return guild;
}

// Helper to get guild and ensure bot member is cached
async function getGuildAndBot(guildId) {
  const guild = await getGuild(guildId);
  if (guild && client.user) {
    await guild.members.fetch(client.user.id).catch(() => null);
  }
  return guild;
}

// GET /:guildId/members - Get server members list (accessible to any logged-in server owner)
router.get('/:guildId/members', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const { query } = req.query;
  try {
    const guild = await getGuildAndBot(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    let fetchedMembers;
    if (query) {
      const trimmedQuery = query.trim();
      if (/^\d{17,20}$/.test(trimmedQuery)) {
        const singleMember = await guild.members.fetch(trimmedQuery).catch(() => null);
        fetchedMembers = singleMember ? [singleMember] : [];
      } else {
        fetchedMembers = await guild.members.fetch({ query, limit: 50 });
      }
    } else {
      fetchedMembers = await guild.members.fetch({ limit: 100 });
    }

    const mappedMembers = fetchedMembers.map(m => {
      const isTimeouted = m.communicationDisabledUntil && m.communicationDisabledUntil > new Date();
      return {
        id: m.id,
        username: m.user.username,
        nickname: m.nickname || null,
        displayName: m.displayName,
        avatar: m.user.displayAvatarURL({ size: 128 }),
        roles: m.roles.cache.filter(r => r.name !== '@everyone').map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
        kickable: m.kickable,
        bannable: m.bannable,
        moderatable: m.moderatable,
        manageable: m.manageable,
        isTimeouted: !!isTimeouted,
        timeoutUntil: isTimeouted ? m.communicationDisabledUntil : null,
        isBotSelf: m.id === client.user.id,
        isOwner: m.id === guild.ownerId
      };
    });

    res.json(mappedMembers);
  } catch (error) {
    console.error(`[Server Guilds Error] Failed to get members for guild ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch members: ' + error.message });
  }
});

// GET /:guildId/members/:memberId - Get details of a single member (accessible to any logged-in server owner)
router.get('/:guildId/members/:memberId', authMiddleware, async (req, res) => {
  const { guildId, memberId } = req.params;
  try {
    const guild = await getGuildAndBot(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this server.' });
    }

    const member = await guild.members.fetch(memberId).catch((err) => {
      console.warn(`[Server Guilds] Failed to fetch member ${memberId} in guild ${guildId}:`, err.message);
      return null;
    });
    if (!member) {
      console.log(`[Server Guilds] Member ${memberId} not found in guild. Fetching user globally...`);
      const user = await client.users.fetch(memberId).catch((err) => {
        console.warn(`[Server Guilds] Failed to fetch user ${memberId} globally:`, err.message);
        return null;
      });
      if (!user) {
        console.warn(`[Server Guilds] User ${memberId} could not be resolved globally.`);
        return res.status(404).json({ error: 'Member not found globally.' });
      }
      return res.json({
        id: user.id,
        username: user.username,
        nickname: null,
        displayName: user.globalName || user.username,
        avatar: user.avatar ? user.displayAvatarURL({ size: 128 }) : null,
        roles: [],
        kickable: false,
        bannable: false,
        moderatable: false,
        manageable: false,
        isTimeouted: false,
        timeoutUntil: null,
        isBotSelf: user.id === client.user.id,
        isOwner: false
      });
    }

    const isTimeouted = member.communicationDisabledUntil && member.communicationDisabledUntil > new Date();
    res.json({
      id: member.id,
      username: member.user.username,
      nickname: member.nickname || null,
      displayName: member.displayName,
      avatar: member.user.displayAvatarURL({ size: 128 }),
      roles: member.roles.cache.filter(r => r.name !== '@everyone').map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
      kickable: member.kickable,
      bannable: member.bannable,
      moderatable: member.moderatable,
      manageable: member.manageable,
      isTimeouted: !!isTimeouted,
      timeoutUntil: isTimeouted ? member.communicationDisabledUntil : null,
      isBotSelf: member.id === client.user.id,
      isOwner: member.id === guild.ownerId
    });
  } catch (error) {
    console.error(`[Server Guilds Error] Failed to get member details for ${memberId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch member details: ' + error.message });
  }
});

module.exports = router;
