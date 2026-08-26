import React, { useState, useEffect, useRef } from 'react';
import { Hash, ChevronRight } from 'lucide-react';

/**
 * ChannelMentionInput Component
 * Renders an input or textarea that shows an autocompletion overlay listing
 * Discord server channels when the user types '#' symbol.
 */
const ChannelMentionIn
put = ({
  value = '',
  onChange,
  channels = [],
  placeholder = '',
  rows = 3,
  multiline = false,
  className = 'glass-input',
  style = {},
  maxLength,
  disabled = false,
  name,
  onKeyDown
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hashPosition, setHashPosition] = useState(-1);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Filter text channels by search query
  const filteredChannels = (channels || []).filter(ch =>
    ch && ch.name && ch.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  // Check cursor position for '#' trigger
  const checkTrigger = () => {
    const el = inputRef.current;
    if (!el) return;

    const val = el.value || '';
    const cursor = el.selectionStart || 0;
    const textBeforeCursor = val.substring(0, cursor);

    const lastHashIndex = textBeforeCursor.lastIndexOf('#');

    if (lastHashIndex !== -1) {
      const charBeforeHash = lastHashIndex > 0 ? textBeforeCursor[lastHashIndex - 1] : ' ';
      const validBefore = lastHashIndex === 0 || /\s|[({:;,.]/.test(charBeforeHash);
      const textAfterHash = textBeforeCursor.substring(lastHashIndex + 1);
      const hasSpaceOrEnd = /\s|>|}/.test(textAfterHash);

      if (validBefore && !hasSpaceOrEnd) {
        setSearchQuery(textAfterHash);
        setHashPosition(lastHashIndex);
        setIsOpen(true);
        setSelectedIndex(0);
        return;
      }
    }

    setIsOpen(false);
  };

  const handleSelectChannel = (channel) => {
    if (!channel) return;
    const el = inputRef.current;
    const val = value || '';
    const cursor = el ? el.selectionStart : val.length;

    const beforeHash = val.substring(0, hashPosition);
    const afterCursor = val.substring(cursor);

    const mentionText = `<#${channel.id}>`;
    const newValue = beforeHash + mentionText + afterCursor;
    const newCursorPos = beforeHash.length + mentionText.length;

    if (onChange) {
      onChange({
        target: {
          name: name || '',
          value: newValue
        }
      });
    }

    setIsOpen(false);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDownInternal = (e) => {
    if (isOpen && filteredChannels.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredChannels.length);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredChannels.length) % filteredChannels.length);
        return;
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectChannel(filteredChannels[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        return;
      }
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Make sure selectedIndex stays within bounds when list length changes
  useEffect(() => {
    if (selectedIndex >= filteredChannels.length) {
      setSelectedIndex(0);
    }
  }, [filteredChannels.length, selectedIndex]);

  const InputTag = multiline ? 'textarea' : 'input';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <InputTag
        ref={inputRef}
        value={value}
        onChange={(e) => {
          if (onChange) onChange(e);
          setTimeout(checkTrigger, 0);
        }}
        onClick={checkTrigger}
        onKeyUp={checkTrigger}
        onKeyDown={handleKeyDownInternal}
        placeholder={placeholder}
        rows={multiline ? rows : undefined}
        className={className}
        style={style}
        maxLength={maxLength}
        disabled={disabled}
        name={name}
      />

      {isOpen && filteredChannels.length > 0 && (
        <div
          className="channel-mention-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '6px',
            backgroundColor: 'rgba(18, 20, 29, 0.98)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '10px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.15)',
            zIndex: 9999,
            maxHeight: '230px',
            overflowY: 'auto',
            padding: '6px'
          }}
        >
          <div
            style={{
              padding: '4px 10px 6px 10px',
              fontSize: '0.72rem',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '4px',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>Mention Channel ({filteredChannels.length})</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'none' }}>
              Press ↑↓ to navigate, Enter/Click to insert
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredChannels.map((channel, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={channel.id || idx}
                  onClick={() => handleSelectChannel(channel)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #38bdf8' : '3px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Hash size={15} style={{ color: isSelected ? '#38bdf8' : 'var(--text-secondary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                      {channel.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        color: 'var(--text-muted)',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      &lt;#{channel.id}&gt;
                    </span>
                    <ChevronRight size={14} style={{ color: isSelected ? '#38bdf8' : 'transparent' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelMentionInput;
