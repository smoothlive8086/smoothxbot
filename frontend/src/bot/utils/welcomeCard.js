const { createCanvas, loadImage } = require('@napi-rs/canvas');

/**
 * Generates a welcome card buffer using Canvas.
 * @param {object} member Discord GuildMember
 * @param {object} settings Welcome settings for the guild
 */
async function generateWelcomeCard(member, settings) {
  const canvas = createCanvas(800, 450);
  const ctx = canvas.getContext('2d');

  // Background
  let backgroundLoaded = false;
  if (settings.background) {
    try {
      // Check if background is hex color or URL
      if (settings.background.startsWith('#') || settings.background.length === 6 || settings.background.length === 3) {
        // Draw solid color/gradient
        const color = settings.background.startsWith('#') ? settings.background : `#${settings.background}`;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        backgroundLoaded = true;
      } else {
        // Check if it's a locally stored upload to load from file system instead of HTTP request (fails in Docker/loopback)
        if (settings.background.includes('/uploads/')) {
          const path = require('path');
          const fs = require('fs');
          const filename = settings.background.split('/uploads/')[1];
          const localPath = path.join(__dirname, '../../../public/uploads', filename);
          if (fs.existsSync(localPath)) {
            const bgImg = await loadImage(localPath);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            backgroundLoaded = true;
          }
        }
        
        if (!backgroundLoaded) {
          // Load image from URL
          const bgImg = await loadImage(settings.background);
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          backgroundLoaded = true;
        }
      }
    } catch (e) {
      console.error('Failed to load welcome background image:', e.message);
    }
  }

  if (!backgroundLoaded) {
    // Default gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0F0C20');
    grad.addColorStop(0.5, '#151030');
    grad.addColorStop(1, '#060410');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative futuristic circles
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(80, 80, 120, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(720, 370, 180, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Dark overlay opacity layer (applies on top of background before drawing content)
  const overlayOpacity = settings.overlayOpacity !== undefined ? settings.overlayOpacity : 0.3;
  if (overlayOpacity > 0) {
    ctx.save();
    ctx.fillStyle = settings.overlayColor || '#000000';
    ctx.globalAlpha = overlayOpacity;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // Element visibility configurations
  const avatarEnabled = settings.avatarEnabled !== false;
  const titleEnabled = settings.titleEnabled !== false;
  const usernameEnabled = settings.usernameEnabled !== false;
  const subtextEnabled = settings.subtextEnabled !== false;

  // Load avatar
  let avatar;
  if (avatarEnabled) {
    try {
      const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
      avatar = await loadImage(avatarUrl);
    } catch (e) {
      console.error('Failed to load user avatar:', e.message);
    }
  }

  // Configurable layout parameters
  const avatarSize = settings.avatarSize !== undefined ? settings.avatarSize : 140;
  const avatarR = avatarSize / 2;
  const avatarX = settings.avatarX !== undefined ? settings.avatarX : 400;
  const avatarY = settings.avatarY !== undefined ? settings.avatarY : 130;
  const avatarRotation = settings.avatarRotation !== undefined ? settings.avatarRotation : 0;
  const avatarBorderThickness = settings.avatarBorderThickness !== undefined ? settings.avatarBorderThickness : 6;
  const avatarBorderColor = settings.avatarBorderColor || settings.textColor || '#ffffff';

  const textColor = settings.textColor || '#ffffff';
  const font = settings.fontFamily || 'Ethnocentric';
  const fontWeight = settings.fontWeight || 'bold';
  let alignment = settings.textAlignment || 'center';
  if (alignment === 'left') {
    alignment = 'right';
  } else if (alignment === 'right') {
    alignment = 'left';
  }

  const titleX = settings.titleX !== undefined ? settings.titleX : 400;
  const titleY = settings.titleY !== undefined ? settings.titleY : 260;
  const titleSize = settings.titleSize !== undefined ? settings.titleSize : 54;

  const usernameX = settings.usernameX !== undefined ? settings.usernameX : 400;
  const usernameY = settings.usernameY !== undefined ? settings.usernameY : 320;
  const usernameSize = settings.usernameSize !== undefined ? settings.usernameSize : 38;

  const subtextX = settings.subtextX !== undefined ? settings.subtextX : 400;
  const subtextY = settings.subtextY !== undefined ? settings.subtextY : 370;
  const subtextSize = settings.subtextSize !== undefined ? settings.subtextSize : 22;

  // Draw Avatar
  if (avatarEnabled) {
    if (avatar) {
      ctx.save();
      ctx.translate(avatarX, avatarY);
      ctx.rotate((avatarRotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.arc(0, 0, avatarR, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, -avatarR, -avatarR, avatarSize, avatarSize);
      ctx.restore();
    } else {
      // Draw empty circle with user initials
      ctx.save();
      ctx.translate(avatarX, avatarY);
      ctx.rotate((avatarRotation * Math.PI) / 180);
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(0, 0, avatarR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `${fontWeight} ${Math.round(avatarSize * 0.35)}px "${font}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(member.user.username.substring(0, 2).toUpperCase(), 0, 0);
      ctx.restore();
    }

    // Avatar border outline & glow
    ctx.save();
    ctx.translate(avatarX, avatarY);
    ctx.rotate((avatarRotation * Math.PI) / 180);
    if (settings.avatarShadowEnabled) {
      ctx.shadowColor = settings.avatarShadowColor || '#2563eb';
      ctx.shadowBlur = settings.avatarShadowBlur !== undefined ? settings.avatarShadowBlur : 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    if (avatarBorderThickness > 0) {
      ctx.beginPath();
      ctx.lineWidth = avatarBorderThickness;
      ctx.strokeStyle = avatarBorderColor;
      ctx.arc(0, 0, avatarR, 0, Math.PI * 2);
      ctx.stroke();
    } else if (settings.avatarShadowEnabled) {
      // If no border but shadow enabled, stroke a thin invisible line to cast the shadow
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0,0,0,0.01)';
      ctx.arc(0, 0, avatarR, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Welcome Text Templates with placeholders
  let titleStr = settings.titleText || 'WELCOME';
  titleStr = titleStr
    .replace(/{server}/g, member.guild.name)
    .replace(/{username}/g, member.user.username.toUpperCase());

  let subtextStr = settings.subtextText || 'TO {server}';
  subtextStr = subtextStr
    .replace(/{server}/g, member.guild.name)
    .replace(/{username}/g, member.user.username.toUpperCase());

  // Setup text shadow/glow parameters and helper
  const fallbackShadow = {
    enabled: settings.textShadowEnabled,
    color: settings.textShadowColor,
    blur: settings.textShadowBlur
  };

  const drawTextItem = (text, x, y, size, fontOverride, weight, styleOverride, color, glowEnabled, glowColor, glowBlur, fallbackShadow) => {
    ctx.save();
    
    // Determine font family
    const resolvedFont = fontOverride || settings.fontFamily || 'Ethnocentric';
    const fontStyle = styleOverride === 'italic' ? 'italic ' : '';
    
    // Some fonts only have normal/regular weights registered. Requesting bold makes canvas fail to match them.
    let resolvedWeight = weight;
    if (['Ethnocentric', 'Bebas Neue', 'Permanent Marker'].includes(resolvedFont) && resolvedWeight === 'bold') {
      resolvedWeight = 'normal';
    }
    
    ctx.font = `${fontStyle}${resolvedWeight} ${size}px "${resolvedFont}"`;
    ctx.textAlign = alignment;
    
    // Draw neon glow (shadow)
    const hasNeonGlow = glowEnabled && glowBlur > 0;
    const hasFallbackShadow = !hasNeonGlow && fallbackShadow && fallbackShadow.enabled;
    
    if (hasNeonGlow) {
      ctx.save();
      ctx.shadowColor = glowColor || '#00ff66';
      ctx.shadowBlur = glowBlur;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = glowColor || '#00ff66';
      
      // Multi-pass draw to stack up intense neon light bloom
      for (let i = 0; i < 3; i++) {
        ctx.fillText(text, x, y);
      }
      ctx.restore();
    } else if (hasFallbackShadow) {
      ctx.save();
      ctx.shadowColor = fallbackShadow.color || '#000000';
      ctx.shadowBlur = fallbackShadow.blur !== undefined ? fallbackShadow.blur : 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.restore();
    }
    
    // Draw solid text fill on top
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    
    ctx.restore();
  };

  // Title / Welcome label
  if (titleEnabled) {
    const titleGlowActive = settings.titleGlowEnabled !== undefined 
      ? settings.titleGlowEnabled 
      : settings.textShadowEnabled;
    const titleGlowColor = settings.titleGlowColor || settings.textShadowColor || '#00ff66';
    const titleGlowBlur = settings.titleGlowBlur !== undefined 
      ? settings.titleGlowBlur 
      : (settings.textShadowBlur || 10);
      
    drawTextItem(
      titleStr,
      titleX,
      titleY,
      titleSize,
      settings.titleFontFamily,
      fontWeight,
      settings.titleFontStyle,
      textColor,
      titleGlowActive,
      titleGlowColor,
      titleGlowBlur,
      fallbackShadow
    );
  }

  // Username
  if (usernameEnabled) {
    let username = member.user.username.toUpperCase();
    if (!username.startsWith('@')) username = '@' + username;
    if (username.length > 20) username = username.substring(0, 18) + '...';
    
    const userGlowActive = settings.usernameGlowEnabled !== undefined 
      ? settings.usernameGlowEnabled 
      : settings.textShadowEnabled;
    const userGlowColor = settings.usernameGlowColor || settings.textShadowColor || '#2563eb';
    const userGlowBlur = settings.usernameGlowBlur !== undefined 
      ? settings.usernameGlowBlur 
      : (settings.textShadowBlur || 10);

    drawTextItem(
      username,
      usernameX,
      usernameY,
      usernameSize,
      settings.usernameFontFamily,
      fontWeight,
      settings.usernameFontStyle,
      settings.usernameColor || '#2563eb',
      userGlowActive,
      userGlowColor,
      userGlowBlur,
      fallbackShadow
    );
  }

  // Subtext welcome message line
  if (subtextEnabled) {
    const subtextGlowActive = settings.subtextGlowEnabled !== undefined 
      ? settings.subtextGlowEnabled 
      : settings.textShadowEnabled;
    const subtextGlowColor = settings.subtextGlowColor || settings.textShadowColor || '#00ff66';
    const subtextGlowBlur = settings.subtextGlowBlur !== undefined 
      ? settings.subtextGlowBlur 
      : (settings.textShadowBlur || 10);

    drawTextItem(
      subtextStr,
      subtextX,
      subtextY,
      subtextSize,
      settings.subtextFontFamily,
      fontWeight,
      settings.subtextFontStyle,
      settings.subtextColor || 'rgba(255, 255, 255, 0.7)',
      subtextGlowActive,
      subtextGlowColor,
      subtextGlowBlur,
      fallbackShadow
    );
  }

  // Draw Card border/frame around outer edges
  if (settings.cardBorderEnabled && settings.cardBorderThickness > 0) {
    ctx.save();
    ctx.lineWidth = settings.cardBorderThickness;
    ctx.strokeStyle = settings.cardBorderColor || '#2563eb';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  return canvas.encode('png');
}

module.exports = { generateWelcomeCard };
