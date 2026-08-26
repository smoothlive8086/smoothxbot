const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createCanvas } = require('@napi-rs/canvas');

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  ctx.restore();
}

function adjustColorBrightness(hex, percent) {
  let hexClean = hex.replace(/^\s*#|\s*$/g, '');
  if (hexClean.length === 3) {
    hexClean = hexClean.replace(/(.)/g, '$1$1');
  }

  let R = parseInt(hexClean.substring(0, 2), 16) || 0;
  let G = parseInt(hexClean.substring(2, 4), 16) || 0;
  let B = parseInt(hexClean.substring(4, 6), 16) || 0;

  R = Math.max(0, Math.min(255, parseInt(R + (percent * 255) / 100)));
  G = Math.max(0, Math.min(255, parseInt(G + (percent * 255) / 100)));
  B = Math.max(0, Math.min(255, parseInt(B + (percent * 255) / 100)));

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

async function generatePollChart(poll) {
  const options = poll.options || [];
  const themeColor = poll.settings?.color || '#2563eb';
  const isEnded = poll.status === 'ended';

  const OPTION_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981',
    '#06b6d4', '#f59e0b', '#84cc16', '#e11d48', '#a78bfa',
  ];

  const allVoters = new Set();
  let maxVotes = 0;
  options.forEach(opt => {
    const count = opt.votes ? opt.votes.length : 0;
    if (count > maxVotes) maxVotes = count;
    if (opt.votes && Array.isArray(opt.votes)) opt.votes.forEach(v => allVoters.add(v));
  });
  const totalUniqueVoters = allVoters.size;

  const W = 760;
  const PX = 36;
  const INNER_W = W - PX * 2;

  const tempCanvas = createCanvas(W, 200);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  const questionLines = wrapText(tempCtx, poll.question, INNER_W - 20);
  const Q_LINE_H = 30;
  const HEADER_H = 34;
  const CHIP_H   = 26;
  const Q_TOP    = HEADER_H + 18 + CHIP_H + 14;
  const Q_H      = questionLines.length * Q_LINE_H;
  const OPT_TOP  = Q_TOP + Q_H + 26;
  const OPT_H    = 76;
  const FOOTER_H = 52;
  const H        = OPT_TOP + options.length * OPT_H + FOOTER_H + 10;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W * 0.7, H);
  bg.addColorStop(0,    '#0d1117');
  bg.addColorStop(0.45, '#0f172a');
  bg.addColorStop(1,    '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Theme color radial glow at top
  const hexRGB = themeColor.replace('#', '');
  const rr = parseInt(hexRGB.substring(0, 2) || '37', 16);
  const gg = parseInt(hexRGB.substring(2, 4) || '62', 16);
  const bb = parseInt(hexRGB.substring(4, 6) || 'eb', 16);
  const radial = ctx.createRadialGradient(W * 0.5, 0, 10, W * 0.5, 0, W * 0.75);
  radial.addColorStop(0, `rgba(${rr},${gg},${bb},0.14)`);
  radial.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, W, H);

  // Diagonal texture
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.022)';
  ctx.lineWidth = 1;
  for (let x = -H; x < W + H; x += 44) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke();
  }
  ctx.restore();

  // Top accent bar
  const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
  accentGrad.addColorStop(0,    themeColor);
  accentGrad.addColorStop(0.55, adjustColorBrightness(themeColor, 15));
  accentGrad.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(0, 0, W, HEADER_H);

  // Glowing bottom edge of accent bar
  ctx.save();
  ctx.shadowColor = themeColor;
  ctx.shadowBlur  = 18;
  ctx.strokeStyle = themeColor;
  ctx.lineWidth   = 2;
  ctx.beginPath(); ctx.moveTo(0, HEADER_H); ctx.lineTo(W, HEADER_H); ctx.stroke();
  ctx.restore();

  // Header labels
  ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('POLL RESULTS', PX, HEADER_H / 2);

  ctx.save();
  ctx.shadowColor = isEnded ? 'transparent' : '#22c55e';
  ctx.shadowBlur  = isEnded ? 0 : 8;
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = isEnded ? '#94a3b8' : '#4ade80';
  ctx.textAlign = 'right';
  ctx.fillText(isEnded ? 'ENDED' : 'ACTIVE', W - PX, HEADER_H / 2);
  ctx.restore();

  // QUESTION chip
  const chipY = HEADER_H + 18;
  ctx.save();
  ctx.fillStyle = `rgba(${rr},${gg},${bb},0.18)`;
  ctx.beginPath(); ctx.roundRect(PX, chipY, 90, CHIP_H, 6); ctx.fill();
  ctx.strokeStyle = `rgba(${rr},${gg},${bb},0.5)`;
  ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = themeColor;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('QUESTION', PX + 10, chipY + CHIP_H / 2);

  // Question text
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#f1f5f9';
  ctx.textBaseline = 'top';
  questionLines.forEach((line, i) => {
    ctx.fillText(line, PX, Q_TOP + i * Q_LINE_H);
  });

  // Divider below question
  const dh = ctx.createLinearGradient(PX, 0, W - PX, 0);
  dh.addColorStop(0, 'rgba(255,255,255,0)');
  dh.addColorStop(0.2, 'rgba(255,255,255,0.09)');
  dh.addColorStop(0.8, 'rgba(255,255,255,0.09)');
  dh.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = dh; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PX, OPT_TOP - 12); ctx.lineTo(W - PX, OPT_TOP - 12); ctx.stroke();

  // Options
  options.forEach((opt, idx) => {
    const votesCount = opt.votes ? opt.votes.length : 0;
    const percentage = totalUniqueVoters > 0 ? Math.round((votesCount / totalUniqueVoters) * 100) : 0;
    const isWinner   = isEnded && votesCount > 0 && votesCount === maxVotes;
    const optColor   = isWinner ? '#eab308' : OPTION_COLORS[idx % OPTION_COLORS.length];
    const yBase      = OPT_TOP + idx * OPT_H;

    // Winner row glow
    if (isWinner) {
      const rowBg = ctx.createLinearGradient(PX, yBase, W - PX, yBase);
      rowBg.addColorStop(0,   'rgba(234,179,8,0.09)');
      rowBg.addColorStop(0.5, 'rgba(234,179,8,0.04)');
      rowBg.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = rowBg;
      ctx.beginPath(); ctx.roundRect(PX - 10, yBase - 4, INNER_W + 20, OPT_H - 4, 10); ctx.fill();
    }

    // Index circle
    const cxR = Math.min(255, parseInt(optColor.slice(1, 3) || '3b', 16));
    const cxG = Math.min(255, parseInt(optColor.slice(3, 5) || '82', 16));
    const cxB = Math.min(255, parseInt(optColor.slice(5, 7) || 'f6', 16));
    const circX = PX + 15, circY = yBase + 20;
    ctx.save();
    ctx.beginPath(); ctx.arc(circX, circY, 14, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${cxR},${cxG},${cxB},0.18)`; ctx.fill();
    ctx.strokeStyle = optColor; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
    ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = optColor; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${idx + 1}`, circX, circY);

    // Label
    let label = opt.text;
    if (label.length > 44) label = label.substring(0, 41) + '\u2026';
    ctx.font = `${isWinner ? 'bold' : '600'} 15px "Segoe UI", Arial, sans-serif`;
    ctx.fillStyle = isWinner ? '#fde047' : '#e2e8f0';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText((isWinner ? '\u{1F451} ' : '') + label, PX + 36, circY);

    // Percentage and votes right
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = isWinner ? '#fde047' : '#f1f5f9';
    ctx.textAlign = 'right';
    ctx.fillText(`${percentage}%`, W - PX - 62, circY);
    ctx.font = '500 12px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = isWinner ? 'rgba(253,224,71,0.7)' : 'rgba(148,163,184,0.7)';
    ctx.fillText(`${votesCount} vote${votesCount !== 1 ? 's' : ''}`, W - PX, circY);

    // Progress bar
    const barX = PX + 36, barY = yBase + 42, barW = INNER_W - 36 - 92, barH = 11, barR = 6;
    drawRoundedRect(ctx, barX, barY, barW, barH, barR, 'rgba(255,255,255,0.06)');
    if (percentage > 0) {
      const fillW = Math.max(barR * 2, barW * (percentage / 100));
      ctx.save();
      ctx.shadowColor = optColor; ctx.shadowBlur = isWinner ? 18 : 12;
      const fg = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
      if (isWinner) {
        fg.addColorStop(0, '#b45309'); fg.addColorStop(0.5, '#eab308'); fg.addColorStop(1, '#fde047');
      } else {
        fg.addColorStop(0, optColor); fg.addColorStop(1, adjustColorBrightness(optColor, 20));
      }
      drawRoundedRect(ctx, barX, barY, fillW, barH, barR, fg);
      ctx.restore();
      // Sheen
      ctx.save();
      const sg = ctx.createLinearGradient(barX, barY, barX, barY + barH);
      sg.addColorStop(0, 'rgba(255,255,255,0.25)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.roundRect(barX, barY, fillW, Math.ceil(barH / 2), [barR, barR, 0, 0]); ctx.fill();
      ctx.restore();
      // Tick
      if (fillW > 24 && fillW < barW - 6) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(barX + fillW, barY - 3); ctx.lineTo(barX + fillW, barY + barH + 3); ctx.stroke();
        ctx.restore();
      }
    }
  });

  // Footer divider
  const footerY = OPT_TOP + options.length * OPT_H + 10;
  const fd = ctx.createLinearGradient(PX, 0, W - PX, 0);
  fd.addColorStop(0, 'rgba(255,255,255,0)'); fd.addColorStop(0.15, 'rgba(255,255,255,0.09)');
  fd.addColorStop(0.85, 'rgba(255,255,255,0.09)'); fd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = fd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PX, footerY); ctx.lineTo(W - PX, footerY); ctx.stroke();

  const fMid = footerY + (H - footerY) / 2;
  ctx.font = '500 12px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = 'rgba(148,163,184,0.72)';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(`\u{1F5F3}  ${totalUniqueVoters} voter${totalUniqueVoters !== 1 ? 's' : ''}`, PX, fMid);

  const tags = [poll.settings?.anonymous ? 'Anonymous' : 'Public', poll.settings?.multipleChoice ? 'Multi-Choice' : 'Single'];
  ctx.fillStyle = 'rgba(148,163,184,0.45)'; ctx.textAlign = 'center';
  ctx.fillText(tags.join('  \u2022  '), W / 2, fMid);

  ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = `rgba(${rr},${gg},${bb},0.55)`;
  ctx.textAlign = 'right';
  ctx.fillText('TIMO BOT', W - PX, fMid);

  return canvas.encode('png');
}

