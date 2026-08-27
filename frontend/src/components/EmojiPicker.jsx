import React, { useState, useEffect, useRef } from 'react';
import { Smile, Search, X, Sparkles } from 'lucide-react';

export const QUICK_ANNOUNCEMENT_EMOJIS = [
  '📢', '📣', '🎉', '🔥', '🚀', '⭐', '📌', '💬', 
  '✅', '⚠️', '❌', '❤️', '✨', '🎯', '💡', '🔔', 
  '🎁', '🏆', '👑', '🥳', '👋', '🤖', '🌐', '🛡️',
  '💎', '⚡', '🔴', '🟢', '🎨', '📝', '🎮', '🎫'
];

export function insertEmojiAtCursor(inputRef, currentValue, emoji, onChange) {
  const val = currentValue || '';
  let newValue = '';
  if (inputRef && inputRef.current) {
    const input = inputRef.current;
    const start = input.selectionStart ?? val.length;
    const end = input.selectionEnd ?? val.length;
    newValue = val.substring(0, start) + emoji + val.substring(end);
    if (typeof onChange === 'function') {
      onChange(newValue);
    }
    setTimeout(() => {
      try {
        input.focus();
        const newPos = start + emoji.length;
        input.setSelectionRange(newPos, newPos);
      } catch (e) {
        // Selection range fallback
      }
    }, 10);
  } else {
    newValue = val + emoji;
    if (typeof onChange === 'function') {
      onChange(newValue);
    }
  }
  return newValue;
}

/**
 * Quick Emoji Bar with 1-click popular emoji chips + popover toggle button
 */
export function QuickEmojiBar({ onSelectEmoji, onOpenPicker, selectedCount = 0 }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '6px',
      margin: '6px 0 10px 0',
      padding: '8px 10px',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '6px' }}>
        <Sparkles size={14} style={{ color: '#3b82f6' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
          Quick Emojis:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', flex: 1 }}>
        {QUICK_ANNOUNCEMENT_EMOJIS.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            title={`Add ${emoji}`}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '4px 7px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.25)';
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {onOpenPicker && (
        <button
          type="button"
          onClick={onOpenPicker}
          className="btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: '600',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#60a5fa'
          }}
        >
          <Smile size={14} />
          More Emojis...
        </button>
      )}
    </div>
  );
}

/**
 * Full Emoji Picker Modal Popover
 */
export default function EmojiPicker({ isOpen, onClose, onSelectEmoji }) {
  const [activeCategory, setActiveCategory] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter emojis based on query
  const getFilteredEmojis = () => {
    if (!searchQuery.trim()) {
      const cat = EMOJI_CATEGORIES.find(c => c.id === activeCategory);
      return cat ? cat.emojis : [];
    }
    const q = searchQuery.toLowerCase().trim();
    const results = [];
    EMOJI_CATEGORIES.forEach(cat => {
      cat.emojis.forEach(e => {
        if (e.char.includes(q) || e.keywords.toLowerCase().includes(q)) {
          if (!results.some(item => item.char === e.char)) {
            results.push(e);
          }
        }
      });
    });
    return results;
  };

  const filtered = getFilteredEmojis();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      backdropFilter: 'blur(4px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#121624',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '520px'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa'
            }}>
              <Smile size={18} />
            </div>
            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#f3f4f6' }}>
              Select Emoji
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'none'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div style={{ padding: '12px 16px 8px 16px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search emojis (e.g. fire, star, announcement)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{
                paddingLeft: '34px',
                fontSize: '0.85rem',
                height: '36px',
                width: '100%',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)'
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {!searchQuery && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 16px 8px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            overflowX: 'auto'
          }}>
            {EMOJI_CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  title={cat.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    color: isActive ? '#60a5fa' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? '600' : 'normal',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Emojis Grid Container */}
        <div style={{
          padding: '12px 16px',
          overflowY: 'auto',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          alignContent: 'start'
        }}>
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onSelectEmoji(item.char);
                }}
                title={`${item.char} - ${item.keywords}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  height: '42px',
                  fontSize: '1.35rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2)';
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.25)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                }}
              >
                {item.char}
              </button>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              padding: '30px 0',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}>
              No matching emojis found for "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <span>Click any emoji to insert at cursor</span>
          <span style={{ fontSize: '0.7rem' }}>{filtered.length} emojis</span>
        </div>
      </div>
    </div>
  );
}
