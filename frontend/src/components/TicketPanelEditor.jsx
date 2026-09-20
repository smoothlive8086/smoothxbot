import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Rocket, 
  Plus, 
  Trash2, 
  Copy, 
  User, 
  Link, 
  Image as ImageIcon, 
  Smile, 
  Type, 
  GripVertical, 
  Palette, 
  Ticket,
  ChevronDown,
  Layers,
  Send
} from 'lucide-react';
import './TicketPanelEditor.css';

export default function TicketPanelEditor({
  settings = {},
  channels = [],
  categories = [],
  roles = [],
  handleInputChange,
  handlePublishTickets,
  saving = false
}) {
  const ticketData = settings.tickets || {};

  // Mode: 'live' or 'preview'
  const [editorMode, setEditorMode] = useState('live');

  // Embeds state (array of embed objects)
  const [embeds, setEmbeds] = useState(() => {
    if (Array.isArray(ticketData.embeds) && ticketData.embeds.length > 0) {
      return ticketData.embeds;
    }
    return [{
      id: 'embed_1',
      title: ticketData.title || 'Support Ticket System',
      titleUrl: ticketData.titleUrl || '',
      description: ticketData.welcomeMessage || 'Click an option below to open a ticket. Our support team will assist you shortly.',
      color: ticketData.color || '#5865f2',
      authorName: ticketData.authorName || '',
      authorUrl: ticketData.authorUrl || '',
      authorIconUrl: ticketData.authorIconUrl || '',
      imageUrl: ticketData.imageUrl || '',
      thumbnailUrl: ticketData.thumbnailUrl || '',
      footerText: ticketData.footerText || '',
      footerIconUrl: ticketData.footerIconUrl || ''
    }];
  });

  const [activeEmbedIndex, setActiveEmbedIndex] = useState(0);

  // Message content optional field above embeds
  const [messageContent, setMessageContent] = useState(ticketData.messageContent || '');

  // Options / Buttons array
  const [options, setOptions] = useState(() => {
    if (Array.isArray(ticketData.options) && ticketData.options.length > 0) {
      return ticketData.options;
    }
    return [{
      id: 'opt_1',
      label: ticketData.buttonText || 'General Support',
      emoji: '🎧',
      style: 'primary',
      description: 'Get help from our support staff',
      categoryId: ticketData.categoryId || '',
      supportRoleId: ticketData.supportRoleId || '',
      title: 'Support Ticket',
      ticketMessage: 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.'
    }];
  });

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Component type: 'buttons' or 'select'
  const componentType = ticketData.componentType || 'buttons';

  // Sync back to parent settings
  const syncToParent = (updatedEmbeds, updatedOptions, updatedMsg, updatedCompType) => {
    const activeEmb = updatedEmbeds[activeEmbedIndex] || updatedEmbeds[0] || {};
    const primaryOpt = updatedOptions[0] || {};

    const updatedTickets = {
      ...ticketData,
      embeds: updatedEmbeds,
      options: updatedOptions,
      messageContent: updatedMsg,
      componentType: updatedCompType,
      // Backward compatibility fields
      title: activeEmb.title || 'Support Ticket System',
      welcomeMessage: activeEmb.description || '',
      color: activeEmb.color || '#5865f2',
      authorName: activeEmb.authorName || '',
      authorUrl: activeEmb.authorUrl || '',
      authorIconUrl: activeEmb.authorIconUrl || '',
      imageUrl: activeEmb.imageUrl || '',
      thumbnailUrl: activeEmb.thumbnailUrl || '',
      footerText: activeEmb.footerText || '',
      footerIconUrl: activeEmb.footerIconUrl || '',
      buttonText: primaryOpt.label || 'Create Ticket',
      categoryId: primaryOpt.categoryId || '',
      supportRoleId: primaryOpt.supportRoleId || '',
      ticketMessage: primaryOpt.ticketMessage || ''
    };

    handleInputChange('tickets', updatedTickets);
  };

  // Embed Handlers
  const handleUpdateActiveEmbed = (field, value) => {
    const nextEmbeds = embeds.map((emb, idx) => {
      if (idx === activeEmbedIndex) {
        return { ...emb, [field]: value };
      }
      return emb;
    });
    setEmbeds(nextEmbeds);
    syncToParent(nextEmbeds, options, messageContent, componentType);
  };

  const handleAddEmbed = () => {
    if (embeds.length >= 5) return;
    const newEmb = {
      id: `embed_${Date.now()}`,
      title: `Embed ${embeds.length + 1}`,
      titleUrl: '',
      description: 'Enter embed description here...',
      color: '#5865f2',
      authorName: '',
      authorUrl: '',
      authorIconUrl: '',
      imageUrl: '',
      thumbnailUrl: '',
      footerText: '',
      footerIconUrl: ''
    };
    const nextEmbeds = [...embeds, newEmb];
    setEmbeds(nextEmbeds);
    setActiveEmbedIndex(nextEmbeds.length - 1);
    syncToParent(nextEmbeds, options, messageContent, componentType);
  };

  const handleDuplicateEmbed = (index, e) => {
    e.stopPropagation();
    if (embeds.length >= 5) return;
    const target = embeds[index];
    const duplicated = {
      ...target,
      id: `embed_${Date.now()}`,
      title: `${target.title} (Copy)`
    };
    const nextEmbeds = [...embeds];
    nextEmbeds.splice(index + 1, 0, duplicated);
    setEmbeds(nextEmbeds);
    setActiveEmbedIndex(index + 1);
    syncToParent(nextEmbeds, options, messageContent, componentType);
  };

  const handleDeleteEmbed = (index, e) => {
    e.stopPropagation();
    if (embeds.length <= 1) return;
    const nextEmbeds = embeds.filter((_, idx) => idx !== index);
    setEmbeds(nextEmbeds);
    setActiveEmbedIndex(Math.max(0, index - 1));
    syncToParent(nextEmbeds, options, messageContent, componentType);
  };

  // Option / Button Handlers
  const handleUpdateOption = (index, field, value) => {
    const nextOptions = options.map((opt, idx) => {
      if (idx === index) {
        return { ...opt, [field]: value };
      }
      return opt;
    });
    setOptions(nextOptions);
    syncToParent(embeds, nextOptions, messageContent, componentType);
  };

  const handleAddOption = () => {
    if (options.length >= 5) return;
    const newOpt = {
      id: `opt_${Date.now()}`,
      label: `Support ${options.length + 1}`,
      emoji: '🎫',
      style: 'primary',
      description: '',
      categoryId: ticketData.categoryId || '',
      supportRoleId: ticketData.supportRoleId || '',
      title: 'Support Ticket',
      ticketMessage: 'Welcome {user}! Support staff will assist you shortly.'
    };
    const nextOptions = [...options, newOpt];
    setOptions(nextOptions);
    setSelectedOptionIndex(nextOptions.length - 1);
    syncToParent(embeds, nextOptions, messageContent, componentType);
  };

  const handleDeleteOption = (index, e) => {
    if (e) e.stopPropagation();
    if (options.length <= 1) return;
    const nextOptions = options.filter((_, idx) => idx !== index);
    setOptions(nextOptions);
    setSelectedOptionIndex(Math.max(0, index - 1));
    syncToParent(embeds, nextOptions, messageContent, componentType);
  };

  const handleComponentTypeChange = (newType) => {
    syncToParent(embeds, options, messageContent, newType);
  };

  const currentEmbed = embeds[activeEmbedIndex] || embeds[0] || {};
  const currentOption = options[selectedOptionIndex] || options[0] || {};

  const commonEmojis = ['🎧', '🎫', '🛠️', '❓', '🔒', '⭐', '📢', '💬', '🤖', '🔥'];

  return (
    <div className="tpe-container">
      {/* Top Banner Settings Bar */}
      <div className="tpe-card" style={{ padding: '16px 20px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={20} color="#5865f2" /> Ticket Panel Builder
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#8e9297', margin: 0 }}>
            Configure multi-embed layouts, button interaction rows, target categories, and support team roles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={ticketData.channelId || ''}
            onChange={(e) => handleInputChange('tickets.channelId', e.target.value)}
            className="tpe-input no-icon"
            style={{ width: '220px' }}
          >
            <option value="">-- Target Ticket Channel --</option>
            {channels.map(ch => (
              <option key={ch.id} value={ch.id}>#{ch.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={handlePublishTickets}
            disabled={saving || !ticketData.channelId}
            className="tpe-pill-btn active"
            style={{ padding: '8px 16px', background: '#248046', borderColor: '#248046', color: '#fff' }}
          >
            <Send size={14} /> {saving ? 'Publishing...' : 'Publish Panel'}
          </button>
        </div>
      </div>

      <div className="tpe-grid">
        {/* =================================================== */}
        {/* LEFT COLUMN: PANEL PREVIEW & INTERACTION STRUCTURE  */}
        {/* =================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Panel Preview Header Box */}
          <div className="tpe-card">
            <div className="tpe-card-header">
              <div>
                <h4 className="tpe-card-title">Panel Preview</h4>
                <div className="tpe-card-subtitle">Select a panel element to edit</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditorMode('preview')}
                  className={`tpe-pill-btn ${editorMode === 'preview' ? 'active' : ''}`}
                >
                  <Eye size={13} /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('live')}
                  className={`tpe-pill-btn ${editorMode === 'live' ? 'active' : ''}`}
                >
                  <Rocket size={13} /> Live Editing
                </button>
              </div>
            </div>

            {/* Optional Message Content Textarea */}
            <div className="tpe-input-group">
              <label className="tpe-input-label">Message Content (optional)</label>
              <textarea
                className="tpe-textarea"
                style={{ minHeight: '60px' }}
                placeholder="Message Content (optional)"
                value={messageContent}
                onChange={(e) => {
                  setMessageContent(e.target.value);
                  syncToParent(embeds, options, e.target.value, componentType);
                }}
              />
            </div>

            {/* Embed Cards Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {embeds.map((emb, idx) => (
                <div
                  key={emb.id || idx}
                  onClick={() => setActiveEmbedIndex(idx)}
                  className={`tpe-embed-card ${activeEmbedIndex === idx ? 'selected' : ''}`}
                >
                  <div className="tpe-embed-card-header">
                    <span className="tpe-embed-card-title">
                      <Layers size={14} color={emb.color || '#5865f2'} />
                      {emb.title || `Embed ${idx + 1}`}
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="tpe-action-link"
                        onClick={(e) => handleDuplicateEmbed(idx, e)}
                        title="Duplicate Embed"
                      >
                        <Copy size={13} /> Duplicate embed
                      </button>
                      {embeds.length > 1 && (
                        <button
                          type="button"
                          className="tpe-action-link danger"
                          onClick={(e) => handleDeleteEmbed(idx, e)}
                          title="Delete Embed"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {embeds.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddEmbed}
                  className="tpe-dashed-add-btn"
                >
                  <Plus size={14} /> Add Embed
                </button>
              )}
            </div>

            {/* Interaction Area Header */}
            <div className="tpe-divider">
              <span className="tpe-divider-title">Interaction Area</span>
              <span style={{ fontSize: '0.75rem', color: '#72767d' }}>Rows available [{options.length}/5]</span>
            </div>

            {/* Component Rows List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="tpe-row-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', fontWeight: '600', color: '#fff' }}>
                    <GripVertical size={14} color="#72767d" /> 
                    {componentType === 'select' ? 'Select Menu Row' : 'Button Row'}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="tpe-action-link"
                      onClick={() => handleComponentTypeChange(componentType === 'buttons' ? 'select' : 'buttons')}
                    >
                      Toggle {componentType === 'buttons' ? 'Dropdown' : 'Buttons'}
                    </button>
                  </div>
                </div>

                {/* Option Buttons inside Row */}
                <div className="tpe-button-chips-list">
                  {options.map((opt, oIdx) => (
                    <div
                      key={opt.id || oIdx}
                      className={`tpe-button-chip ${selectedOptionIndex === oIdx ? 'selected' : ''}`}
                      onClick={() => setSelectedOptionIndex(oIdx)}
                    >
                      <GripVertical size={12} color="#72767d" />
                      <span>{opt.emoji || '🎧'}</span>
                      <span>{opt.label || `Button ${oIdx + 1}`}</span>
                    </div>
                  ))}

                  {options.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="tpe-chip-add"
                    >
                      + Add Button
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons at Bottom */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleComponentTypeChange('buttons');
                    handleAddOption();
                  }}
                  disabled={options.length >= 5}
                  className="tpe-pill-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Plus size={13} /> Add Button Row
                </button>
                <button
                  type="button"
                  onClick={() => handleComponentTypeChange('select')}
                  className={`tpe-pill-btn ${componentType === 'select' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Plus size={13} /> Dropdown Menu
                </button>
              </div>
            </div>
          </div>

          {/* Live Discord Embed Card Preview (Visual rendering) */}
          <div className="tpe-card" style={{ background: '#1e1f22' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#949ba4', textTransform: 'uppercase' }}>
              Discord Client Preview
            </span>

            {messageContent && (
              <div style={{ fontSize: '0.9rem', color: '#dbdee1', whiteSpace: 'pre-wrap' }}>
                {messageContent}
              </div>
            )}

            <div 
              className="tpe-discord-embed-preview" 
              style={{ borderLeftColor: currentEmbed.color || '#5865f2' }}
            >
              {currentEmbed.authorName && (
                <div className="tpe-embed-preview-author">
                  {currentEmbed.authorIconUrl && (
                    <img src={currentEmbed.authorIconUrl} alt="" className="tpe-embed-preview-author-icon" />
                  )}
                  <span>{currentEmbed.authorName}</span>
                </div>
              )}

              {currentEmbed.title && (
                <div className="tpe-embed-preview-title">
                  {currentEmbed.title}
                </div>
              )}

              {currentEmbed.description && (
                <div className="tpe-embed-preview-desc">
                  {currentEmbed.description}
                </div>
              )}

              {currentEmbed.imageUrl && (
                <img 
                  src={currentEmbed.imageUrl} 
                  alt="embed media" 
                  style={{ width: '100%', borderRadius: '4px', marginTop: '6px', maxHeight: '200px', objectFit: 'cover' }} 
                />
              )}

              {currentEmbed.footerText && (
                <div className="tpe-embed-preview-footer">
                  {currentEmbed.footerIconUrl && (
                    <img src={currentEmbed.footerIconUrl} alt="" className="tpe-embed-preview-footer-icon" />
                  )}
                  <span>{currentEmbed.footerText}</span>
                </div>
              )}
            </div>

            {/* Buttons Preview inside Discord */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {componentType === 'select' ? (
                <div style={{ width: '100%', background: '#2b2d31', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '8px 12px', color: '#949ba4', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Select a ticket category...</span>
                  <ChevronDown size={14} />
                </div>
              ) : (
                options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    style={{
                      background: opt.style === 'secondary' ? '#4e5058' : opt.style === 'success' ? '#248046' : opt.style === 'danger' ? '#da373c' : '#5865f2',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '6px 14px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'default'
                    }}
                  >
                    <span>{opt.emoji || '🎫'}</span>
                    <span>{opt.label || 'Ticket'}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =================================================== */}
        {/* RIGHT COLUMN: EMBED / ELEMENT INSPECTOR EDITOR       */}
        {/* =================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Top Bar Inspector Header & Color Picker */}
          <div className="tpe-card" style={{ padding: '14px 20px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
              Editing: <span style={{ color: '#7983f5' }}>{currentEmbed.title || `Embed ${activeEmbedIndex + 1}`}</span>
            </span>

            <label className="tpe-color-pill">
              <span 
                className="tpe-color-swatch" 
                style={{ backgroundColor: currentEmbed.color || '#5865f2' }} 
              />
              <span className="tpe-color-text">Change Color</span>
              <input
                type="color"
                value={currentEmbed.color || '#5865f2'}
                onChange={(e) => handleUpdateActiveEmbed('color', e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
              />
            </label>
          </div>

          {/* AUTHOR INFORMATION SECTION */}
          <div className="tpe-card">
            <div>
              <h4 className="tpe-card-title">Author Information</h4>
              <div className="tpe-card-subtitle">Information that is displayed at the top of the embed.</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="tpe-input-group">
                <label className="tpe-input-label">Author Name</label>
                <div className="tpe-input-wrapper">
                  <User className="tpe-input-icon" />
                  <input
                    type="text"
                    className="tpe-input"
                    placeholder="Enter author name..."
                    value={currentEmbed.authorName || ''}
                    onChange={(e) => handleUpdateActiveEmbed('authorName', e.target.value)}
                  />
                </div>
              </div>

              <div className="tpe-input-group">
                <label className="tpe-input-label">Author URL</label>
                <div className="tpe-input-wrapper">
                  <Link className="tpe-input-icon" />
                  <input
                    type="text"
                    className="tpe-input"
                    placeholder="https://example.com"
                    value={currentEmbed.authorUrl || ''}
                    onChange={(e) => handleUpdateActiveEmbed('authorUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="tpe-input-group">
              <label className="tpe-input-label">Author Icon URL</label>
              <div className="tpe-input-wrapper">
                <ImageIcon className="tpe-input-icon" />
                <input
                  type="text"
                  className="tpe-input"
                  placeholder="https://example.com/image.png"
                  value={currentEmbed.authorIconUrl || ''}
                  onChange={(e) => handleUpdateActiveEmbed('authorIconUrl', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* EMBED CONTENT SECTION */}
          <div className="tpe-card">
            <div>
              <h4 className="tpe-card-title">Embed Content</h4>
              <div className="tpe-card-subtitle">
                Edit the main content of the embed. You can use Markdown to add extra styles and formatting.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="tpe-input-group">
                <label className="tpe-input-label">Title</label>
                <div className="tpe-input-wrapper">
                  <Type className="tpe-input-icon" />
                  <input
                    type="text"
                    className="tpe-input"
                    placeholder="Embed Title"
                    value={currentEmbed.title || ''}
                    onChange={(e) => handleUpdateActiveEmbed('title', e.target.value)}
                  />
                </div>
              </div>

              <div className="tpe-input-group">
                <label className="tpe-input-label">Title URL</label>
                <div className="tpe-input-wrapper">
                  <Link className="tpe-input-icon" />
                  <input
                    type="text"
                    className="tpe-input"
                    placeholder="https://example.com"
                    value={currentEmbed.titleUrl || ''}
                    onChange={(e) => handleUpdateActiveEmbed('titleUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Description Textarea */}
            <div className="tpe-input-group">
              <label className="tpe-input-label">Description</label>
              <div className="tpe-textarea-wrapper">
                <textarea
                  className="tpe-textarea"
                  placeholder="Enter description..."
                  rows={4}
                  maxLength={4096}
                  value={currentEmbed.description || ''}
                  onChange={(e) => handleUpdateActiveEmbed('description', e.target.value)}
                />
                <button
                  type="button"
                  className="tpe-emoji-btn"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile size={16} />
                </button>
                <div className="tpe-char-counter">
                  {(currentEmbed.description || '').length}/4096
                </div>
              </div>

              {/* Emoji Quick Bar */}
              {showEmojiPicker && (
                <div style={{ display: 'flex', gap: '6px', background: '#17191e', padding: '8px', borderRadius: '6px', marginTop: '4px' }}>
                  {commonEmojis.map(emo => (
                    <button
                      key={emo}
                      type="button"
                      style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer' }}
                      onClick={() => {
                        handleUpdateActiveEmbed('description', (currentEmbed.description || '') + ' ' + emo);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MEDIA CONTENT SECTION */}
          <div className="tpe-card">
            <div>
              <h4 className="tpe-card-title">Media Content</h4>
              <div className="tpe-card-subtitle">Set up the embed's thumbnail and main image.</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="tpe-input-group">
                <label className="tpe-input-label">Image URL</label>
                <div className="tpe-input-wrapper">
                  <ImageIcon className="tpe-input-icon" />
                  <input
                    type="text"
                    className="tpe-input"
                    placeholder="https://example.com/image.png"
                    value={currentEmbed.imageUrl || ''}
                    onChange={(e) => handleUpdateActiveEmbed('imageUrl', e.target.value)}
                  />
                </div>
              </div>

              <div className="tpe-input-group">
                <label className="tpe-input-label">Thumbnail URL</label>
                <div className="tpe-input-wrapper">
                  <ImageIcon className="tpe-input-icon" />
                  <input
                    type="text"
                    className="tpe-input"
                    placeholder="https://example.com/thumbnail.png"
                    value={currentEmbed.thumbnailUrl || ''}
                    onChange={(e) => handleUpdateActiveEmbed('thumbnailUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER CONTENT SECTION */}
          <div className="tpe-card">
            <div>
              <h4 className="tpe-card-title">Footer Content</h4>
              <div className="tpe-card-subtitle">Appears at the bottom of the embed.</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="tpe-input-group">
                <label className="tpe-input-label">Footer Text</label>
                <div className="tpe-input-wrapper">
                  <Type className="tpe-input-icon" />
                  <input
                    type="text"
                    className="tpe-input"
                    placeholder="Enter footer text..."
                    value={currentEmbed.footerText || ''}
                    onChange={(e) => handleUpdateActiveEmbed('footerText', e.target.value)}
                  />
                </div>
              </div>

              <div className="tpe-input-group">
                <label className="tpe-input-label">Footer Icon URL</label>
                <div className="tpe-input-wrapper">
                  <ImageIcon className="tpe-input-icon" />
                  <input
                    type="text"
                    className="tpe-input"
                    placeholder="https://example.com/icon.png"
                    value={currentEmbed.footerIconUrl || ''}
                    onChange={(e) => handleUpdateActiveEmbed('footerIconUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BUTTON / OPTION TARGET BINDINGS SECTION */}
          <div className="tpe-card" style={{ borderColor: 'rgba(88, 101, 242, 0.3)' }}>
            <div className="tpe-card-header">
              <div>
                <h4 className="tpe-card-title" style={{ color: '#7983f5' }}>
                  Selected Option Settings: {currentOption.label || `Option #${selectedOptionIndex + 1}`}
                </h4>
                <div className="tpe-card-subtitle">Configure Discord ticket category, roles, and automated responses.</div>
              </div>

              {options.length > 1 && (
                <button
                  type="button"
                  className="tpe-action-link danger"
                  onClick={() => handleDeleteOption(selectedOptionIndex)}
                >
                  <Trash2 size={13} /> Remove Option
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="tpe-input-group">
                <label className="tpe-input-label">Button Label</label>
                <input
                  type="text"
                  className="tpe-input no-icon"
                  value={currentOption.label || ''}
                  onChange={(e) => handleUpdateOption(selectedOptionIndex, 'label', e.target.value)}
                  placeholder="e.g. General Support"
                />
              </div>

              <div className="tpe-input-group">
                <label className="tpe-input-label">Emoji</label>
                <input
                  type="text"
                  className="tpe-input no-icon"
                  value={currentOption.emoji || ''}
                  onChange={(e) => handleUpdateOption(selectedOptionIndex, 'emoji', e.target.value)}
                  placeholder="e.g. 🎧"
                />
              </div>

              <div className="tpe-input-group">
                <label className="tpe-input-label">Button Style</label>
                <select
                  className="tpe-input no-icon"
                  value={currentOption.style || 'primary'}
                  onChange={(e) => handleUpdateOption(selectedOptionIndex, 'style', e.target.value)}
                >
                  <option value="primary">Primary (Blue)</option>
                  <option value="secondary">Secondary (Grey)</option>
                  <option value="success">Success (Green)</option>
                  <option value="danger">Danger (Red)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="tpe-input-group">
                <label className="tpe-input-label">Ticket Category Channel</label>
                <select
                  className="tpe-input no-icon"
                  value={currentOption.categoryId || ''}
                  onChange={(e) => handleUpdateOption(selectedOptionIndex, 'categoryId', e.target.value)}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="tpe-input-group">
                <label className="tpe-input-label">Support Role</label>
                <select
                  className="tpe-input no-icon"
                  value={currentOption.supportRoleId || ''}
                  onChange={(e) => handleUpdateOption(selectedOptionIndex, 'supportRoleId', e.target.value)}
                >
                  <option value="">-- Select Support Role --</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tpe-input-group">
              <label className="tpe-input-label">Ticket Channel Welcome Message</label>
              <textarea
                className="tpe-textarea"
                style={{ minHeight: '60px' }}
                value={currentOption.ticketMessage || ''}
                onChange={(e) => handleUpdateOption(selectedOptionIndex, 'ticketMessage', e.target.value)}
                placeholder="Welcome {user}! Support staff will assist you shortly."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
