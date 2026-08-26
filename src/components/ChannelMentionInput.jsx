import React, { useState, useRef, useEffect } from 'react';
import { Hash, Megaphone, Folder, Sparkles } from 'lucide-react';

export default function ChannelMentionInput({
  isTextArea = false,
  value = '',
  onChange,
  channels = [],
  placeholder = '',
  className = 'glass-input',
  style = {},
  rows = 3,
  disabled = false,
  maxLength,
  id,
  name,
  ...props
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState('');
  const [hashPos, setHashPos] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Build candidate options (special redirect variables + server channels)
  const candidateOptions = [
    { id: 'var-channel', name: '{channel}', label: '{channel} - Redirect Channel 1', insertText: '{channel}', isSpecial: true },
    { id: 'var-channel2', name: '{channel2}', label: '{channel2} - Redirect Channel 2', insertText: '{channel2}', isSpecial: true },
    { id: 'var-channel3', name: '{channel3}', label: '{channel3} - Redirect Channel 3', insertText: '{channel3}', isSpecial: true },
    ...channels.map(c => ({
      id: c.id,
      name: c.name,
      label: `#${c.name}`,
      type: c.type,
      insertText: `<#${c.id}>`,
      isSpecial: false
    }))
  ];

  const filteredOptions = candidateOptions.filter(opt => {
    if (!query) return true;
    const q = query.toLowerCase();
    return opt.name.toLowerCase().includes(q) || opt.label.toLowerCase().includes(q) || opt.insertText.toLowerCase().includes(q);
  });

  // Keep selected index in bounds when options change
  useEffect(() => {
    if (selectedIndex >= filteredOptions.length) {
      setSelectedIndex(Math.max(0, filteredOptions.length - 1));
    }
  }, [filteredOptions.length]);

  // Scroll active item into view inside dropdown
  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const activeEl = dropdownRef.current.querySelector('.channel-option-active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, showDropdown]);

  const checkTrigger = (val, cursor) => {
    if (cursor === undefined || cursor === null) return;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/(?:^|\s|[^a-zA-Z0-9_])#([a-zA-Z0-9_\-]*)$/);

    if (match) {
      const q = match[1];
      const pos = textBeforeCursor.lastIndexOf('#');
      setQuery(q);
      setHashPos(pos);
      setCursorPos(cursor);
      setSelectedIndex(0);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleTextChange = (e) => {
    if (onChange) onChange(e);
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    checkTrigger(val, cursor);
  };

  const handleKeyUp = (e) => {
    // Only re-check trigger for arrow keys or click position changes
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      const cursor = e.target.selectionStart;
      checkTrigger(value, cursor);
    }
  };

  const handleClick = (e) => {
    const cursor = e.target.selectionStart;
    checkTrigger(value, cursor);
  };

  const selectOption = (opt) => {
    if (hashPos < 0) return;

    const el = inputRef.current;
    const currentVal = value || '';
    const currentCursor = el ? el.selectionStart : cursorPos;

    const before = currentVal.slice(0, hashPos);
    const after = currentVal.slice(currentCursor);
    const inserted = opt.insertText;
    const newVal = before + inserted + ' ' + after;

    if (onChange) {
      onChange({ target: { value: newVal, name, id } });
    }

    setShowDropdown(false);

    // Reset cursor position right after inserted channel mention
    const newCursorPos = before.length + inserted.length + 1;
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredOptions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      selectOption(filteredOptions[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
    }
  };

  const handleBlur = () => {
    // Timeout allows clicking option in dropdown before popup closes
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const commonProps = {
    ref: inputRef,
    value: value || '',
    onChange: handleTextChange,
    onKeyUp: handleKeyUp,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    placeholder: placeholder || 'Type # to mention a channel...',
    className,
    style,
    disabled,
    maxLength,
    id,
    name,
    ...props
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {isTextArea ? (
        <textarea rows={rows} {...commonProps} />
      ) : (
        <input type="text" {...commonProps} />
      )}

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="channel-mention-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#12151e',
            border: '1px solid rgba(0, 255, 102, 0.4)',
            borderRadius: '10px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
            zIndex: 99999,
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '6px'
          }}
        >
          <div
            style={{
              padding: '4px 8px 6px 8px',
              fontSize: '0.7rem',
              fontWeight: '700',
              color: '#00ff66',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Hash size={12} /> Select Channel Mention
            </span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>
              ↑↓ navigate • ↵ insert
            </span>
          </div>

          {filteredOptions.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              No matching channels found
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <div
                  key={opt.id}
                  className={`channel-option ${isActive ? 'channel-option-active' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(opt);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isActive ? 'rgba(0, 255, 102, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 255, 102, 0.3)' : '1px solid transparent',
                    color: isActive ? '#ffffff' : '#dbdee1',
                    transition: 'all 0.15s ease',
                    marginBottom: '2px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {opt.isSpecial ? (
                      <Sparkles size={14} style={{ color: '#3b82f6' }} />
                    ) : opt.type === 5 ? (
                      <Megaphone size={14} style={{ color: '#f59e0b' }} />
                    ) : (
                      <Hash size={14} style={{ color: '#00ff66' }} />
                    )}
                    <span style={{ fontSize: '0.85rem', fontWeight: isActive ? '600' : '400' }}>
                      {opt.name}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace'
                    }}
                  >
                    {opt.insertText}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