function getEmojiForColor(hex) {
  if (!hex) return '🟦';
  const cleanHex = hex.toLowerCase().replace('#', '');
  
  let hexVal = cleanHex;
  if (cleanHex.length === 3) {
    hexVal = cleanHex.replace(/(.)/g, '$1$1');
  }
  
  let r = parseInt(hexVal.substring(0, 2), 16) || 0;
  let g = parseInt(hexVal.substring(2, 4), 16) || 0;
  let b = parseInt(hexVal.substring(4, 6), 16) || 0;
  
  const colors = [
    { emoji: '🟥', r: 239, g: 68, b: 68 },
    { emoji: '🟧', r: 249, g: 115, b: 22 },
    { emoji: '🟨', r: 234, g: 179, b: 8 },
    { emoji: '🟩', r: 34, g: 197, b: 94 },
    { emoji: '🟦', r: 59, g: 130, b: 246 },
    { emoji: '🟪', r: 168, g: 85, b: 247 },
    { emoji: '🟫', r: 120, g: 53, b: 4 },
    { emoji: '⬜', r: 255, g: 255, b: 255 }
  ];
  
  let closestEmoji = '🟦';
  let minDistance = Infinity;
  
  for (const c of colors) {
    const distance = Math.sqrt(
      Math.pow(r - c.r, 2) +
      Math.pow(g - c.g, 2) +
      Math.pow(b - c.b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestEmoji = c.emoji;
    }
  }
  
  return closestEmoji;
}

function createProgressBar(percentage, hexColor) {
  const filledEmoji = getEmojiForColor(hexColor || '#2563eb');
  const totalBlocks = 10;
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  return filledEmoji.repeat(filledBlocks) + '⬛'.repeat(emptyBlocks);
}

/**
 * Generates a premium Discord embed representation of a poll.
 * @param {Object} poll - The database Poll document.
 * @param {Object} guild - The Discord.js Guild object.
 */
function renderPollEmbed(poll, guild) {
  const isEnded = poll.status === 'ended';
  const embed = new EmbedBuilder()
    .setTitle(`📊 Poll: ${poll.question}`)
    .setColor(poll.settings.color || '#2563eb')
    .setTimestamp();

  if (poll.description) {
    embed.setDescription(poll.description + '\n\n' + '—'.repeat(25));
  }

  // Calculate unique voters
  const allVoters = new Set();
  poll.options.forEach(opt => {
    if (opt.votes && Array.isArray(opt.votes)) {
      opt.votes.forEach(voterId => allVoters.add(voterId));
    }
  });
  const totalUniqueVoters = allVoters.size;

  let fieldsText = '';
  const showResults = isEnded || poll.settings.showResultsBeforeEnding;

  // Find max votes to highlight the winner when ended
  let maxVotes = 0;
  if (isEnded) {
    poll.options.forEach(opt => {
      const count = opt.votes ? opt.votes.length : 0;
      if (count > maxVotes) maxVotes = count;
    });
  }

  poll.options.forEach((opt, idx) => {
    const votesCount = opt.votes ? opt.votes.length : 0;
    let percentage = 0;
    if (totalUniqueVoters > 0) {
      percentage = Math.round((votesCount / totalUniqueVoters) * 100);
    }

    const isWinner = isEnded && votesCount > 0 && votesCount === maxVotes;
    const optionText = isWinner ? `👑 **${opt.text}**` : `**${opt.text}**`;

    if (showResults) {
      const progressBar = createProgressBar(percentage, poll.settings?.color);
      fieldsText += `${idx + 1}. ${optionText}\n${progressBar} **${percentage}%** (${votesCount} vote${votesCount === 1 ? '' : 's'})\n\n`;
    } else {
      fieldsText += `${idx + 1}. ${optionText}\n\n`;
    }
  });

  if (!showResults) {
    fieldsText += `🗳️ *Results are hidden until the poll ends.*\n\n`;
  }

  embed.addFields({ name: 'Options', value: fieldsText || 'No options configured.' });

  // Add settings / details to footer
  const footerParts = [];
  if (poll.settings.anonymous) {
    footerParts.push('Anonymous Voting');
  } else {
    footerParts.push('Public Voting');
  }

  if (poll.settings.multipleChoice) {
    footerParts.push('Multiple Choice Allowed');
  } else {
    footerParts.push('Single Choice');
  }

  footerParts.push(`Total Voters: ${totalUniqueVoters}`);

  if (isEnded) {
    embed.setTitle(`📊 Ended Poll: ${poll.question}`);
    embed.setColor('#7f8c8d'); // neutral gray color for ended state
    footerParts.push('CLOSED');
  } else if (poll.settings.expiresAt) {
    const remainingMs = new Date(poll.settings.expiresAt) - new Date();
    if (remainingMs > 0) {
      footerParts.push(`Expires: ${new Date(poll.settings.expiresAt).toLocaleString()}`);
    } else {
      footerParts.push('CLOSED');
    }
  }

  embed.setFooter({
    text: footerParts.join(' • '),
    iconURL: guild ? guild.iconURL({ size: 128 }) || undefined : undefined
  });

  if (poll.settings.thumbnailUrl) {
    embed.setThumbnail(poll.settings.thumbnailUrl);
  }
  if (poll.settings.imageUrl) {
    embed.setImage(poll.settings.imageUrl);
  }

  return embed;
}

/**
 * Generates action row buttons for voting.
 * @param {Object} poll - The database Poll document.
 */
function renderPollComponents(poll) {
  const isEnded = poll.status === 'ended';
  const rows = [];
  let currentRow = new ActionRowBuilder();

  poll.options.forEach((opt, index) => {
    if (index > 0 && index % 5 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }

    const button = new ButtonBuilder()
      .setCustomId(`pv_${poll._id}_${opt.id}`)
      .setLabel(opt.text.substring(0, 80))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(isEnded);

    currentRow.addComponents(button);
  });

  if (currentRow.components.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

async function sendPollMessage(channel, poll, guild) {
  const { AttachmentBuilder } = require('discord.js');
  const embed = renderPollEmbed(poll, guild);
  const components = renderPollComponents(poll);
  
  const files = [];
  try {
    const chartBuffer = await generatePollChart(poll);
    const attachment = new AttachmentBuilder(chartBuffer, { name: 'poll-chart.png' });
    embed.setImage('attachment://poll-chart.png');
    files.push(attachment);
  } catch (err) {
    console.error('[Poll Helper Error] Failed to attach poll chart:', err.message);
  }
  
  return await channel.send({
    embeds: [embed],
    components: components,
    files: files
  });
}

async function updatePollMessage(message, poll, guild) {
  const { AttachmentBuilder } = require('discord.js');
  const embed = renderPollEmbed(poll, guild);
  const components = renderPollComponents(poll);
  
  const files = [];
  try {
    const chartBuffer = await generatePollChart(poll);
    const attachment = new AttachmentBuilder(chartBuffer, { name: 'poll-chart.png' });
    embed.setImage('attachment://poll-chart.png');
    files.push(attachment);
  } catch (err) {
    console.error('[Poll Helper Error] Failed to attach poll chart:', err.message);
  }
  
  await message.edit({
    embeds: [embed],
    components: components,
    files: files
  });
}

module.exports = {
  renderPollEmbed,
  renderPollComponents,
  generatePollChart,
  sendPollMessage,
  updatePollMessage
};
