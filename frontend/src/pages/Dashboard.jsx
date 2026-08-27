import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { io } from 'socket.io-client';
import CropModal from '../components/CropModal';
import AdminServerSettings from '../components/AdminServerSettings';
import EmojiPicker, { QuickEmojiBar, insertEmojiAtCursor } from '../components/EmojiPicker';
import {
  Shield,
  UserCheck,
  Sparkles,
  MessageSquare,
  Info,
  ChevronLeft,
  Save,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
  Send,
  Megaphone,
  Ticket,
  Trash2,
  Server,
  Edit3,
  Plus,
  Video,
  BarChart2,
  ShieldAlert,
  Home,
  LogOut,
  RotateCw,
  Mic,
  UploadCloud,
  X,
  Check,
  Hash,
  Search,
  Settings,
  Image as ImageIcon,
  Link as LinkIcon,
  Smile
} from 'lucide-react';

const Youtube = ({ size = 24, className = '', style = {} }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    style={style}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.969.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.389-.507a3.007 3.007 0 0 0 2.11-2.11C24 15.969 24 12 24 12s0-3.969-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);


// Discord Message Preview Component
function DiscordMessagePreview({
  botUser,
  guildName,
  guildIcon,
  message,
  buttonEnabled,
  buttonLabel,
  embedEnabled,
  embedTitle,
  embedDesc,
  embedColor,
  embedThumb,
  embedImage,
  isDM = false,
  // New props for expanded announcement features:
  pingType = 'none',
  pingRoleId = '',
  roles = [],
  embedAuthorEnabled = false,
  embedAuthorName = '',
  embedAuthorIcon = '',
  embedAuthorUrl = '',
  embedFooterEnabled = false,
  embedFooterText = '',
  embedFooterIcon = '',
  embedFields = [],
  buttons = []
}) {
  // Resolve placeholders
  const resolvePlaceholders = (text) => {
    if (!text) return '';
    return text
      .replace(/{username}/g, botUser?.username || 'Member')
      .replace(/{server}/g, guildName || 'Server');
  };

  // Prepend source header if it's a DM
  let contentText = resolvePlaceholders(message);
  if (isDM) {
    if (contentText) {
      contentText = `Sent from: **${guildName}**\n\n` + contentText;
    } else {
      contentText = `Sent from: **${guildName}**`;
    }
  }

  // Parse markdown bold **text** to <strong> tags for visual correctness
  const formatMarkdown = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} style={{ color: '#ffffff' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const botAvatar = botUser?.avatar
    ? `https://cdn.discordapp.com/avatars/${botUser.id}/${botUser.avatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  // Construct Ping mention preview node
  let pingPrefixNode = null;
  if (!isDM && pingType && pingType !== 'none') {
    let pingText = '';
    let pingColor = '#c9cdfb';
    if (pingType === 'everyone') {
      pingText = '@everyone';
    } else if (pingType === 'here') {
      pingText = '@here';
    } else if (pingType === 'role' && pingRoleId) {
      const targetRole = roles?.find(r => r.id === pingRoleId);
      pingText = targetRole ? `@${targetRole.name}` : '@deleted-role';
      if (targetRole && targetRole.color && targetRole.color !== '#000000') {
        pingColor = targetRole.color;
      }
    }

    if (pingText) {
      pingPrefixNode = (
        <span style={{
          backgroundColor: 'rgba(88, 101, 242, 0.3)',
          color: pingColor,
          padding: '0 4px',
          borderRadius: '3px',
          fontWeight: '500',
          marginRight: '6px',
          fontSize: '0.9rem',
          userSelect: 'none'
        }}>
          {pingText}
        </span>
      );
    }
  }

  return (
    <div style={{
      backgroundColor: '#313338',
      borderRadius: '12px',
      padding: '16px',
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      color: '#dbdee1',
      fontSize: '0.95rem',
      lineHeight: '1.375rem',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
      userSelect: 'none',
      width: '100%',
      maxWidth: '520px',
      height: 'fit-content',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <img
          src={botAvatar}
          alt="Avatar"
          style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }}
        />

        {/* Message body container */}
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '600', color: '#f2f3f5', fontSize: '1rem' }}>
              SMOOTH MODE
            </span>
            <span style={{
              backgroundColor: '#5865F2',
              color: '#ffffff',
              fontSize: '0.625rem',
              fontWeight: '700',
              padding: '1px 4px',
              borderRadius: '3px',
              display: 'inline-flex',
              alignItems: 'center',
              lineHeight: '0.8rem',
              height: '14px'
            }}>
              BOT
            </span>
            <span style={{ fontSize: '0.75rem', color: '#949ba4', marginLeft: '4px' }}>
              Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Message Content Text (including Ping badge) */}
          {(pingPrefixNode || contentText) && (
            <div style={{ color: '#dbdee1', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '4px', fontSize: '0.9375rem' }}>
              {pingPrefixNode}
              {formatMarkdown(contentText)}
            </div>
          )}

          {/* Embed Card */}
          {embedEnabled && (embedTitle || embedDesc || (embedFields && embedFields.length > 0)) && (
            <div style={{
              display: 'flex',
              marginTop: '8px',
              maxWidth: '520px',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundColor: '#2b2d31',
              borderLeft: `4px solid ${embedColor || '#2563eb'}`
            }}>
              {/* Embed Content Wrapper */}
              <div style={{ display: 'flex', padding: '12px 16px', flexGrow: 1, gap: '16px', justifyContent: 'space-between', minWidth: 0 }}>
                {/* Embed Main Text */}
                <div style={{ flexGrow: 1, minWidth: 0 }}>

                  {/* Embed Author */}
                  {((embedAuthorEnabled && embedAuthorName) || (!embedAuthorEnabled && guildName)) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {(embedAuthorEnabled ? embedAuthorIcon : guildIcon) ? (
                        <img
                          src={embedAuthorEnabled ? embedAuthorIcon : guildIcon}
                          alt=""
                          style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : null}
                      {embedAuthorEnabled && embedAuthorUrl ? (
                        <a
                          href={embedAuthorUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', textDecoration: 'none' }}
                          onClick={(e) => e.preventDefault()}
                        >
                          {resolvePlaceholders(embedAuthorName)}
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>
                          {embedAuthorEnabled ? resolvePlaceholders(embedAuthorName) : guildName}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Embed Title */}
                  {embedTitle && (
                    <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '1rem', marginBottom: '8px', wordBreak: 'break-word' }}>
                      {resolvePlaceholders(embedTitle)}
                    </div>
                  )}

                  {/* Embed Description */}
                  {embedDesc && (
                    <div style={{ fontSize: '0.875rem', color: '#dbdee1', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {resolvePlaceholders(embedDesc)}
                    </div>
                  )}

                  {/* Embed Fields */}
                  {embedFields && embedFields.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px 16px',
                      marginTop: '12px',
                      marginBottom: '4px'
                    }}>
                      {embedFields.map((field, idx) => {
                        if (!field.name || !field.value) return null;
                        const width = field.inline ? 'calc(33.3% - 11px)' : '100%';
                        return (
                          <div
                            key={idx}
                            style={{
                              flex: `1 0 ${field.inline ? '120px' : '100%'}`,
                              maxWidth: width,
                              wordBreak: 'break-word'
                            }}
                          >
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>
                              {resolvePlaceholders(field.name)}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#dbdee1', whiteSpace: 'pre-wrap' }}>
                              {resolvePlaceholders(field.value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Large Image */}
                  {embedImage && (
                    <div style={{ marginTop: '12px', borderRadius: '4px', overflow: 'hidden', maxWidth: '100%', maxHeight: '300px' }}>
                      <img src={embedImage} alt="" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '4px' }} />
                    </div>
                  )}

                  {/* Embed Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', color: '#949ba4', fontSize: '0.75rem' }}>
                    {(embedFooterEnabled ? embedFooterIcon : guildIcon) ? (
                      <img
                        src={embedFooterEnabled ? embedFooterIcon : guildIcon}
                        alt=""
                        style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : null}
                    <span>{embedFooterEnabled ? resolvePlaceholders(embedFooterText) : `${guildName} Official Announcement`}</span>
                    <span>•</span>
                    <span>Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                </div>

                {/* Thumbnail (if set) */}
                {embedThumb && (
                  <div style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={embedThumb} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {((buttons && buttons.length > 0) || (buttonEnabled && buttonLabel)) && (
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {buttons && buttons.length > 0 ? (
                buttons.map((btn, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: '#4e5058',
                      color: '#ffffff',
                      padding: '6px 16px',
                      borderRadius: '3px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <span>{btn.label}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </span>
                ))
              ) : (
                <span
                  style={{
                    backgroundColor: '#4e5058',
                    color: '#ffffff',
                    padding: '6px 16px',
                    borderRadius: '3px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span>{buttonLabel}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </span>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ guildId, guildName, guildIcon, memberCount, onBack, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [voiceChannels, setVoiceChannels] = useState([]);
  const [settings, setSettings] = useState(null);
  const [savedSettings, setSavedSettings] = useState(null);
  const [adminHasUnsavedChanges, setAdminHasUnsavedChanges] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Antinuke Whitelist state
  const [allMembers, setAllMembers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [searchedMembers, setSearchedMembers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedWhitelistEvents, setSelectedWhitelistEvents] = useState([]);
  const [failedIds, setFailedIds] = useState(new Set());
  const [modWhitelistSearchQuery, setModWhitelistSearchQuery] = useState('');
  const [modWhitelistSearchedMembers, setModWhitelistSearchedMembers] = useState([]);
  const [modWhitelistSearchLoading, setModWhitelistSearchLoading] = useState(false);

  const [logs, setLogs] = useState([]);
  const [logFilterCategory, setLogFilterCategory] = useState('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [showLogSettingsPanel, setShowLogSettingsPanel] = useState(true);
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [clearingLogs, setClearingLogs] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // Custom Mass-DM Broadcast State
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastButtonEnabled, setBroadcastButtonEnabled] = useState(false);
  const [broadcastButtonLabel, setBroadcastButtonLabel] = useState('');
  const [broadcastButtonUrl, setBroadcastButtonUrl] = useState('');
  const [broadcastButtons, setBroadcastButtons] = useState([]); // Multiple buttons support
  const [broadcastEmbedEnabled, setBroadcastEmbedEnabled] = useState(false);
  const [broadcastEmbedTitle, setBroadcastEmbedTitle] = useState('');
  const [broadcastEmbedDesc, setBroadcastEmbedDesc] = useState('');
  const [broadcastEmbedColor, setBroadcastEmbedColor] = useState('#2563eb');
  const [broadcastEmbedThumb, setBroadcastEmbedThumb] = useState('');
  const [broadcastEmbedImage, setBroadcastEmbedImage] = useState('');

  // Expanded Mass DM embed customization
  const [broadcastEmbedAuthorEnabled, setBroadcastEmbedAuthorEnabled] = useState(false);
  const [broadcastEmbedAuthorName, setBroadcastEmbedAuthorName] = useState('');
  const [broadcastEmbedAuthorIcon, setBroadcastEmbedAuthorIcon] = useState('');
  const [broadcastEmbedAuthorUrl, setBroadcastEmbedAuthorUrl] = useState('');
  const [broadcastEmbedFooterEnabled, setBroadcastEmbedFooterEnabled] = useState(false);
  const [broadcastEmbedFooterText, setBroadcastEmbedFooterText] = useState('');
  const [broadcastEmbedFooterIcon, setBroadcastEmbedFooterIcon] = useState('');
  const [broadcastEmbedFields, setBroadcastEmbedFields] = useState([]);

  // Mass DM filters
  const [broadcastExcludeRole, setBroadcastExcludeRole] = useState('');
  const [broadcastDelayInterval, setBroadcastDelayInterval] = useState(1);
  const [broadcastIsScheduled, setBroadcastIsScheduled] = useState(false);
  const [broadcastScheduledTime, setBroadcastScheduledTime] = useState('');
  const [scheduledDMs, setScheduledDMs] = useState([]);
  const [broadcastsList, setBroadcastsList] = useState([]);

  // Active broadcast progress tracking
  const [activeBroadcastProgress, setActiveBroadcastProgress] = useState(null);
  const [broadcasting, setBroadcasting] = useState(false);

  // Channel Publisher State
  const [pubChannelId, setPubChannelId] = useState('');
  const [pubMessage, setPubMessage] = useState('');
  const [pubButtonEnabled, setPubButtonEnabled] = useState(false);
  const [pubButtonLabel, setPubButtonLabel] = useState('');
  const [pubButtonUrl, setPubButtonUrl] = useState('');

  // Emoji picker state & refs
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTargetField, setEmojiTargetField] = useState('message'); // 'message' | 'embedTitle' | 'embedDesc'
  const [emojiTarget, setEmojiTarget] = useState(null); // { ref, value, onChange }
  const pubMessageRef = useRef(null);
  const pubEmbedTitleRef = useRef(null);
  const pubEmbedDescRef = useRef(null);
  const pubEmbedAuthorNameRef = useRef(null);
  const pubEmbedFooterTextRef = useRef(null);
  const broadcastMessageRef = useRef(null);
  const broadcastEmbedTitleRef = useRef(null);
  const broadcastEmbedDescRef = useRef(null);

  const openEmojiPickerFor = (ref, value, onChange) => {
    setEmojiTarget({ ref, value, onChange });
    setShowEmojiPicker(true);
  };

  // Expanded announcement features state hooks
  const [pubPingType, setPubPingType] = useState('none'); // 'none' | 'everyone' | 'here' | 'role'
  const [pubPingRoleId, setPubPingRoleId] = useState('');
  const [pubButtons, setPubButtons] = useState([]); // Array of { label, url }
  const [pubEmbedAuthorEnabled, setPubEmbedAuthorEnabled] = useState(false);
  const [pubEmbedAuthorName, setPubEmbedAuthorName] = useState('');
  const [pubEmbedAuthorIcon, setPubEmbedAuthorIcon] = useState('');
  const [pubEmbedAuthorUrl, setPubEmbedAuthorUrl] = useState('');
  const [pubEmbedFooterEnabled, setPubEmbedFooterEnabled] = useState(false);
  const [pubEmbedFooterText, setPubEmbedFooterText] = useState('');
  const [pubEmbedFooterIcon, setPubEmbedFooterIcon] = useState('');
  const [pubEmbedFields, setPubEmbedFields] = useState([]); // Array of { name, value, inline }

  const [pubEmbedEnabled, setPubEmbedEnabled] = useState(false);
  const [pubEmbedTitle, setPubEmbedTitle] = useState('');
  const [pubEmbedDesc, setPubEmbedDesc] = useState('');
  const [pubEmbedColor, setPubEmbedColor] = useState('#2563eb');
  const [pubEmbedThumb, setPubEmbedThumb] = useState('');
  const [pubEmbedImage, setPubEmbedImage] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [resolvingChannel, setResolvingChannel] = useState(false);
  const [resolveSuccessMsg, setResolveSuccessMsg] = useState('');

  const handleResolveYoutubeChannel = async () => {
    const channelUrlInput = settings?.youtube?.channelUrl;
    if (!channelUrlInput) {
      setErrorMsg('Please enter a YouTube channel URL or handle.');
      return;
    }

    setResolvingChannel(true);
    setResolveSuccessMsg('');
    setErrorMsg(null);
    try {
      const res = await api.resolveYoutubeChannel(guildId, channelUrlInput);
      handleInputChange('youtube.channelId', res.channelId);
      handleInputChange('youtube.channelName', res.channelName);
      handleInputChange('youtube.channelUrl', res.channelUrl);
      setResolveSuccessMsg(`Successfully connected to channel: ${res.channelName}`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to resolve YouTube channel.');
    } finally {
      setResolvingChannel(false);
    }
  };

  // Scheduling & Template states
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledAnnouncements, setScheduledAnnouncements] = useState([]);

  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateTypeForModal, setTemplateTypeForModal] = useState('announcement');

  // Premium Polls State Hooks
  const [polls, setPolls] = useState([]);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollDescription, setPollDescription] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollChannelId, setPollChannelId] = useState('');
  const [pollMultipleChoice, setPollMultipleChoice] = useState(false);
  const [pollAnonymous, setPollAnonymous] = useState(false);
  const [pollShowResultsBeforeEnding, setPollShowResultsBeforeEnding] = useState(true);
  const [pollExpiresAt, setPollExpiresAt] = useState('');
  const [pollColor, setPollColor] = useState('#2563eb');
  const [pollImageUrl, setPollImageUrl] = useState('');
  const [pollThumbnailUrl, setPollThumbnailUrl] = useState('');
  const [creatingPoll, setCreatingPoll] = useState(false);

  // Auto Moderation / Word Filter State Hooks
  const [wordFilterInput, setWordFilterInput] = useState('');
  const [wordFilterSearch, setWordFilterSearch] = useState('');
  const [showWordBulkModal, setShowWordBulkModal] = useState(false);
  const [wordBulkText, setWordBulkText] = useState('');
  const [wordFilterTestInput, setWordFilterTestInput] = useState('');
  const [wordWhitelistSearchQuery, setWordWhitelistSearchQuery] = useState('');

  const testWordFilter = (input, wordsList, strictMode = true) => {
    if (!input || !wordsList || wordsList.length === 0) {
      return { containsForbidden: false, detectedWord: null, matchedPattern: null };
    }
    const cleanInput = input.toLowerCase();
    const normalizedInput = input.toLowerCase().replace(/[^a-z0-9]/gi, '');

    for (const word of wordsList) {
      const w = word.trim().toLowerCase();
      if (!w) continue;
      if (cleanInput.includes(w)) {
        return { containsForbidden: true, detectedWord: w, matchedPattern: 'Direct Match' };
      }
      const cleanW = w.replace(/[^a-z0-9]/gi, '');
      if (strictMode && cleanW && normalizedInput.includes(cleanW)) {
        return { containsForbidden: true, detectedWord: w, matchedPattern: 'Separator / Anti-Bypass Match' };
      }
    }
    return { containsForbidden: false, detectedWord: null, matchedPattern: null };
  };




  const handleSendBroadcast = async (e) => {
    if (e) e.preventDefault();
    if (!broadcastMessage && (!broadcastEmbedEnabled || (!broadcastEmbedTitle && !broadcastEmbedDesc && broadcastEmbedFields.length === 0))) {
      setErrorMsg('Please enter a message or set up a valid embed title/description.');
      return;
    }

    if (broadcastIsScheduled && !broadcastScheduledTime) {
      setErrorMsg('Please select a release date & time for your scheduled broadcast.');
      return;
    }

    // Validation for link buttons
    let targetButtons = [...broadcastButtons];
    if (broadcastButtonEnabled && broadcastButtonLabel && broadcastButtonUrl) {
      targetButtons.push({ label: broadcastButtonLabel, url: broadcastButtonUrl });
    }
    const invalidButton = targetButtons.find(btn => !btn.label || !btn.url);
    if (invalidButton) {
      setErrorMsg('All enabled buttons must have a valid label and URL.');
      return;
    }

    if (!window.confirm(broadcastIsScheduled
      ? `Are you sure you want to schedule this DM broadcast to members of ${guildName}?`
      : `Are you sure you want to broadcast this DM to members of ${guildName}? This action cannot be undone.`
    )) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      message: broadcastMessage,
      buttons: targetButtons,
      filterRole: '',
      excludeRole: broadcastExcludeRole,
      delayInterval: Number(broadcastDelayInterval) || 1,
      embed: {
        enabled: broadcastEmbedEnabled,
        title: broadcastEmbedTitle,
        description: broadcastEmbedDesc,
        color: broadcastEmbedColor,
        thumbnail: broadcastEmbedThumb,
        image: broadcastEmbedImage,
        author: {
          enabled: broadcastEmbedAuthorEnabled,
          name: broadcastEmbedAuthorName,
          iconURL: broadcastEmbedAuthorIcon,
          url: broadcastEmbedAuthorUrl
        },
        footer: {
          enabled: broadcastEmbedFooterEnabled,
          text: broadcastEmbedFooterText,
          iconURL: broadcastEmbedFooterIcon
        },
        fields: broadcastEmbedFields
      }
    };

    try {
      if (broadcastIsScheduled) {
        payload.publishAt = broadcastScheduledTime;
        const res = await api.scheduleDM(guildId, payload);
        showNotification(res.message || 'Mass DM broadcast successfully scheduled!');
        fetchScheduledDMs();
      } else {
        setBroadcasting(true);
        setActiveBroadcastProgress({
          status: 'sending',
          totalTargets: 0,
          successCount: 0,
          failCount: 0
        });
        const res = await api.sendMassDM(guildId, payload);
        showNotification(res.message || 'Mass DM broadcast successfully started!');
        fetchBroadcastsHistory();
      }

      // Reset form
      setBroadcastMessage('');
      setBroadcastButtonEnabled(false);
      setBroadcastButtonLabel('');
      setBroadcastButtonUrl('');
      setBroadcastButtons([]);
      setBroadcastEmbedEnabled(false);
      setBroadcastEmbedTitle('');
      setBroadcastEmbedDesc('');
      setBroadcastEmbedThumb('');
      setBroadcastEmbedImage('');
      setBroadcastEmbedAuthorEnabled(false);
      setBroadcastEmbedAuthorName('');
      setBroadcastEmbedAuthorIcon('');
      setBroadcastEmbedAuthorUrl('');
      setBroadcastEmbedFooterEnabled(false);
      setBroadcastEmbedFooterText('');
      setBroadcastEmbedFooterIcon('');
      setBroadcastEmbedFields([]);
      setBroadcastExcludeRole('');
      setBroadcastDelayInterval(1);
      setBroadcastIsScheduled(false);
      setBroadcastScheduledTime('');

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to trigger broadcast DMs.');
      if (!broadcastIsScheduled) {
        setActiveBroadcastProgress(null);
      }
    } finally {
      setBroadcasting(false);
    }
  };

  const handleSendTestDM = async (e) => {
    if (e) e.preventDefault();
    if (!broadcastMessage && (!broadcastEmbedEnabled || (!broadcastEmbedTitle && !broadcastEmbedDesc && broadcastEmbedFields.length === 0))) {
      setErrorMsg('Please enter a message or set up a valid embed title/description before testing.');
      return;
    }

    let targetButtons = [...broadcastButtons];
    if (broadcastButtonEnabled && broadcastButtonLabel && broadcastButtonUrl) {
      targetButtons.push({ label: broadcastButtonLabel, url: broadcastButtonUrl });
    }

    try {
      showNotification('Sending test DM to your Discord account...');
      const res = await api.sendTestDM(guildId, {
        message: broadcastMessage,
        buttons: targetButtons,
        embed: {
          enabled: broadcastEmbedEnabled,
          title: broadcastEmbedTitle,
          description: broadcastEmbedDesc,
          color: broadcastEmbedColor,
          thumbnail: broadcastEmbedThumb,
          image: broadcastEmbedImage,
          author: {
            enabled: broadcastEmbedAuthorEnabled,
            name: broadcastEmbedAuthorName,
            iconURL: broadcastEmbedAuthorIcon,
            url: broadcastEmbedAuthorUrl
          },
          footer: {
            enabled: broadcastEmbedFooterEnabled,
            text: broadcastEmbedFooterText,
            iconURL: broadcastEmbedFooterIcon
          },
          fields: broadcastEmbedFields
        }
      });
      showNotification(res.message || 'Test DM sent successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to send test DM.');
    }
  };

  const handleSendChannelMessage = async (e) => {
    if (e) e.preventDefault();
    if (!pubChannelId) {
      setErrorMsg('Please select a target channel.');
      return;
    }

    if (!pubMessage && (!pubEmbedEnabled || (!pubEmbedTitle && !pubEmbedDesc && pubEmbedFields.length === 0))) {
      setErrorMsg('Please enter a message, embed content, or add fields to send.');
      return;
    }

    if (isScheduled && !scheduledTime) {
      setErrorMsg('Please select a release date & time for your scheduled announcement.');
      return;
    }

    // Validation for link buttons
    let targetButtons = [...pubButtons];
    if (pubButtonEnabled && pubButtonLabel && pubButtonUrl) {
      targetButtons.push({ label: pubButtonLabel, url: pubButtonUrl });
    }
    const invalidButton = targetButtons.find(btn => !btn.label || !btn.url);
    if (invalidButton) {
      setErrorMsg('All enabled buttons must have a valid label and URL.');
      return;
    }

    const channelName = channels.find(c => c.id === pubChannelId)?.name || 'selected channel';

    if (isScheduled) {
      if (!window.confirm(`Are you sure you want to schedule this announcement to #${channelName} at ${new Date(scheduledTime).toLocaleString()}?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to send this styled message to #${channelName}?`)) {
        return;
      }
    }

    setPublishing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        channelId: pubChannelId,
        message: pubMessage,
        ping: {
          type: pubPingType,
          roleId: pubPingRoleId
        },
        buttons: targetButtons,
        embed: {
          enabled: pubEmbedEnabled,
          title: pubEmbedTitle,
          description: pubEmbedDesc,
          color: pubEmbedColor,
          thumbnail: pubEmbedThumb,
          image: pubEmbedImage,
          author: {
            enabled: pubEmbedAuthorEnabled,
            name: pubEmbedAuthorName,
            iconURL: pubEmbedAuthorIcon,
            url: pubEmbedAuthorUrl
          },
          footer: {
            enabled: pubEmbedFooterEnabled,
            text: pubEmbedFooterText,
            iconURL: pubEmbedFooterIcon
          },
          fields: pubEmbedFields
        }
      };

      if (isScheduled) {
        payload.publishAt = scheduledTime;
        const res = await api.scheduleAnnouncement(guildId, payload);
        showNotification(res.message || 'Announcement scheduled successfully!');
        fetchScheduledAnnouncements();
      } else {
        const res = await api.sendChannelMessage(guildId, payload);
        showNotification(res.message || 'Announcement published successfully!');
      }

      // Reset form
      setPubMessage('');
      setPubPingType('none');
      setPubPingRoleId('');
      setPubButtons([]);
      setPubButtonEnabled(false);
      setPubButtonLabel('');
      setPubButtonUrl('');
      setPubEmbedEnabled(false);
      setPubEmbedTitle('');
      setPubEmbedDesc('');
      setPubEmbedThumb('');
      setPubEmbedImage('');
      setPubEmbedAuthorEnabled(false);
      setPubEmbedAuthorName('');
      setPubEmbedAuthorIcon('');
      setPubEmbedAuthorUrl('');
      setPubEmbedFooterEnabled(false);
      setPubEmbedFooterText('');
      setPubEmbedFooterIcon('');
      setPubEmbedFields([]);
      setIsScheduled(false);
      setScheduledTime('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to process request.');
    } finally {
      setPublishing(false);
    }
  };

  // Templates Management Helpers
  const fetchTemplates = async (type) => {
    try {
      const data = await api.getTemplates(guildId, type);
      setTemplates(data);
    } catch (err) {
      console.error('Failed to fetch templates:', err.message);
    }
  };

  const handleSaveTemplate = async (name, type) => {
    if (!name.trim()) return;
    try {
      let data = {};
      if (type === 'announcement') {
        data = {
          message: pubMessage,
          pubPingType,
          pubPingRoleId,
          pubButtons,
          pubButtonEnabled,
          pubButtonLabel,
          pubButtonUrl,
          pubEmbedEnabled,
          pubEmbedTitle,
          pubEmbedDesc,
          pubEmbedColor,
          pubEmbedThumb,
          pubEmbedImage,
          pubEmbedAuthorEnabled,
          pubEmbedAuthorName,
          pubEmbedAuthorIcon,
          pubEmbedAuthorUrl,
          pubEmbedFooterEnabled,
          pubEmbedFooterText,
          pubEmbedFooterIcon,
          pubEmbedFields
        };
      } else {
        data = {
          message: broadcastMessage,
          broadcastExcludeRole,
          broadcastButtons,
          broadcastButtonEnabled,
          broadcastButtonLabel,
          broadcastButtonUrl,
          broadcastEmbedEnabled,
          broadcastEmbedTitle,
          broadcastEmbedDesc,
          broadcastEmbedColor,
          broadcastEmbedThumb,
          broadcastEmbedImage,
          broadcastEmbedAuthorEnabled,
          broadcastEmbedAuthorName,
          broadcastEmbedAuthorIcon,
          broadcastEmbedAuthorUrl,
          broadcastEmbedFooterEnabled,
          broadcastEmbedFooterText,
          broadcastEmbedFooterIcon,
          broadcastEmbedFields,
          broadcastDelayInterval
        };
      }

      await api.saveTemplate(guildId, { name, type, data });
      showNotification('Template saved successfully!');
      fetchTemplates(type);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save template.');
    }
  };

  const handleLoadTemplate = (tpl) => {
    const { data } = tpl;
    if (tpl.type === 'announcement') {
      setPubMessage(data.message || '');
      setPubPingType(data.pubPingType || 'none');
      setPubPingRoleId(data.pubPingRoleId || '');
      setPubButtons(data.pubButtons || []);
      setPubButtonEnabled(!!data.pubButtonEnabled);
      setPubButtonLabel(data.pubButtonLabel || '');
      setPubButtonUrl(data.pubButtonUrl || '');
      setPubEmbedEnabled(!!data.pubEmbedEnabled);
      setPubEmbedTitle(data.pubEmbedTitle || '');
      setPubEmbedDesc(data.pubEmbedDesc || '');
      setPubEmbedColor(data.pubEmbedColor || '#2563eb');
      setPubEmbedThumb(data.pubEmbedThumb || '');
      setPubEmbedImage(data.pubEmbedImage || '');
      setPubEmbedAuthorEnabled(!!data.pubEmbedAuthorEnabled);
      setPubEmbedAuthorName(data.pubEmbedAuthorName || '');
      setPubEmbedAuthorIcon(data.pubEmbedAuthorIcon || '');
      setPubEmbedAuthorUrl(data.pubEmbedAuthorUrl || '');
      setPubEmbedFooterEnabled(!!data.pubEmbedFooterEnabled);
      setPubEmbedFooterText(data.pubEmbedFooterText || '');
      setPubEmbedFooterIcon(data.pubEmbedFooterIcon || '');
      setPubEmbedFields(data.pubEmbedFields || []);
    } else {
      setBroadcastMessage(data.message || '');
      setBroadcastExcludeRole(data.broadcastExcludeRole || '');
      setBroadcastButtons(data.broadcastButtons || []);
      setBroadcastButtonEnabled(!!data.broadcastButtonEnabled);
      setBroadcastButtonLabel(data.broadcastButtonLabel || '');
      setBroadcastButtonUrl(data.broadcastButtonUrl || '');
      setBroadcastEmbedEnabled(!!data.broadcastEmbedEnabled);
      setBroadcastEmbedTitle(data.broadcastEmbedTitle || '');
      setBroadcastEmbedDesc(data.broadcastEmbedDesc || '');
      setBroadcastEmbedColor(data.broadcastEmbedColor || '#2563eb');
      setBroadcastEmbedThumb(data.broadcastEmbedThumb || '');
      setBroadcastEmbedImage(data.broadcastEmbedImage || '');
      setBroadcastEmbedAuthorEnabled(!!data.broadcastEmbedAuthorEnabled);
      setBroadcastEmbedAuthorName(data.broadcastEmbedAuthorName || '');
      setBroadcastEmbedAuthorIcon(data.broadcastEmbedAuthorIcon || '');
      setBroadcastEmbedAuthorUrl(data.broadcastEmbedAuthorUrl || '');
      setBroadcastEmbedFooterEnabled(!!data.broadcastEmbedFooterEnabled);
      setBroadcastEmbedFooterText(data.broadcastEmbedFooterText || '');
      setBroadcastEmbedFooterIcon(data.broadcastEmbedFooterIcon || '');
      setBroadcastEmbedFields(data.broadcastEmbedFields || []);
      setBroadcastDelayInterval(data.broadcastDelayInterval || 1);
    }
    showNotification(`Template "${tpl.name}" loaded successfully.`);
  };

  const handleDeleteTemplate = async (templateId, type) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.deleteTemplate(guildId, templateId);
      showNotification('Template deleted successfully.');
      fetchTemplates(type);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete template.');
    }
  };

  // Scheduled Announcements helpers
  const fetchScheduledAnnouncements = async () => {
    try {
      const data = await api.getScheduledAnnouncements(guildId);
      setScheduledAnnouncements(data);
    } catch (err) {
      console.error('Failed to fetch scheduled announcements:', err.message);
    }
  };

  const handleDeleteScheduledAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to cancel and delete this scheduled announcement?')) return;
    try {
      await api.deleteScheduledAnnouncement(guildId, announcementId);
      showNotification('Scheduled announcement cancelled.');
      fetchScheduledAnnouncements();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel scheduled announcement.');
    }
  };

  // Scheduled DMs & Broadcast History helpers
  const fetchScheduledDMs = async () => {
    try {
      const data = await api.getScheduledDMs(guildId);
      setScheduledDMs(data);
    } catch (err) {
      console.error('Failed to fetch scheduled DMs:', err.message);
    }
  };

  const fetchBroadcastsHistory = async () => {
    try {
      const data = await api.getBroadcasts(guildId);
      setBroadcastsList(data);
    } catch (err) {
      console.error('Failed to fetch broadcasts history:', err.message);
    }
  };

  const handleDeleteScheduledDM = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this scheduled DM broadcast?')) return;
    try {
      await api.deleteScheduledDM(guildId, id);
      showNotification('Scheduled DM broadcast cancelled.');
      fetchScheduledDMs();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel scheduled DM broadcast.');
    }
  };

  const handleRevokeBroadcast = async (broadcastId) => {
    if (!window.confirm('WARNING: This will attempt to delete this message for all users who received it. Are you sure you want to proceed?')) return;
    try {
      await api.revokeBroadcast(guildId, broadcastId);
      showNotification('DM Revocation process started in the background.');
      fetchBroadcastsHistory();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start DM revocation.');
    }
  };

  // Active Broadcast Cancellation
  const handleCancelActiveBroadcast = async (broadcastId) => {
    if (!window.confirm('Are you sure you want to stop this running broadcast immediately?')) return;
    try {
      const res = await api.cancelBroadcast(guildId, broadcastId);
      showNotification(res.message || 'Broadcast cancel request sent.');
      fetchBroadcastsHistory();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel running broadcast.');
    }
  };

  // Premium Poll Helpers
  const fetchPolls = async () => {
    try {
      const data = await api.getPolls(guildId);
      setPolls(data);
    } catch (err) {
      console.error('Failed to fetch polls:', err.message);
    }
  };

  const handleCreatePoll = async (e) => {
    if (e) e.preventDefault();
    if (!pollChannelId) {
      setErrorMsg('Please select a target channel.');
      return;
    }
    if (!pollQuestion.trim()) {
      setErrorMsg('Please enter a question.');
      return;
    }
    const filteredOptions = pollOptions.map(opt => opt.trim()).filter(Boolean);
    if (filteredOptions.length < 2) {
      setErrorMsg('Please enter at least two options.');
      return;
    }

    setCreatingPoll(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      channelId: pollChannelId,
      question: pollQuestion,
      description: pollDescription,
      options: filteredOptions,
      settings: {
        multipleChoice: pollMultipleChoice,
        anonymous: pollAnonymous,
        showResultsBeforeEnding: pollShowResultsBeforeEnding,
        expiresAt: pollExpiresAt || undefined,
        color: pollColor,
        imageUrl: pollImageUrl || undefined,
        thumbnailUrl: pollThumbnailUrl || undefined
      }
    };

    try {
      await api.createPoll(guildId, payload);
      showNotification('Poll created and published to Discord successfully!');

      // Reset form
      setPollQuestion('');
      setPollDescription('');
      setPollOptions(['', '']);
      setPollMultipleChoice(false);
      setPollAnonymous(false);
      setPollShowResultsBeforeEnding(true);
      setPollExpiresAt('');
      setPollColor('#2563eb');
      setPollImageUrl('');
      setPollThumbnailUrl('');

      fetchPolls();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to create poll.');
    } finally {
      setCreatingPoll(false);
    }
  };

  const handleEndPoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to end this poll immediately? Voters will not be able to vote anymore.')) return;
    try {
      await api.endPoll(guildId, pollId);
      showNotification('Poll ended successfully.');
      fetchPolls();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to end poll.');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? The Discord message will be deleted, and all vote data will be removed.')) return;
    try {
      await api.deletePoll(guildId, pollId);
      showNotification('Poll deleted successfully.');
      fetchPolls();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete poll.');
    }
  };

  // Load Channels, Roles, and Settings
  const loadData = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setLoading(true);
      const [chData, rData, sData, catData, vcData] = await Promise.all([
        api.getChannels(guildId),
        api.getRoles(guildId),
        api.getSettings(guildId),
        api.getCategories(guildId),
        api.getVoiceChannels(guildId)
      ]);
      setChannels(chData);
      setRoles(rData);
      if (sData) {
        if (!sData.logging) {
          sData.logging = {
            enabled: true,
            logChannelId: '',
            logBans: true,
            logKicks: true,
            logMutes: true,
            logVoice: true,
            logRoles: true,
            logChannels: true,
            logMessages: true,
            logMembers: true
          };
        }
        if (!sData.antinuke) {
          sData.antinuke = {
            enabled: false,
            logChannelId: '',
            punishment: 'stripall',
            threshold: 3,
            timeframe: 60,
            antiBan: true,
            antiKick: true,
            antiChannelCreate: true,
            antiChannelDelete: true,
            antiRoleCreate: true,
            antiRoleDelete: true,
            antiRoleUpdate: true,
            antiWebhook: true,
            antiBot: true,
            antiGuildUpdate: false,
            antiEmoji: false,
            antiChannelEdit: false,
            whitelistedUsers: []
          };
        } else {
          if (!sData.antinuke.whitelistedUsers) {
            sData.antinuke.whitelistedUsers = [];
          } else {
            sData.antinuke.whitelistedUsers = sData.antinuke.whitelistedUsers.map(u =>
              typeof u === 'string' ? { userId: u, addedBy: 'System', events: [], username: '', displayName: '', avatar: '' } : u
            );
          }
        }

        if (sData.moderation) {
          if (!sData.moderation.whitelistedUsers) {
            sData.moderation.whitelistedUsers = [];
          } else {
            sData.moderation.whitelistedUsers = sData.moderation.whitelistedUsers.map(u =>
              typeof u === 'string' ? { userId: u, addedBy: 'System', username: '', displayName: '', avatar: '' } : u
            );
          }
          if (!sData.moderation.wordFilter) {
            sData.moderation.wordFilter = {
              enabled: false,
              autoDelete: true,
              autoTimeout: true,
              words: [],
              action: 'delete_timeout',
              timeoutDuration: 10,
              logChannelId: '',
              sendAlert: true,
              alertMessage: '{user}, your message contained a forbidden word and was removed.',
              strictBypassProtection: true,
              whitelistedUsers: [],
              whitelistedRoles: []
            };
          }
        } else {
          sData.moderation = {
            spam: { enabled: false, protectedChannels: [], maxMessages: 5, timeWindow: 5000, timeoutDuration: 5 },
            links: { enabled: false, protectedChannels: [], allowedLinks: [] },
            photoSpam: { enabled: false, maxPhotos: 3, timeWindow: 10000, timeoutDuration: 10, whitelistedChannels: [] },
            wordFilter: {
              enabled: false,
              autoDelete: true,
              autoTimeout: true,
              words: [],
              action: 'delete_timeout',
              timeoutDuration: 10,
              logChannelId: '',
              sendAlert: true,
              alertMessage: '{user}, your message contained a forbidden word and was removed.',
              strictBypassProtection: true,
              whitelistedUsers: [],
              whitelistedRoles: []
            },
            whitelistedUsers: []
          };
        }
      }

      setSettings(sData);
      setSavedSettings(JSON.parse(JSON.stringify(sData)));
      setCategories(catData || []);
      setVoiceChannels(vcData || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load server data. Please try again.');
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, [guildId]);

  // Load members list whenever antinuke or moderation tab becomes active
  useEffect(() => {
    if (activeTab === 'antinuke' || activeTab === 'moderation') {
      const fetchMembers = async () => {
        try {
          const mData = await api.getAdminMembers(guildId).catch(() => []);
          setAllMembers(prev => {
            const antinukeIds = settings?.antinuke?.whitelistedUsers?.map(u => typeof u === 'string' ? u : u?.userId).filter(Boolean) || [];
            const moderationIds = settings?.moderation?.whitelistedUsers?.map(u => typeof u === 'string' ? u : u?.userId).filter(Boolean) || [];
            const whitelistedIds = Array.from(new Set([...antinukeIds, ...moderationIds])).filter(id => id !== 'undefined');

            const whitelistedInPrev = prev.filter(m => whitelistedIds.includes(m.id));
            const merged = [...(mData || [])];
            whitelistedInPrev.forEach(m => {
              if (!merged.some(x => x.id === m.id)) {
                merged.push(m);
              }
            });
            return merged;
          });
        } catch (err) {
          console.error('[Dashboard] Failed to fetch members:', err);
        }
      };
      fetchMembers();
    }
  }, [activeTab, guildId, settings?.antinuke?.whitelistedUsers, settings?.moderation?.whitelistedUsers]);

  // Whenever whitelistedUsers changes or allMembers changes, fetch details for any IDs we don't have cached yet
  useEffect(() => {
    const antinukeIds = settings?.antinuke?.whitelistedUsers?.map(u => typeof u === 'string' ? u : u?.userId).filter(Boolean) || [];
    const moderationIds = settings?.moderation?.whitelistedUsers?.map(u => typeof u === 'string' ? u : u?.userId).filter(Boolean) || [];
    const whitelistedIds = Array.from(new Set([...antinukeIds, ...moderationIds])).filter(id => id !== 'undefined');

    if (whitelistedIds.length === 0) return;

    const missingIds = whitelistedIds.filter(id => id && !allMembers.some(m => m.id === id) && !failedIds.has(id));
    if (missingIds.length === 0) return;

    const resolveMissing = async () => {
      const fetched = await Promise.all(
        missingIds.map(async (id) => {
          try {
            return await api.getAdminMemberDetails(guildId, id);
          } catch (e) {
            setFailedIds(prev => {
              const next = new Set(prev);
              next.add(id);
              return next;
            });
            return null;
          }
        })
      );
      const valid = fetched.filter(Boolean);
      if (valid.length > 0) {
        setAllMembers(prev => {
          const newEntries = valid.filter(v => !prev.some(m => m.id === v.id));
          return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
        });
      }
    };
    resolveMissing();
  }, [settings?.antinuke?.whitelistedUsers, settings?.moderation?.whitelistedUsers, allMembers, guildId, failedIds]);

  // Debounce search effect for whitelisting members
  useEffect(() => {
    if (!memberSearchQuery.trim()) {
      setSearchedMembers([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const membersList = await api.getAdminMembers(guildId, memberSearchQuery);
        setSearchedMembers(membersList || []);
      } catch (err) {
        console.error('[Dashboard Member Search Error]', err);
      } finally {
        setSearchLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [memberSearchQuery, guildId]);

  // Debounce search effect for moderation whitelisting members
  useEffect(() => {
    if (!modWhitelistSearchQuery.trim()) {
      setModWhitelistSearchedMembers([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setModWhitelistSearchLoading(true);
      try {
        const membersList = await api.getAdminMembers(guildId, modWhitelistSearchQuery);
        setModWhitelistSearchedMembers(membersList || []);
      } catch (err) {
        console.error('[Dashboard Moderation Whitelist Member Search Error]', err);
      } finally {
        setModWhitelistSearchLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [modWhitelistSearchQuery, guildId]);

  // Initialize Socket.IO connection and join room
  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:2010'
      : window.location.origin;

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });


    newSocket.emit('join_guild', guildId);

    newSocket.on('new_log', (log) => {
      setLogs(prev => [log, ...prev]);
    });

    newSocket.on('broadcast_progress', (progress) => {
      console.log('[Socket] Received broadcast progress:', progress);
      setActiveBroadcastProgress(progress);
      if (progress.status === 'completed' || progress.status === 'cancelled' || progress.status === 'failed') {
        fetchBroadcastsHistory();
        setTimeout(() => setActiveBroadcastProgress(null), 10000); // hide status after 10 seconds of completion
      }
    });

    newSocket.on('poll_update', (updatedPoll) => {
      setPolls(prev => {
        const index = prev.findIndex(p => p._id === updatedPoll._id);
        if (index > -1) {
          const newPolls = [...prev];
          newPolls[index] = updatedPoll;
          return newPolls;
        } else {
          return [updatedPoll, ...prev];
        }
      });
    });

    newSocket.on('poll_delete', ({ pollId }) => {
      setPolls(prev => prev.filter(p => p._id !== pollId));
    });

    return () => {
      newSocket.emit('leave_guild', guildId);
      newSocket.disconnect();
    };
  }, [guildId]);

  // Load templates & scheduled posts on tab changes
  useEffect(() => {
    if (activeTab === 'publish') {
      fetchTemplates('announcement');
      fetchScheduledAnnouncements();
    } else if (activeTab === 'broadcast') {
      fetchTemplates('dm');
      fetchScheduledDMs();
      fetchBroadcastsHistory();
      setActiveBroadcastProgress(null); // Reset preview
    } else if (activeTab === 'polls') {
      fetchPolls();
    }
  }, [activeTab, guildId]);

  // Load moderation logs when active tab is logs
  useEffect(() => {
    if (activeTab === 'logs') {
      const fetchLogs = async () => {
        try {
          const res = await api.getLogs(guildId);
          setLogs(res);
        } catch (err) {
          console.error('[Dashboard] Failed to fetch moderation logs:', err.message);
        }
      };
      fetchLogs();
    }
  }, [activeTab, guildId]);

  const handleDragStart = (e, elementKey) => {
    e.preventDefault();
    const parent = e.currentTarget.parentElement;
    const rect = parent.getBoundingClientRect();

    const handleMouseMove = (moveEvent) => {
      const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

      let newX = ((clientX - rect.left) / rect.width) * 800;
      let newY = ((clientY - rect.top) / rect.height) * 450;

      newX = Math.round(Math.max(0, Math.min(800, newX)));
      newY = Math.round(Math.max(0, Math.min(450, newY)));

      handleInputChange(`welcome.${elementKey}X`, newX);
      handleInputChange(`welcome.${elementKey}Y`, newY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove, { passive: true });
    document.addEventListener('touchend', handleMouseUp);
  };

  const handleToggle = (path) => {
    const parts = path.split('.');
    setSettings(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        if (current[parts[i]] === undefined || current[parts[i]] === null) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = !current[parts[parts.length - 1]];
      return updated;
    });
  };

  const handleInputChange = (path, value) => {
    const parts = path.split('.');
    setSettings(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        if (current[parts[i]] === undefined || current[parts[i]] === null) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return updated;
    });
  };

  const getMemberDetails = (userId) => {
    const member = allMembers.find(m => m.id === userId);
    if (member) return member;

    // Look for fallback details in settings whitelists
    const modUser = settings?.moderation?.whitelistedUsers?.find(u => u.userId === userId);
    const antiUser = settings?.antinuke?.whitelistedUsers?.find(u => typeof u === 'string' ? u === userId : u.userId === userId);

    const storedUsername = modUser?.username || (typeof antiUser === 'object' ? antiUser?.username : '');
    const storedDisplayName = modUser?.displayName || (typeof antiUser === 'object' ? antiUser?.displayName : '');
    const storedAvatar = modUser?.avatar || (typeof antiUser === 'object' ? antiUser?.avatar : '');

    return {
      id: userId,
      username: storedUsername || '',
      displayName: storedDisplayName || 'Unknown User',
      avatar: storedAvatar || null
    };
  };

  const handleAddWhitelist = (userId, events = [], details = null) => {
    if (!settings || !settings.antinuke) return;
    const currentList = settings.antinuke.whitelistedUsers || [];
    if (!currentList.some(u => u.userId === userId)) {
      const addedBy = user ? user.username : 'Dashboard';
      const username = details ? details.username : '';
      const displayName = details ? details.displayName : '';
      const avatar = details ? details.avatar : '';
      const updatedList = [...currentList, { userId, addedBy, events, username, displayName, avatar }];
      handleInputChange('antinuke.whitelistedUsers', updatedList);
    }
  };

  const handleRemoveWhitelist = (userId) => {
    if (!settings || !settings.antinuke) return;
    const currentList = settings.antinuke.whitelistedUsers || [];
    const updatedList = currentList.filter(u => u.userId !== userId);
    handleInputChange('antinuke.whitelistedUsers', updatedList);
  };

  const handleAddModWhitelist = (userId, details = null) => {
    if (!settings || !settings.moderation) return;
    const currentList = settings.moderation.whitelistedUsers || [];
    if (!currentList.some(u => u.userId === userId)) {
      const addedBy = user ? user.username : 'Dashboard';
      const username = details ? details.username : '';
      const displayName = details ? details.displayName : '';
      const avatar = details ? details.avatar : '';
      const updatedList = [...currentList, { userId, addedBy, username, displayName, avatar }];
      handleInputChange('moderation.whitelistedUsers', updatedList);
    }
  };

  const handleRemoveModWhitelist = (userId) => {
    if (!settings || !settings.moderation) return;
    const currentList = settings.moderation.whitelistedUsers || [];
    const updatedList = currentList.filter(u => u.userId !== userId);
    handleInputChange('moderation.whitelistedUsers', updatedList);
  };

  const handleManualAddModWhitelist = async () => {
    const query = modWhitelistSearchQuery.trim();
    if (!query) return;

    const isId = /^\d{17,20}$/.test(query);
    if (isId) {
      let details = null;
      try {
        details = await api.getAdminMemberDetails(guildId, query);
        if (details) {
          setAllMembers(prev => {
            if (!prev.some(m => m.id === query)) {
              return [...prev, details];
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn(`[Dashboard] Member details not found for ID ${query}:`, err);
      }
      handleAddModWhitelist(query, details);
      setModWhitelistSearchQuery('');
      setModWhitelistSearchedMembers([]);
    } else {
      if (modWhitelistSearchedMembers.length > 0) {
        const firstMatch = modWhitelistSearchedMembers.find(m => !(settings.moderation.whitelistedUsers || []).some(u => u.userId === m.id));
        if (firstMatch) {
          handleAddModWhitelist(firstMatch.id, firstMatch);
          setModWhitelistSearchQuery('');
          setModWhitelistSearchedMembers([]);
        }
      } else {
        alert('Please enter a valid Discord User ID (17-20 digits) or search/select a member.');
      }
    }
  };

  const handleManualAddWhitelist = async () => {
    const query = memberSearchQuery.trim();
    if (!query) return;

    const isId = /^\d{17,20}$/.test(query);
    if (isId) {
      let details = null;
      try {
        details = await api.getAdminMemberDetails(guildId, query);
        if (details) {
          setAllMembers(prev => {
            if (!prev.some(m => m.id === query)) {
              return [...prev, details];
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn(`[Dashboard] Member details not found for ID ${query}:`, err);
      }
      handleAddWhitelist(query, selectedWhitelistEvents, details);
      setMemberSearchQuery('');
      setSelectedWhitelistEvents([]);
      setSearchedMembers([]);
    } else {
      if (searchedMembers.length > 0) {
        const firstMatch = searchedMembers.find(m => !(settings.antinuke.whitelistedUsers || []).some(u => u.userId === m.id));
        if (firstMatch) {
          handleAddWhitelist(firstMatch.id, selectedWhitelistEvents, firstMatch);
          setMemberSearchQuery('');
          setSelectedWhitelistEvents([]);
          setSearchedMembers([]);
        }
      } else {
        alert('Please enter a valid Discord User ID (17-20 digits) or search/select a member.');
      }
    }
  };

  const getFeatureSettings = (s, tab) => {
    if (!s) return null;
    switch (tab) {
      case 'antinuke':
        return s.antinuke;
      case 'moderation':
        return s.moderation;
      case 'welcome':
        return s.welcome;
      case 'verification':
        return s.verification;
      case 'tickets':
        return s.tickets;
      case 'roles':
        return { autoRole: s.autoRole, autoNickname: s.autoNickname };
      case 'youtube':
        return s.youtube;
      case 'tempvoice':
        return s.tempVoice;
      default:
        return null;
    }
  };

  const isSettingsEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) {
      return a == b;
    }
    if (typeof a !== 'object' || typeof b !== 'object') {
      if (typeof a === 'number' || typeof b === 'number') {
        return Number(a) === Number(b);
      }
      if (typeof a === 'boolean' || typeof b === 'boolean') {
        return Boolean(a) === Boolean(b);
      }
      return a === b;
    }

    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!isSettingsEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const keysA = Object.keys(a).filter(k => k !== '_id' && k !== '__v' && a[k] !== undefined && a[k] !== null);
    const keysB = Object.keys(b).filter(k => k !== '_id' && k !== '__v' && b[k] !== undefined && b[k] !== null);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!isSettingsEqual(a[key], b[key])) return false;
    }
    return true;
  };

  const hasUnsavedChanges = (tab = activeTab) => {
    if (tab === 'server-control') {
      return adminHasUnsavedChanges;
    }
    if (!settings || !savedSettings) return false;
    const current = getFeatureSettings(settings, tab);
    const saved = getFeatureSettings(savedSettings, tab);
    if (!current || !saved) return false;
    return !isSettingsEqual(current, saved);
  };

  const handleTabClick = (newTab) => {
    if (hasUnsavedChanges()) {
      alert("You have unsaved changes. Please save or reset before leaving this feature.");
      return;
    }
    setActiveTab(newTab);
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges()) {
      alert("You have unsaved changes. Please save or reset before leaving this feature.");
      return;
    }
    onBack();
  };

  const handleReset = () => {
    if (savedSettings) {
      setSettings(JSON.parse(JSON.stringify(savedSettings)));
      showNotification('Changes reset to previously saved values.');
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Please save or reset before leaving this feature.";
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [settings, savedSettings, activeTab, adminHasUnsavedChanges]);

  const resolveUploadUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      const isLocal = window.location.port === '5173' || window.location.port === '5174';
      return isLocal ? `http://localhost:2010${url}` : url;
    }
    return url;
  };

  const formatWelcomeText = (rawText) => {
    if (!rawText) return '';

    const redirectCh = channels.find(c => c.id === settings?.welcome?.redirectChannelId);
    const channelName = redirectCh ? redirectCh.name : 'channel';
    const redirectCh2 = channels.find(c => c.id === settings?.welcome?.redirectChannelId2);
    const channelName2 = redirectCh2 ? redirectCh2.name : 'channel';
    const redirectCh3 = channels.find(c => c.id === settings?.welcome?.redirectChannelId3);
    const channelName3 = redirectCh3 ? redirectCh3.name : 'channel';

    let text = rawText
      .replace(/{username}/g, user?.username || 'Member')
      .replace(/{server}/g, guildName || 'Server');

    const parts = text.split(/({user}|{channel}|{channel2}|{channel3})/g);

    return parts.map((part, index) => {
      if (part === '{user}') {
        return (
          <span key={`mention-user-${index}`} className="discord-mention">
            @{user?.username || 'Member'}
          </span>
        );
      }
      if (part === '{channel}') {
        return (
          <span key={`mention-ch-${index}`} className="discord-mention-channel">
            #{channelName}
          </span>
        );
      }
      if (part === '{channel2}') {
        return (
          <span key={`mention-ch2-${index}`} className="discord-mention-channel">
            #{channelName2}
          </span>
        );
      }
      if (part === '{channel3}') {
        return (
          <span key={`mention-ch3-${index}`} className="discord-mention-channel">
            #{channelName3}
          </span>
        );
      }

      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return boldParts.map((subPart, subIndex) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          return (
            <strong key={`bold-${index}-${subIndex}`} style={{ color: '#ffffff', fontWeight: '600' }}>
              {subPart.slice(2, -2)}
            </strong>
          );
        }
        return subPart;
      });
    });
  };

  const renderRedirectButton = () => {
    const redirectIds = [
      settings?.welcome?.redirectChannelId,
      settings?.welcome?.redirectChannelId2,
      settings?.welcome?.redirectChannelId3
    ].filter(Boolean);

    if (redirectIds.length === 0) return null;

    return (
      <div className="discord-buttons-row">
        {redirectIds.map((id, index) => {
          const redirectCh = channels.find(c => c.id === id);
          const channelName = redirectCh ? redirectCh.name : 'channel';
          return (
            <span key={id + index} className="discord-button-link">
              <span>#{channelName}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </span>
          );
        })}
      </div>
    );
  };

  const renderCanvasCard = () => {
    if (!settings || !settings.welcome) return null;
    return (
      <div className="glass-panel" style={{
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        containerType: 'inline-size',
        background: settings.welcome.background ? (
          (settings.welcome.background.startsWith('#') || settings.welcome.background.length === 6 || settings.welcome.background.length === 3)
            ? (settings.welcome.background.startsWith('#') ? settings.welcome.background : `#${settings.welcome.background}`)
            : `url(${resolveUploadUrl(settings.welcome.background)}) center/cover no-repeat`
        ) : 'linear-gradient(135deg, #0F0C20 0%, #151030 50%, #060410 100%)',
        border: (settings.welcome.cardBorderEnabled && settings.welcome.cardBorderThickness > 0)
          ? `${(settings.welcome.cardBorderThickness || 8) / 8}cqw solid ${settings.welcome.cardBorderColor || '#00ff66'}`
          : '1px solid rgba(255,255,255,0.05)',
        userSelect: 'none',
        boxSizing: 'border-box'
      }}>
        {/* Overlay Tint layer */}
        {((settings.welcome.overlayOpacity !== undefined ? settings.welcome.overlayOpacity : 0.3) > 0) && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: settings.welcome.overlayColor || '#000000',
            opacity: settings.welcome.overlayOpacity !== undefined ? settings.welcome.overlayOpacity : 0.3,
            zIndex: 1,
            pointerEvents: 'none'
          }} />
        )}

        {/* Drag items container query representation */}
        {/* Avatar element wrapper */}
        {settings.welcome.avatarEnabled !== false && (
          <div
            onMouseDown={(e) => handleDragStart(e, 'avatar')}
            onTouchStart={(e) => handleDragStart(e, 'avatar')}
            style={{
              position: 'absolute',
              left: `${((settings.welcome.avatarX !== undefined ? settings.welcome.avatarX : 400) / 800) * 100}%`,
              top: `${((settings.welcome.avatarY !== undefined ? settings.welcome.avatarY : 130) / 450) * 100}%`,
              width: `${((settings.welcome.avatarSize || 140) / 800) * 100}%`,
              aspectRatio: '1/1',
              transform: `translate(-50%, -50%) rotate(${settings.welcome.avatarRotation || 0}deg)`,
              cursor: 'move',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}
              alt="avatar preview"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: `${(settings.welcome.avatarBorderThickness !== undefined ? settings.welcome.avatarBorderThickness : 6) / 8}cqw solid ${settings.welcome.avatarBorderColor || settings.welcome.textColor || '#ffffff'}`,
                boxShadow: settings.welcome.avatarShadowEnabled
                  ? `0 0 ${(settings.welcome.avatarShadowBlur || 15) / 8}cqw ${settings.welcome.avatarShadowColor || '#00ff66'}`
                  : '0 4px 10px rgba(0,0,0,0.4)',
                pointerEvents: 'none'
              }}
            />
          </div>
        )}

        {/* Title element wrapper */}
        {settings.welcome.titleEnabled !== false && (
          <div
            onMouseDown={(e) => handleDragStart(e, 'title')}
            onTouchStart={(e) => handleDragStart(e, 'title')}
            style={{
              position: 'absolute',
              left: `${((settings.welcome.titleX !== undefined ? settings.welcome.titleX : 400) / 800) * 100}%`,
              top: `${((settings.welcome.titleY !== undefined ? settings.welcome.titleY : 260) / 450) * 100}%`,
              transform: settings.welcome.textAlignment === 'left' ? 'translate(-100%, -50%)' : (settings.welcome.textAlignment === 'right' ? 'translate(0%, -50%)' : 'translate(-50%, -50%)'),
              cursor: 'move',
              zIndex: 9,
              textAlign: settings.welcome.textAlignment === 'left' ? 'right' : (settings.welcome.textAlignment === 'right' ? 'left' : 'center'),
              whiteSpace: 'nowrap'
            }}
          >
            <h2 style={{
              fontSize: `${(settings.welcome.titleSize || 54) / 8}cqw`,
              color: settings.welcome.textColor || '#ffffff',
              fontFamily: settings.welcome.titleFontFamily || settings.welcome.fontFamily || 'Ethnocentric, sans-serif',
              fontWeight: settings.welcome.fontWeight || 'bold',
              fontStyle: settings.welcome.titleFontStyle || 'normal',
              letterSpacing: '2px',
              textShadow: settings.welcome.titleGlowEnabled
                ? `0 0 ${(settings.welcome.titleGlowBlur || 10) / 8}cqw ${settings.welcome.titleGlowColor || '#00ff66'}, 0 0 ${(settings.welcome.titleGlowBlur || 10) / 4}cqw ${settings.welcome.titleGlowColor || '#00ff66'}`
                : (settings.welcome.textShadowEnabled
                  ? `0 1px ${(settings.welcome.textShadowBlur || 5) / 8}cqw ${settings.welcome.textShadowColor || '#000000'}`
                  : '0 2px 6px rgba(0,0,0,0.6)'),
              margin: 0,
              pointerEvents: 'none'
            }}>
              {(settings.welcome.titleText || 'WELCOME').replace(/{server}/g, guildName).replace(/{username}/g, (user.username || 'Member').toUpperCase())}
            </h2>
          </div>
        )}

        {/* Username element wrapper */}
        {settings.welcome.usernameEnabled !== false && (
          <div
            onMouseDown={(e) => handleDragStart(e, 'username')}
            onTouchStart={(e) => handleDragStart(e, 'username')}
            style={{
              position: 'absolute',
              left: `${((settings.welcome.usernameX !== undefined ? settings.welcome.usernameX : 400) / 800) * 100}%`,
              top: `${((settings.welcome.usernameY !== undefined ? settings.welcome.usernameY : 320) / 450) * 100}%`,
              transform: settings.welcome.textAlignment === 'left' ? 'translate(-100%, -50%)' : (settings.welcome.textAlignment === 'right' ? 'translate(0%, -50%)' : 'translate(-50%, -50%)'),
              cursor: 'move',
              zIndex: 9,
              textAlign: settings.welcome.textAlignment === 'left' ? 'right' : (settings.welcome.textAlignment === 'right' ? 'left' : 'center'),
              whiteSpace: 'nowrap'
            }}
          >
            <h3 style={{
              fontSize: `${(settings.welcome.usernameSize || 38) / 8}cqw`,
              color: settings.welcome.usernameColor || '#ffffff',
              fontFamily: settings.welcome.usernameFontFamily || settings.welcome.fontFamily || 'Ethnocentric, sans-serif',
              fontWeight: settings.welcome.fontWeight || 'bold',
              fontStyle: settings.welcome.usernameFontStyle || 'normal',
              textShadow: settings.welcome.usernameGlowEnabled
                ? `0 0 ${(settings.welcome.usernameGlowBlur || 10) / 8}cqw ${settings.welcome.usernameGlowColor || '#00ff66'}, 0 0 ${(settings.welcome.usernameGlowBlur || 10) / 4}cqw ${settings.welcome.usernameGlowColor || '#00ff66'}`
                : (settings.welcome.textShadowEnabled
                  ? `0 1px ${(settings.welcome.textShadowBlur || 5) / 8}cqw ${settings.welcome.textShadowColor || '#000000'}`
                  : '0 2px 6px rgba(0,0,0,0.6)'),
              margin: 0,
              pointerEvents: 'none'
            }}>
              {'@' + user.username.toUpperCase()}
            </h3>
          </div>
        )}

        {/* Subtext element wrapper */}
        {settings.welcome.subtextEnabled !== false && (
          <div
            onMouseDown={(e) => handleDragStart(e, 'subtext')}
            onTouchStart={(e) => handleDragStart(e, 'subtext')}
            style={{
              position: 'absolute',
              left: `${((settings.welcome.subtextX !== undefined ? settings.welcome.subtextX : 400) / 800) * 100}%`,
              top: `${((settings.welcome.subtextY !== undefined ? settings.welcome.subtextY : 370) / 450) * 100}%`,
              transform: settings.welcome.textAlignment === 'left' ? 'translate(-100%, -50%)' : (settings.welcome.textAlignment === 'right' ? 'translate(0%, -50%)' : 'translate(-50%, -50%)'),
              cursor: 'move',
              zIndex: 9,
              textAlign: settings.welcome.textAlignment === 'left' ? 'right' : (settings.welcome.textAlignment === 'right' ? 'left' : 'center'),
              whiteSpace: 'nowrap'
            }}
          >
            <p style={{
              fontSize: `${(settings.welcome.subtextSize || 22) / 8}cqw`,
              color: settings.welcome.subtextColor || 'rgba(255,255,255,0.8)',
              fontFamily: settings.welcome.subtextFontFamily || settings.welcome.fontFamily || 'Ethnocentric, sans-serif',
              fontWeight: settings.welcome.fontWeight || 'bold',
              fontStyle: settings.welcome.subtextFontStyle || 'normal',
              textShadow: settings.welcome.subtextGlowEnabled
                ? `0 0 ${(settings.welcome.subtextGlowBlur || 10) / 8}cqw ${settings.welcome.subtextGlowColor || '#00ff66'}, 0 0 ${(settings.welcome.subtextGlowBlur || 10) / 4}cqw ${settings.welcome.subtextGlowColor || '#00ff66'}`
                : (settings.welcome.textShadowEnabled
                  ? `0 1px ${(settings.welcome.textShadowBlur || 5) / 8}cqw ${settings.welcome.textShadowColor || '#000000'}`
                  : '0 1px 4px rgba(0,0,0,0.6)'),
              margin: 0,
              pointerEvents: 'none'
            }}>
              {(settings.welcome.subtextText || 'TO {server}').replace(/{server}/g, guildName).replace(/{username}/g, (user.username || 'Member').toUpperCase())}
            </p>
          </div>
        )}
      </div>
    );
  };

  const handleResetLayout = () => {
    setSettings(prev => ({
      ...prev,
      welcome: {
        ...prev.welcome,
        avatarSize: 140,
        avatarX: 400,
        avatarY: 130,
        avatarRotation: 0,
        avatarBorderThickness: 6,
        avatarBorderColor: '#00ff66',
        usernameX: 400,
        usernameY: 320,
        usernameSize: 38,
        titleX: 400,
        titleY: 260,
        titleSize: 54,
        subtextX: 400,
        subtextY: 370,
        subtextSize: 22,
        textAlignment: 'center',
        fontWeight: 'bold',
        avatarEnabled: true,
        titleEnabled: true,
        usernameEnabled: true,
        subtextEnabled: true,
        layoutType: 'classic',
        titleText: 'WELCOME',
        subtextText: 'TO {server}',
        textColor: '#ffffff',
        usernameColor: '#ffffff',
        subtextColor: '#00ff66',
        fontFamily: 'Ethnocentric',
        titleFontFamily: 'Ethnocentric',
        usernameFontFamily: 'Ethnocentric',
        subtextFontFamily: 'Ethnocentric',
        textShadowEnabled: false,
        textShadowColor: '#000000',
        textShadowBlur: 5,
        titleGlowEnabled: false,
        titleGlowColor: '#00ff66',
        titleGlowBlur: 15,
        usernameGlowEnabled: false,
        usernameGlowColor: '#00ff66',
        usernameGlowBlur: 15,
        subtextGlowEnabled: false,
        subtextGlowColor: '#00ff66',
        subtextGlowBlur: 15,
        avatarShadowEnabled: false,
        avatarShadowColor: '#00ff66',
        avatarShadowBlur: 15,
        overlayOpacity: 0.3,
        overlayColor: '#000000',
        cardBorderEnabled: false,
        cardBorderColor: '#2563eb',
        cardBorderThickness: 8
      }
    }));
    showNotification('Layout reset to default positions, sizes & visibility!');
  };

  const getSanitizedSettings = (rawSettings) => {
    const s = JSON.parse(JSON.stringify(rawSettings));
    if (s.moderation) {
      if (s.moderation.photoSpam) {
        const ps = s.moderation.photoSpam;
        if (ps.maxPhotos === '' || ps.maxPhotos === null || ps.maxPhotos === undefined || isNaN(ps.maxPhotos)) {
          ps.maxPhotos = 3;
        }
        if (ps.timeWindow === '' || ps.timeWindow === null || ps.timeWindow === undefined || isNaN(ps.timeWindow)) {
          ps.timeWindow = 10000;
        }
        if (ps.timeoutDuration === '' || ps.timeoutDuration === null || ps.timeoutDuration === undefined || isNaN(ps.timeoutDuration)) {
          ps.timeoutDuration = 10;
        }
      }
      if (s.moderation.spam) {
        const spam = s.moderation.spam;
        if (spam.maxMessages === '' || spam.maxMessages === null || spam.maxMessages === undefined || isNaN(spam.maxMessages)) {
          spam.maxMessages = 5;
        }
        if (spam.timeWindow === '' || spam.timeWindow === null || spam.timeWindow === undefined || isNaN(spam.timeWindow)) {
          spam.timeWindow = 5000;
        }
        if (spam.timeoutDuration === '' || spam.timeoutDuration === null || spam.timeoutDuration === undefined || isNaN(spam.timeoutDuration)) {
          spam.timeoutDuration = 5;
        }
      }
    }
    if (s.antinuke) {
      const an = s.antinuke;
      if (an.threshold === '' || an.threshold === null || an.threshold === undefined || isNaN(an.threshold)) {
        an.threshold = 3;
      } else {
        an.threshold = parseInt(an.threshold);
      }
      if (an.timeframe === '' || an.timeframe === null || an.timeframe === undefined || isNaN(an.timeframe)) {
        an.timeframe = 60;
      } else {
        an.timeframe = parseInt(an.timeframe);
      }
    }

    return s;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const sanitized = getSanitizedSettings(settings);
      const updated = await api.saveSettings(guildId, sanitized);
      setSettings(updated);
      setSavedSettings(JSON.parse(JSON.stringify(updated)));
      showNotification('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save settings. Please verify details.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all audit logs for this server? This action cannot be undone.')) return;
    setClearingLogs(true);
    try {
      await api.clearLogs(guildId);
      setLogs([]);
      showNotification('Audit logs cleared successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to clear audit logs: ' + err.message);
    } finally {
      setClearingLogs(false);
    }
  };

  const handleApplyChannelToAllLogs = (channelId) => {
    if (!channelId) {
      setErrorMsg('Please select a valid text channel first.');
      return;
    }
    handleInputChange('logging.logChannelId', channelId);
    handleInputChange('antinuke.logChannelId', channelId);
    handleInputChange('moderation.wordFilter.logChannelId', channelId);
    showNotification('Assigned text channel to ALL server log modules!');
  };

  const handleExportLogs = () => {
    if (!logs || logs.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sidcord_audit_logs_${guildId}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getLogActionInfo = (type) => {
    const action = (type || '').toLowerCase();
    switch (action) {
      case 'ban':
        return { label: 'BANNED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: '🔨' };
      case 'unban':
        return { label: 'UNBANNED', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', icon: '🔓' };
      case 'kick':
        return { label: 'KICKED', color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', icon: '👢' };
      case 'timeout':
        return { label: 'TIMED OUT', color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)', icon: '🔇' };
      case 'untimeout':
        return { label: 'UNMUTED', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: '🔊' };
      case 'voice_join':
        return { label: 'JOINED VC', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', icon: '🎤' };
      case 'voice_disconnect':
        return { label: 'LEFT VC', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)', icon: '🚪' };
      case 'voice_move':
        return { label: 'MOVED VC', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', icon: '🔀' };
      case 'voice_mute':
        return { label: 'VOICE MUTED', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', icon: '🎙️' };
      case 'voice_deafen':
        return { label: 'VOICE DEAFENED', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)', icon: '🎧' };
      case 'role_add':
        return { label: 'ROLE ADDED', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', icon: '🏷️' };
      case 'role_remove':
        return { label: 'ROLE REMOVED', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)', icon: '🏷️' };
      case 'role_update':
        return { label: 'ROLES UPDATED', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', icon: '🏷️' };
      case 'channel_create':
        return { label: 'CHANNEL CREATED', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: '📁' };
      case 'channel_delete':
        return { label: 'CHANNEL DELETED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: '📁' };
      case 'channel_update':
        return { label: 'CHANNEL UPDATED', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.12)', icon: '📁' };
      case 'role_create':
        return { label: 'ROLE CREATED', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: '🎭' };
      case 'role_delete':
        return { label: 'ROLE DELETED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: '🎭' };
      case 'message_delete':
        return { label: 'MESSAGE DELETED', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)', icon: '🗑️' };
      case 'member_join':
        return { label: 'MEMBER JOINED', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', icon: '📥' };
      case 'member_leave':
        return { label: 'MEMBER LEFT', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', icon: '📤' };
      default:
        return { label: (type || 'ACTION').toUpperCase(), color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', icon: '🛡️' };
    }
  };

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey) {
        handleSave(e);
      } else {
        if (e.target.tagName.toLowerCase() !== 'textarea') {
          e.preventDefault();
        }
      }
    }
  };

  const handlePublishVerification = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      // First save settings
      const sanitized = getSanitizedSettings(settings);
      const updated = await api.saveSettings(guildId, sanitized);
      setSettings(updated);
      setSavedSettings(JSON.parse(JSON.stringify(updated)));
      // Publish
      const res = await api.publishVerification(guildId);
      showNotification(res.message || 'Verification message published!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to publish verification message.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishTickets = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      // First save settings
      const sanitized = getSanitizedSettings(settings);
      const updated = await api.saveSettings(guildId, sanitized);
      setSettings(updated);
      setSavedSettings(JSON.parse(JSON.stringify(updated)));
      // Publish
      const res = await api.publishTickets(guildId);
      showNotification(res.message || 'Ticket system message published!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to publish ticket system message.');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Syncing settings database...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', borderColor: 'var(--danger)' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Failed to Load Settings</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Could not retrieve settings for this server. Please check if the bot is online and running.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={onBack} className="btn-secondary">Back to Servers</button>
            <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }
  const getAvatarUrl = () => {
    if (!user) return 'https://cdn.discordapp.com/embed/avatars/0.png';
    if (user.avatar) {
      const id = user.discordId || user.id;
      return `https://cdn.discordapp.com/avatars/${id}/${user.avatar}.png`;
    }
    return 'https://cdn.discordapp.com/embed/avatars/0.png';
  };

  return (
    <div className="dashboard-root-layout">
      {/* Top Navbar Header */}
      <header className="dashboard-top-navbar">
        <div className="dashboard-nav-left">
          <button onClick={handleBackClick} className="btn-nav-servers">
            <Home size={15} />
            Servers
          </button>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff', marginLeft: '8px' }}>
            {guildName.toUpperCase()}
          </h3>
        </div>

        <div className="dashboard-nav-right">
          <img
            src={getAvatarUrl()}
            alt={user?.username || 'User'}
            className="dashboard-user-avatar"
          />
          {onLogout && (
            <button onClick={onLogout} className="btn-nav-logout" title="Logout">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="dashboard-main-viewport">
        {/* Left Sidebar */}
        <aside className="dashboard-left-sidebar">
          <div className="sidebar-category-title">Configuration Panel</div>
          <div className="sidebar-menu-links">
            <button
              type="button"
              onClick={() => handleTabClick('overview')}
              className={`sidebar-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <Home size={16} />
              Overview
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('moderation')}
              className={`sidebar-menu-item ${activeTab === 'moderation' ? 'active' : ''}`}
            >
              <Shield size={16} />
              Moderation
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('antinuke')}
              className={`sidebar-menu-item ${activeTab === 'antinuke' ? 'active' : ''}`}
            >
              <ShieldAlert size={16} />
              Anti-nuke Shield
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('welcome')}
              className={`sidebar-menu-item ${activeTab === 'welcome' ? 'active' : ''}`}
            >
              <Sparkles size={16} />
              Welcome
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('verification')}
              className={`sidebar-menu-item ${activeTab === 'verification' ? 'active' : ''}`}
            >
              <UserCheck size={16} />
              Verification Role
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('tickets')}
              className={`sidebar-menu-item ${activeTab === 'tickets' ? 'active' : ''}`}
            >
              <Ticket size={16} />
              Ticket Panels
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('logs')}
              className={`sidebar-menu-item ${activeTab === 'logs' ? 'active' : ''}`}
            >
              <FileText size={16} />
              Server Logs
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('broadcast')}
              className={`sidebar-menu-item ${activeTab === 'broadcast' ? 'active' : ''}`}
            >
              <Send size={16} />
              Broadcast DMs
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('publish')}
              className={`sidebar-menu-item ${activeTab === 'publish' ? 'active' : ''}`}
            >
              <Megaphone size={16} />
              Publish Embeds
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('youtube')}
              className={`sidebar-menu-item ${activeTab === 'youtube' ? 'active' : ''}`}
            >
              <Youtube size={16} />
              YouTube Feeds
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('tempvoice')}
              className={`sidebar-menu-item ${activeTab === 'tempvoice' ? 'active' : ''}`}
            >
              <Mic size={16} />
              Temp Voice
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('polls')}
              className={`sidebar-menu-item ${activeTab === 'polls' ? 'active' : ''}`}
            >
              <BarChart2 size={16} />
              Premium Polls
            </button>

            {user && user.isAdmin && (
              <>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '8px 0' }} />
                <button
                  type="button"
                  onClick={() => handleTabClick('server-control')}
                  className={`sidebar-menu-item ${activeTab === 'server-control' ? 'active' : ''}`}
                  style={{ color: 'var(--primary)', fontWeight: 'bold' }}
                >
                  <Server size={16} />
                  Server Control
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Right Content Panel */}
        <main className="dashboard-right-content">
          {/* Global Notifications */}
          {successMsg && (
            <div className="glass-panel pulse-glow" style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              backgroundColor: 'rgba(16, 185, 129, 0.9)',
              borderColor: 'var(--success)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 100,
              fontFamily: 'Outfit',
              fontWeight: '600'
            }}>
              <CheckCircle size={18} />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="glass-panel" style={{
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              borderColor: 'var(--danger)',
              color: 'var(--danger)',
              padding: '14px 20px',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertTriangle size={18} />
              {errorMsg}
            </div>
          )}

          {activeTab === 'server-control' && user && user.isAdmin ? (
            <AdminServerSettings
              guildId={guildId}
              onHasUnsavedChangesChange={setAdminHasUnsavedChanges}
            />
          ) : (
            <form onSubmit={handleSave} onKeyDown={handleFormKeyDown}>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div>

                  <div className="overview-stats-container">
                    <div className="overview-stat-panel">
                      <span className="overview-stat-label">Members</span>
                      <h3 className="overview-stat-number">{memberCount || 66}</h3>
                    </div>
                    <div className="overview-stat-panel">
                      <span className="overview-stat-label">Text Channels</span>
                      <h3 className="overview-stat-number">{channels.length || 54}</h3>
                    </div>
                    <div className="overview-stat-panel">
                      <span className="overview-stat-label">Voice Channels</span>
                      <h3 className="overview-stat-number">{voiceChannels.length || 4}</h3>
                    </div>
                  </div>

                  <div className="checklist-card-box">
                    <h3 className="checklist-title-h3">Active Modules Checklist</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { label: 'Auto-Moderation', enabled: settings?.moderation?.spam?.enabled },
                        { label: 'Welcome Embeds & Roles', enabled: settings?.welcome?.enabled },
                        { label: 'Security Verification Button', enabled: settings?.verification?.enabled },
                        { label: 'Support Tickets System', enabled: settings?.tickets?.enabled },
                        { label: 'Temporary Voice Channels', enabled: settings?.tempVoice?.enabled },
                        { label: 'Server Action Auditing Logs', enabled: true },
                        { label: 'Anti-nuke Admin Shield', enabled: settings?.antinuke?.enabled }
                      ].map((module, idx) => (
                        <div key={idx} className="checklist-row-item">
                          <span className="checklist-row-label">{module.label}</span>
                          <span className={`badge-status-pill ${module.enabled ? 'enabled' : 'disabled'}`}>
                            {module.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overview Quick Config: Discord Audit Log Channel */}
                  <div className="glass-panel" style={{ padding: '24px', marginTop: '24px', backgroundColor: 'rgba(37, 99, 235, 0.03)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>
                          🛡️ Discord Server Audit Log Channel Dispatch
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Send all server audit logs (bans, kicks, mutes, voice activity, roles, channels, messages) as text & embeds to your Discord channel.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTabClick('logs')}
                        className="btn"
                        style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                      >
                        View Live Audit Logs →
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      <div>
                        <label className="form-label" style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Hash size={16} /> Select Discord Audit Log Text Channel
                        </label>
                        <select
                          className="form-control"
                          value={settings?.logging?.logChannelId || ''}
                          onChange={(e) => handleInputChange('logging.logChannelId', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            outline: 'none',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                          }}
                        >
                          <option value="" style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}>-- No Channel Selected (Disabled) --</option>
                          {channels.map(ch => (
                            <option key={ch.id} value={ch.id} style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>#{ch.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleApplyChannelToAllLogs(settings?.logging?.logChannelId)}
                          disabled={!settings?.logging?.logChannelId}
                          style={{
                            marginTop: '8px',
                            padding: '8px 12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            cursor: settings?.logging?.logChannelId ? 'pointer' : 'not-allowed',
                            width: '100%'
                          }}
                        >
                          ⚡ Route ALL Server Logs & Audits to This Channel
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>Audit Logger Master Switch</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Send live server audit logs to Discord chat</div>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings?.logging?.enabled !== false}
                            onChange={() => handleToggle('logging.enabled')}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MODERATION */}
              {activeTab === 'moderation' && (
                <div>

                  {/* Section 1: Spam Protection */}
                  <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Spam Message Blocker</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Deletes spam messages and automatically applies timeouts to spamming users.</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.moderation.spam.enabled}
                          onChange={() => handleToggle('moderation.spam.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.moderation.spam.enabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Spam Threshold (messages)</label>
                            <input
                              type="number"
                              min="2"
                              max="30"
                              value={settings.moderation.spam.maxMessages ?? 5}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleInputChange('moderation.spam.maxMessages', val === '' ? '' : parseInt(val));
                              }}
                              className="glass-input"
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Interval Window (seconds)</label>
                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={settings.moderation.spam.timeWindow === '' ? '' : (settings.moderation.spam.timeWindow !== undefined ? settings.moderation.spam.timeWindow / 1000 : 5)}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleInputChange('moderation.spam.timeWindow', val === '' ? '' : parseInt(val) * 1000);
                              }}
                              className="glass-input"
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Auto Timeout Duration (minutes)</label>
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={settings.moderation.spam.timeoutDuration ?? 5}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleInputChange('moderation.spam.timeoutDuration', val === '' ? '' : parseInt(val));
                              }}
                              className="glass-input"
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Spam Protected Channels</label>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Select channels here where spam protection will be active.</p>
                          <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            {channels.map(ch => (
                              <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                  type="checkbox"
                                  checked={(settings.moderation.spam.protectedChannels || []).includes(ch.id)}
                                  onChange={(e) => {
                                    const current = [...(settings.moderation.spam.protectedChannels || [])];
                                    if (e.target.checked) {
                                      current.push(ch.id);
                                    } else {
                                      const index = current.indexOf(ch.id);
                                      if (index > -1) current.splice(index, 1);
                                    }
                                    handleInputChange('moderation.spam.protectedChannels', current);
                                  }}
                                />
                                #{ch.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Link Protection */}
                  <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Link Protection & Filters</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Instantly blocks and deletes links posted in guarded text channels.</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.moderation.links.enabled}
                          onChange={() => handleToggle('moderation.links.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.moderation.links.enabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Allowed Link Whitelist (one domain per line, e.g. youtube.com)</label>
                          <textarea
                            rows="3"
                            placeholder="youtube.com&#10;discord.gg"
                            value={settings.moderation.links.allowedLinks.join('\n')}
                            onChange={(e) => handleInputChange('moderation.links.allowedLinks', e.target.value.split('\n').filter(Boolean))}
                            className="glass-input"
                            style={{ fontFamily: 'monospace' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Link Protected Channels</label>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Select channels here where link protection will be active.</p>
                          <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            {channels.map(ch => (
                              <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                  type="checkbox"
                                  checked={(settings.moderation.links.protectedChannels || []).includes(ch.id)}
                                  onChange={(e) => {
                                    const current = [...(settings.moderation.links.protectedChannels || [])];
                                    if (e.target.checked) {
                                      current.push(ch.id);
                                    } else {
                                      const index = current.indexOf(ch.id);
                                      if (index > -1) current.splice(index, 1);
                                    }
                                    handleInputChange('moderation.links.protectedChannels', current);
                                  }}
                                />
                                #{ch.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Photo Spam Protection */}
                  <div className="glass-panel" style={{ padding: '24px', marginTop: '24px', backgroundColor: 'rgba(255,255,255,0.01)', overflow: 'visible' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Photo Spam Protection</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Detects users spamming photos/images across any channel in the server, deletes the messages, and issues a timeout.</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.moderation?.photoSpam?.enabled || false}
                          onChange={() => handleToggle('moderation.photoSpam.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {(settings.moderation?.photoSpam?.enabled) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Photo Threshold (images)</label>
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={settings.moderation?.photoSpam?.maxPhotos ?? 3}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleInputChange('moderation.photoSpam.maxPhotos', val === '' ? '' : parseInt(val));
                              }}
                              className="glass-input"
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Interval Window (seconds)</label>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={settings.moderation?.photoSpam?.timeWindow === '' ? '' : (settings.moderation?.photoSpam?.timeWindow !== undefined ? settings.moderation.photoSpam.timeWindow / 1000 : 10)}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleInputChange('moderation.photoSpam.timeWindow', val === '' ? '' : parseInt(val) * 1000);
                              }}
                              className="glass-input"
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Auto Timeout Duration (minutes)</label>
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={settings.moderation?.photoSpam?.timeoutDuration ?? 10}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleInputChange('moderation.photoSpam.timeoutDuration', val === '' ? '' : parseInt(val));
                              }}
                              className="glass-input"
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Photo Spam Whitelisted Channels</label>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Select channels here where users are ALLOWED to spam photos (bypasses protection).</p>
                          <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            {channels.map(ch => (
                              <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                  type="checkbox"
                                  checked={(settings.moderation?.photoSpam?.whitelistedChannels || []).includes(ch.id)}
                                  onChange={(e) => {
                                    const current = [...(settings.moderation?.photoSpam?.whitelistedChannels || [])];
                                    if (e.target.checked) {
                                      current.push(ch.id);
                                    } else {
                                      const index = current.indexOf(ch.id);
                                      if (index > -1) current.splice(index, 1);
                                    }
                                    handleInputChange('moderation.photoSpam.whitelistedChannels', current);
                                  }}
                                />
                                #{ch.name}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Spam Protection Whitelist */}
                        <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px', color: '#ffffff' }}>Spam Protection Whitelist</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            Whitelisted users bypass all spam protection modules (Photo Spam, Message Spam, Link Spam, etc.).
                          </p>

                          <div style={{ position: 'relative', zIndex: 10, marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                              Search and Add Member to Whitelist
                            </label>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                  type="text"
                                  placeholder="Type username or member ID to search..."
                                  value={modWhitelistSearchQuery}
                                  onChange={(e) => setModWhitelistSearchQuery(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleManualAddModWhitelist();
                                    }
                                  }}
                                  className="glass-input"
                                  style={{ width: '100%', padding: '12px' }}
                                />
                                {modWhitelistSearchLoading && (
                                  <div style={{ position: 'absolute', right: '15px', top: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Searching...</div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={handleManualAddModWhitelist}
                                className="btn-primary"
                                style={{ padding: '0 24px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                Add
                              </button>
                            </div>

                            {modWhitelistSearchedMembers.length > 0 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  right: 0,
                                  top: '100%',
                                  background: 'rgba(25, 25, 35, 0.98)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '8px',
                                  marginTop: '5px',
                                  maxHeight: '200px',
                                  overflowY: 'auto',
                                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                  backdropFilter: 'blur(10px)',
                                  zIndex: 1000
                                }}
                              >
                                {modWhitelistSearchedMembers
                                  .filter(m => !(settings.moderation?.whitelistedUsers || []).some(u => u.userId === m.id))
                                  .map(m => (
                                    <div
                                      key={m.id}
                                      onClick={() => { handleAddModWhitelist(m.id, m); setModWhitelistSearchQuery(''); }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 14px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                      }}
                                      className="search-item"
                                    >
                                      <img
                                        src={m.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                      />
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{m.displayName}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{m.username} • {m.id}</span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <div style={{ marginTop: '16px' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                              Whitelisted Users:
                            </h4>
                            {(settings.moderation?.whitelistedUsers || []).length === 0 ? (
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                No whitelisted users. All members, including Server Owner and Administrators, will be subject to spam protection.
                              </p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(settings.moderation.whitelistedUsers || []).map(entry => {
                                  const details = getMemberDetails(entry.userId);
                                  return (
                                    <div
                                      key={entry.userId}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-color)'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                          src={details.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                        <div>
                                          <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>
                                            {details.displayName} {details.username && details.username !== entry.userId && `(@${details.username})`} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(ID: {entry.userId})</span>
                                          </div>
                                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Added by: {entry.addedBy || 'Unknown'}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveModWhitelist(entry.userId)}
                                        className="btn-danger"
                                        style={{
                                          border: 'none',
                                          background: 'rgba(239, 68, 68, 0.1)',
                                          color: 'var(--danger)',
                                          cursor: 'pointer',
                                          padding: '6px 12px',
                                          borderRadius: '4px',
                                          fontSize: '0.8rem',
                                          fontWeight: 'bold',
                                          transition: 'all 0.2s ease'
                                        }}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 5: Auto Moderation & Word Filter System */}
                  <div className="glass-panel" style={{ padding: '24px', marginTop: '24px', backgroundColor: 'rgba(255,255,255,0.01)', overflow: 'visible' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>Auto Moderation & Word Filter</h3>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Automatically detects, deletes, and logs messages containing forbidden words or phrases across all channels (including voice text chats).
                        </p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings?.moderation?.wordFilter?.enabled || false}
                          onChange={() => handleToggle('moderation.wordFilter.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings?.moderation?.wordFilter?.enabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>

                        {/* Feature Toggles */}
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>System Feature Toggles</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block' }}>Auto-Delete Message</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Removes forbidden message</span>
                              </div>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={settings?.moderation?.wordFilter?.autoDelete !== false}
                                  onChange={() => handleToggle('moderation.wordFilter.autoDelete')}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block' }}>Auto-Timeout User</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applies timed mute</span>
                              </div>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={settings?.moderation?.wordFilter?.autoTimeout !== false}
                                  onChange={() => handleToggle('moderation.wordFilter.autoTimeout')}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block' }}>Send Channel Warning</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-deleting alert</span>
                              </div>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={settings?.moderation?.wordFilter?.sendAlert !== false}
                                  onChange={() => handleToggle('moderation.wordFilter.sendAlert')}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block' }}>Strict Anti-Bypass</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spaces, dots, homoglyphs</span>
                              </div>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={settings?.moderation?.wordFilter?.strictBypassProtection !== false}
                                  onChange={() => handleToggle('moderation.wordFilter.strictBypassProtection')}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>

                          </div>
                        </div>

                        {/* Controls Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Punishment Action</label>
                            <select
                              className="glass-input"
                              value={settings?.moderation?.wordFilter?.action || 'delete_timeout'}
                              onChange={(e) => handleInputChange('moderation.wordFilter.action', e.target.value)}
                            >
                              <option value="delete_timeout">Delete Message & Timeout User</option>
                              <option value="delete">Delete Message Only</option>
                              <option value="delete_warn">Delete Message & Channel Warning Only</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Violation Limit (Limit Before Timeout)</label>
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={settings?.moderation?.wordFilter?.maxViolations ?? 3}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleInputChange('moderation.wordFilter.maxViolations', val === '' ? '' : parseInt(val));
                              }}
                              className="glass-input"
                              placeholder="3"
                            />
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              Allowed word offenses before giving a timeout (e.g. 3 = first 3 times detected & logged, 4th causes timeout).
                            </span>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Timeout Duration (minutes)</label>
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={settings?.moderation?.wordFilter?.timeoutDuration ?? 10}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleInputChange('moderation.wordFilter.timeoutDuration', val === '' ? '' : parseInt(val));
                              }}
                              className="glass-input"
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Discord Moderation Log Channel</label>
                            <select
                              className="glass-input"
                              value={settings?.moderation?.wordFilter?.logChannelId || ''}
                              onChange={(e) => handleInputChange('moderation.wordFilter.logChannelId', e.target.value)}
                            >
                              <option value="">-- No Logging (Disabled) --</option>
                              {channels.map(ch => (
                                <option key={ch.id} value={ch.id}>#{ch.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Channel Alert Message Template</label>
                          <input
                            type="text"
                            placeholder="{user}, your message contained a forbidden word and was removed."
                            value={settings?.moderation?.wordFilter?.alertMessage || ''}
                            onChange={(e) => handleInputChange('moderation.wordFilter.alertMessage', e.target.value)}
                            className="glass-input"
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                            Available placeholders: <code>{`{user}`}</code> (mention), <code>{`{username}`}</code>, <code>{`{server}`}</code>.
                          </span>
                        </div>

                        {/* Filtered Words List & Management */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>
                                Filtered Words & Phrases Directory ({settings?.moderation?.wordFilter?.words?.length || 0})
                              </h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Messages matching any word or pattern here will trigger auto moderation actions.</p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                type="button"
                                onClick={() => setShowWordBulkModal(true)}
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px' }}
                              >
                                <UploadCloud size={16} /> Bulk Upload (TXT / CSV)
                              </button>

                              {settings?.moderation?.wordFilter?.words?.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to clear ALL filtered words?')) {
                                      handleInputChange('moderation.wordFilter.words', []);
                                    }
                                  }}
                                  className="btn-danger"
                                  style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                                >
                                  Clear All
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Add single word & search row */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder="Type word or phrase to filter..."
                                value={wordFilterInput}
                                onChange={(e) => setWordFilterInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (wordFilterInput.trim()) {
                                      const currentWords = settings?.moderation?.wordFilter?.words || [];
                                      const newWord = wordFilterInput.trim().toLowerCase();
                                      if (!currentWords.includes(newWord)) {
                                        handleInputChange('moderation.wordFilter.words', [...currentWords, newWord]);
                                      }
                                      setWordFilterInput('');
                                    }
                                  }
                                }}
                                className="glass-input"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (wordFilterInput.trim()) {
                                    const currentWords = settings?.moderation?.wordFilter?.words || [];
                                    const newWord = wordFilterInput.trim().toLowerCase();
                                    if (!currentWords.includes(newWord)) {
                                      handleInputChange('moderation.wordFilter.words', [...currentWords, newWord]);
                                    }
                                    setWordFilterInput('');
                                  }
                                }}
                                className="btn-primary"
                                style={{ padding: '0 18px', whiteSpace: 'nowrap' }}
                              >
                                Add Word
                              </button>
                            </div>

                            <input
                              type="text"
                              placeholder="🔍 Search active word list..."
                              value={wordFilterSearch}
                              onChange={(e) => setWordFilterSearch(e.target.value)}
                              className="glass-input"
                            />
                          </div>

                          {/* Word Chips Display Container */}
                          <div style={{
                            maxHeight: '220px',
                            overflowY: 'auto',
                            padding: '12px',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}>
                            {(!settings?.moderation?.wordFilter?.words || settings.moderation.wordFilter.words.length === 0) ? (
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', width: '100%', textAlign: 'center', margin: '20px 0' }}>
                                No filtered words configured yet. Type a word above or click "Bulk Upload" to add words.
                              </p>
                            ) : (
                              settings.moderation.wordFilter.words
                                .filter(w => !wordFilterSearch || w.toLowerCase().includes(wordFilterSearch.toLowerCase()))
                                .map((w, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      background: 'rgba(59, 130, 246, 0.15)',
                                      color: '#93c5fd',
                                      border: '1px solid rgba(59, 130, 246, 0.3)',
                                      padding: '4px 10px',
                                      borderRadius: '20px',
                                      fontSize: '0.85rem',
                                      fontWeight: '500'
                                    }}
                                  >
                                    {w}
                                    <X
                                      size={14}
                                      style={{ cursor: 'pointer', opacity: 0.7 }}
                                      onClick={() => {
                                        const updated = settings.moderation.wordFilter.words.filter(item => item !== w);
                                        handleInputChange('moderation.wordFilter.words', updated);
                                      }}
                                    />
                                  </span>
                                ))
                            )}
                          </div>
                        </div>

                        {/* Role & User Whitelists */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

                          {/* Role Whitelist */}
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Whitelisted Roles</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Members with any of these roles bypass the word filter completely.</p>
                            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                              {roles.map(r => {
                                const isRoleChecked = (settings?.moderation?.wordFilter?.whitelistedRoles || []).some(item => item.roleId === r.id);
                                return (
                                  <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <input
                                      type="checkbox"
                                      checked={isRoleChecked}
                                      onChange={(e) => {
                                        const currentRoles = [...(settings?.moderation?.wordFilter?.whitelistedRoles || [])];
                                        if (e.target.checked) {
                                          currentRoles.push({ roleId: r.id, name: r.name, color: r.color });
                                        } else {
                                          const idx = currentRoles.findIndex(item => item.roleId === r.id);
                                          if (idx > -1) currentRoles.splice(idx, 1);
                                        }
                                        handleInputChange('moderation.wordFilter.whitelistedRoles', currentRoles);
                                      }}
                                    />
                                    <span style={{ color: r.color && r.color !== '#000000' ? r.color : '#ffffff', fontWeight: '500' }}>@{r.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* User Whitelist */}
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Whitelisted Users</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Specific users who bypass word filter checks.</p>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                              <input
                                type="text"
                                placeholder="Search username or user ID..."
                                value={wordWhitelistSearchQuery}
                                onChange={(e) => setWordWhitelistSearchQuery(e.target.value)}
                                className="glass-input"
                                style={{ fontSize: '0.85rem' }}
                              />
                            </div>

                            {wordWhitelistSearchQuery && (
                              <div style={{ maxHeight: '120px', overflowY: 'auto', background: 'rgba(25,25,35,0.95)', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '10px' }}>
                                {allMembers
                                  .filter(m => (m.username?.toLowerCase().includes(wordWhitelistSearchQuery.toLowerCase()) || m.id?.includes(wordWhitelistSearchQuery)))
                                  .map(m => (
                                    <div
                                      key={m.id}
                                      onClick={() => {
                                        const current = settings?.moderation?.wordFilter?.whitelistedUsers || [];
                                        if (!current.some(u => u.userId === m.id)) {
                                          handleInputChange('moderation.wordFilter.whitelistedUsers', [...current, { userId: m.id, username: m.username, displayName: m.displayName, avatar: m.avatar }]);
                                        }
                                        setWordWhitelistSearchQuery('');
                                      }}
                                      style={{ padding: '6px 10px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}
                                    >
                                      {m.displayName} (@{m.username})
                                    </div>
                                  ))}
                              </div>
                            )}

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {(settings?.moderation?.wordFilter?.whitelistedUsers || []).map(u => (
                                <span key={u.userId} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  {u.username || u.userId}
                                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => {
                                    const updated = (settings?.moderation?.wordFilter?.whitelistedUsers || []).filter(x => x.userId !== u.userId);
                                    handleInputChange('moderation.wordFilter.whitelistedUsers', updated);
                                  }} />
                                </span>
                              ))}
                            </div>
                          </div>

                        </div>

                        {/* Interactive Anti-Bypass Tester / Playground */}
                        <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#c084fc', marginBottom: '4px' }}>
                            ⚡ Interactive Anti-Bypass Tester
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Test strings against your active word list to verify anti-bypass detection (handles dots, spaces, homoglyphs, and repeated chars).
                          </p>

                          <input
                            type="text"
                            placeholder="Type test message (e.g. w.o.r.d, w0rd, f u c k)..."
                            value={wordFilterTestInput}
                            onChange={(e) => setWordFilterTestInput(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', marginBottom: '10px' }}
                          />

                          {wordFilterTestInput && (() => {
                            const testRes = testWordFilter(wordFilterTestInput, settings?.moderation?.wordFilter?.words || [], settings?.moderation?.wordFilter?.strictBypassProtection !== false);
                            return (
                              <div style={{ padding: '10px 14px', borderRadius: '8px', background: testRes.containsForbidden ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', border: testRes.containsForbidden ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)' }}>
                                {testRes.containsForbidden ? (
                                  <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    🚨 CAUGHT BY FILTER! Detected Word: "{testRes.detectedWord}" ({testRes.matchedPattern})
                                  </span>
                                ) : (
                                  <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    ✅ PASSED (No forbidden words detected)
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: WELCOME SYSTEM */}
              {/* TAB: ANTINUKE PROTECTION */}
              {activeTab === 'antinuke' && settings && settings.antinuke && (
                <div>

                  {/* Main Enable Panel */}
                  <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Anti-Nuker System Status</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Globally enable or disable automated protection actions against malicious actions.</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.antinuke.enabled || false}
                          onChange={() => handleToggle('antinuke.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.antinuke.enabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Breach Response Action</label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Punishment applied to administrators who breach limit thresholds.</p>
                            <select
                              className="glass-input"
                              value={settings.antinuke.punishment || 'stripall'}
                              onChange={(e) => handleInputChange('antinuke.punishment', e.target.value)}
                            >
                              <option value="stripall">Strip Admin Roles (Remove permissions)</option>
                              <option value="ban">Ban Executor</option>
                              <option value="kick">Kick Executor</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Action Limit Threshold</label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Number of dangerous actions allowed before triggering penalty.</p>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={settings.antinuke.threshold ?? 3}
                              onChange={(e) => handleInputChange('antinuke.threshold', e.target.value === '' ? '' : parseInt(e.target.value))}
                              className="glass-input"
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Rate Limit Timeframe (seconds)</label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Duration in seconds to track consecutive actions.</p>
                            <input
                              type="number"
                              min="1"
                              max="3600"
                              value={settings.antinuke.timeframe ?? 60}
                              onChange={(e) => handleInputChange('antinuke.timeframe', e.target.value === '' ? '' : parseInt(e.target.value))}
                              className="glass-input"
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Alert Log Channel</label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Channel where automatic alerts and logs are sent.</p>
                            <select
                              className="glass-input"
                              value={settings.antinuke.logChannelId || ''}
                              onChange={(e) => handleInputChange('antinuke.logChannelId', e.target.value)}
                            >
                              <option value="">System Default Channel</option>
                              {channels.map(ch => (
                                <option key={ch.id} value={ch.id}>#{ch.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {settings.antinuke.enabled && (
                    <>
                      {/* Grid for Actions & Limits */}
                      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Protection Action Controls</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Enable specific protective monitors to defend your server against malicious activities.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                          {[
                            { key: 'antiBan', title: 'Anti-Ban Monitor', desc: 'Prevents rogue staff from mass banning members.' },
                            { key: 'antiKick', title: 'Anti-Kick Monitor', desc: 'Prevents rogue staff from mass kicking members.' },
                            { key: 'antiChannelCreate', title: 'Anti-Channel Create', desc: 'Prevents spam creation of channels by malicious accounts.' },
                            { key: 'antiChannelDelete', title: 'Anti-Channel Delete', desc: 'Prevents rogue staff from deleting channels.' },
                            { key: 'antiRoleCreate', title: 'Anti-Role Create', desc: 'Prevents creation of dangerous roles.' },
                            { key: 'antiRoleDelete', title: 'Anti-Role Delete', desc: 'Prevents rogue staff from deleting roles.' },
                            { key: 'antiRoleUpdate', title: 'Anti-Role Update', desc: 'Prevents adding dangerous permissions (e.g. Administrator) to roles.' },
                            { key: 'antiWebhook', title: 'Anti-Webhook Create', desc: 'Prevents unauthorized creation of webhooks.' },
                            { key: 'antiBot', title: 'Anti-Bot Additions', desc: 'Instantly kick unauthorized bots added to the server.' },
                            { key: 'antiGuildUpdate', title: 'Anti-Guild Update', desc: 'Prevents unauthorized editing of server settings.' },
                            { key: 'antiEmoji', title: 'Anti-Emoji Changes', desc: 'Prevents mass creation/deletion/editing of emojis.' },
                            { key: 'antiChannelEdit', title: 'Anti-Channel Edit', desc: 'Prevents mass unauthorized editing of channels.' }
                          ].map(opt => (
                            <div key={opt.key} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                              <div style={{ flex: 1, marginRight: '16px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{opt.title}</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{opt.desc}</p>
                              </div>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={settings.antinuke[opt.key] || false}
                                  onChange={() => handleToggle(`antinuke.${opt.key}`)}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Whitelisted Users Whitelist manager */}
                      <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.01)', overflow: 'visible' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Whitelisted Administrators</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Whitelisted users bypass anti-nuker restrictions. Guild owner and the bot itself are whitelisted by default.</p>

                        <div style={{ position: 'relative', zIndex: 10, marginBottom: '24px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Search and Add Administrator to Whitelist</label>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <input
                                type="text"
                                placeholder="Type username or member ID to search..."
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleManualAddWhitelist();
                                  }
                                }}
                                className="glass-input"
                                style={{ width: '100%', padding: '12px' }}
                              />
                              {searchLoading && (
                                <div style={{ position: 'absolute', right: '15px', top: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Searching...</div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleManualAddWhitelist}
                              className="btn-primary"
                              style={{ padding: '0 24px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              Add
                            </button>
                          </div>

                          {searchedMembers.length > 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: '100%',
                                background: 'rgba(25, 25, 35, 0.98)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                marginTop: '5px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(10px)',
                                zIndex: 1000
                              }}
                            >
                              {searchedMembers
                                .filter(m => !(settings.antinuke.whitelistedUsers || []).some(u => u.userId === m.id))
                                .map(m => (
                                  <div
                                    key={m.id}
                                    onClick={() => { handleAddWhitelist(m.id, selectedWhitelistEvents, m); setMemberSearchQuery(''); }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      padding: '10px 14px',
                                      cursor: 'pointer',
                                      borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                    className="search-item"
                                  >
                                    <img
                                      src={m.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{m.displayName}</span>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{m.username} • {m.id}</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}

                          {/* Specific Event Whitelist Selection */}
                          <div style={{ marginTop: '14px', padding: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                              Optional: Whitelist only for specific events (Keep unselected to whitelist for ALL events)
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                              {[
                                { id: 'ban', label: 'Anti Ban' },
                                { id: 'kick', label: 'Anti Kick' },
                                { id: 'channel_create', label: 'Anti Channel Create' },
                                { id: 'channel_delete', label: 'Anti Channel Delete' },
                                { id: 'role_create', label: 'Anti Role Create' },
                                { id: 'role_delete', label: 'Anti Role Delete' },
                                { id: 'role_update', label: 'Anti Role Update' },
                                { id: 'webhook_create', label: 'Anti Webhook' },
                                { id: 'bot_add', label: 'Anti Bot' },
                                { id: 'guild_update', label: 'Anti Guild Update' },
                                { id: 'emoji_create', label: 'Anti Emoji Create' },
                                { id: 'emoji_delete', label: 'Anti Emoji Delete' },
                                { id: 'emoji_update', label: 'Anti Emoji Update' },
                                { id: 'channel_edit', label: 'Anti Channel Edit' }
                              ].map(evOpt => (
                                <label key={evOpt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedWhitelistEvents.includes(evOpt.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedWhitelistEvents(prev => [...prev, evOpt.id]);
                                      } else {
                                        setSelectedWhitelistEvents(prev => prev.filter(x => x !== evOpt.id));
                                      }
                                    }}
                                  />
                                  {evOpt.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '20px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>Whitelisted Admins:</h4>
                          {(settings.antinuke.whitelistedUsers || []).length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No custom whitelisted users. Only the Server Owner and Bot have bypass privileges.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {(settings.antinuke.whitelistedUsers || []).map(entry => {
                                const details = getMemberDetails(entry.userId);
                                return (
                                  <div
                                    key={entry.userId}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '10px 16px',
                                      borderRadius: '8px',
                                      background: 'rgba(255,255,255,0.03)',
                                      border: '1px solid var(--border-color)'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <img
                                        src={details.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                      />
                                      <div>
                                        <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>
                                          {details.displayName} {details.username && details.username !== entry.userId && `(@${details.username})`} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(ID: {entry.userId})</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                          Added by: {entry.addedBy || 'Unknown'} • Whitelisted for: {(!entry.events || entry.events.length === 0) ? 'All Events' : entry.events.join(', ')}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveWhitelist(entry.userId)}
                                      className="btn-danger"
                                      style={{
                                        border: 'none',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: 'var(--danger)',
                                        cursor: 'pointer',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'welcome' && (
                <div>

                  <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.01)', overflow: 'visible' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Welcome Messages & Cards</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Send an automated canvas image card or message when members join.</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.welcome.enabled}
                          onChange={() => handleToggle('welcome.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.welcome.enabled && (
                      <div className="welcome-split-layout" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div className="welcome-settings-column">

                          {/* Welcome Message Layout Selection */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>Welcome Message Layout Type</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                              {[
                                { id: 'classic', title: 'Classic Card', desc: 'Message text + image card attachment' },
                                { id: 'embed-card', title: 'Embed with Card', desc: 'Rich embed with card image loaded inside' },
                                { id: 'embed-only', title: 'Embed Only', desc: 'Rich embed only (no card image)' },
                                { id: 'text-only', title: 'Text Message Only', desc: 'Plain text message only' }
                              ].map(layoutOption => (
                                <div
                                  key={layoutOption.id}
                                  onClick={() => handleInputChange('welcome.layoutType', layoutOption.id)}
                                  style={{
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    border: `2px solid ${settings.welcome.layoutType === layoutOption.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`,
                                    backgroundColor: settings.welcome.layoutType === layoutOption.id ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                  }}
                                >
                                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: settings.welcome.layoutType === layoutOption.id ? '#ffffff' : 'var(--text-secondary)' }}>
                                    {layoutOption.title}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1rem' }}>
                                    {layoutOption.desc}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Channel and Font Family Row */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Greeting Channel</label>
                              <select
                                value={settings.welcome.channelId}
                                onChange={(e) => handleInputChange('welcome.channelId', e.target.value)}
                                className="glass-input"
                              >
                                <option value="">-- Select Channel --</option>
                                {channels.map(ch => (
                                  <option key={ch.id} value={ch.id}>#{ch.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Font Family</label>
                              <select
                                value={settings.welcome.fontFamily || 'Ethnocentric'}
                                onChange={(e) => handleInputChange('welcome.fontFamily', e.target.value)}
                                className="glass-input"
                              >
                                <option value="Ethnocentric">Ethnocentric (Futuristic) (Default)</option>
                                <option value="Oxanium">Oxanium (Cyberpunk)</option>
                                <option value="Sans">Sans-Serif</option>
                                <option value="Poppins">Poppins</option>
                                <option value="Montserrat">Montserrat</option>
                                <option value="Bebas Neue">Bebas Neue</option>
                                <option value="Orbitron">Orbitron</option>
                                <option value="Oswald">Oswald</option>
                                <option value="Inter">Inter</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Permanent Marker">Permanent Marker (Brush)</option>
                              </select>
                            </div>
                          </div>

                          {/* Redirect Channels Row */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Redirect Channel Link 1</label>
                              <select
                                value={settings.welcome.redirectChannelId || ''}
                                onChange={(e) => handleInputChange('welcome.redirectChannelId', e.target.value)}
                                className="glass-input"
                              >
                                <option value="">-- No redirect channel --</option>
                                {channels.map(ch => (
                                  <option key={ch.id} value={ch.id}>#{ch.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Redirect Channel Link 2</label>
                              <select
                                value={settings.welcome.redirectChannelId2 || ''}
                                onChange={(e) => handleInputChange('welcome.redirectChannelId2', e.target.value)}
                                className="glass-input"
                              >
                                <option value="">-- No redirect channel --</option>
                                {channels.map(ch => (
                                  <option key={ch.id} value={ch.id}>#{ch.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Redirect Channel Link 3</label>
                              <select
                                value={settings.welcome.redirectChannelId3 || ''}
                                onChange={(e) => handleInputChange('welcome.redirectChannelId3', e.target.value)}
                                className="glass-input"
                              >
                                <option value="">-- No redirect channel --</option>
                                {channels.map(ch => (
                                  <option key={ch.id} value={ch.id}>#{ch.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Welcomes Card Colors Row */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Title Color (Hex)</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={settings.welcome.textColor?.startsWith('#') ? settings.welcome.textColor : `#${settings.welcome.textColor || 'ffffff'}`}
                                  onChange={(e) => handleInputChange('welcome.textColor', e.target.value)}
                                  style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'none', cursor: 'pointer' }}
                                />
                                <input
                                  type="text"
                                  value={settings.welcome.textColor || '#ffffff'}
                                  onChange={(e) => handleInputChange('welcome.textColor', e.target.value)}
                                  className="glass-input"
                                  placeholder="#ffffff"
                                />
                              </div>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Username Color (Hex)</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={settings.welcome.usernameColor?.startsWith('#') ? settings.welcome.usernameColor : `#${settings.welcome.usernameColor || '2563eb'}`}
                                  onChange={(e) => handleInputChange('welcome.usernameColor', e.target.value)}
                                  style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'none', cursor: 'pointer' }}
                                />
                                <input
                                  type="text"
                                  value={settings.welcome.usernameColor || '#2563eb'}
                                  onChange={(e) => handleInputChange('welcome.usernameColor', e.target.value)}
                                  className="glass-input"
                                  placeholder="#2563eb"
                                />
                              </div>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Subtext Color (Hex)</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={settings.welcome.subtextColor?.startsWith('#') ? settings.welcome.subtextColor : `#${settings.welcome.subtextColor || 'ffffff'}`}
                                  onChange={(e) => handleInputChange('welcome.subtextColor', e.target.value)}
                                  style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'none', cursor: 'pointer' }}
                                />
                                <input
                                  type="text"
                                  value={settings.welcome.subtextColor || 'rgba(255, 255, 255, 0.7)'}
                                  onChange={(e) => handleInputChange('welcome.subtextColor', e.target.value)}
                                  className="glass-input"
                                  placeholder="rgba(255, 255, 255, 0.7)"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Font Weight and Text Alignment */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Font Weight</label>
                              <select
                                value={settings.welcome.fontWeight || 'bold'}
                                onChange={(e) => handleInputChange('welcome.fontWeight', e.target.value)}
                                className="glass-input"
                              >
                                <option value="normal">Normal</option>
                                <option value="medium">Medium (500)</option>
                                <option value="600">Semi-Bold (600)</option>
                                <option value="bold">Bold (700)</option>
                                <option value="900">Extra-Bold (900)</option>
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Text Alignment</label>
                              <select
                                value={settings.welcome.textAlignment || 'center'}
                                onChange={(e) => handleInputChange('welcome.textAlignment', e.target.value)}
                                className="glass-input"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                          </div>

                          {/* Welcome Message Text */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Welcome Message Template (Supports {`{user}`}, {`{username}`}, {`{server}`}, {`{channel}`}, {`{channel2}`}, {`{channel3}`})</label>
                            <textarea
                              value={settings.welcome.message}
                              onChange={(e) => handleInputChange('welcome.message', e.target.value)}
                              className="glass-input"
                              placeholder="Welcome {user} to the server!"
                              rows="3"
                              style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              If any Redirect Channels are selected, buttons linking to them will also be attached automatically (up to 3 links).
                            </span>
                          </div>

                          {/* Welcome Card Custom Text Templates */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Card Title Text Template</label>
                              <input
                                type="text"
                                value={settings.welcome.titleText !== undefined ? settings.welcome.titleText : 'WELCOME'}
                                onChange={(e) => handleInputChange('welcome.titleText', e.target.value)}
                                className="glass-input"
                                placeholder="e.g. WELCOME"
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Card Subtext Template (Supports {`{server}`})</label>
                              <input
                                type="text"
                                value={settings.welcome.subtextText !== undefined ? settings.welcome.subtextText : 'TO {server}'}
                                onChange={(e) => handleInputChange('welcome.subtextText', e.target.value)}
                                className="glass-input"
                                placeholder="e.g. TO {server}"
                              />
                            </div>
                          </div>

                          {/* Background Upload and controls */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Background Image/GIF URL or Solid Color Hex</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="text"
                                  value={settings.welcome.background}
                                  onChange={(e) => handleInputChange('welcome.background', e.target.value)}
                                  className="glass-input"
                                  placeholder="https://example.com/background.png or #0F0C20"
                                />
                                <label className="btn-secondary" style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
                                  Upload File
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      setUploadFile(file);
                                      setShowCropModal(true);
                                      e.target.value = null; // Clear so same file works again
                                    }}
                                  />
                                </label>
                              </div>
                            </div>

                            <div style={{ marginTop: '24px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                  type="checkbox"
                                  checked={settings.welcome.gifSupport}
                                  onChange={() => handleToggle('welcome.gifSupport')}
                                />
                                Enable GIF URL Embed
                              </label>
                            </div>
                          </div>

                          {/* Welcome Embed Customizer Section (Matching Example Image 1) */}
                          <div className="glass-panel" style={{
                            padding: '20px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(24, 25, 30, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            marginTop: '16px',
                            marginBottom: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                          }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                                Welcome Embed Customizer
                              </h4>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                                Customize color, thumbnail, author, title, description markdown, fields, main image banner, and footer icon.
                              </p>
                            </div>

                            {/* Top Row: Color & Thumbnail */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '16px', alignItems: 'flex-start' }}>
                              
                              {/* Color Picker & Swatches */}
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                  Color
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0f1013', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px' }}>
                                    <input
                                      type="color"
                                      value={settings.welcome.embedColor?.startsWith('#') ? settings.welcome.embedColor : `#${settings.welcome.embedColor || '2563eb'}`}
                                      onChange={(e) => handleInputChange('welcome.embedColor', e.target.value)}
                                      style={{ width: '28px', height: '28px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                    />
                                    <input
                                      type="text"
                                      value={settings.welcome.embedColor || '#2563eb'}
                                      onChange={(e) => handleInputChange('welcome.embedColor', e.target.value)}
                                      style={{ width: '75px', background: 'none', border: 'none', color: '#ffffff', fontSize: '0.85rem', fontFamily: 'monospace', outline: 'none' }}
                                      placeholder="#2563eb"
                                    />
                                  </div>

                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                    {[
                                      '#000000', '#2ecc71', '#3498db', '#9b59b6', '#e91e63',
                                      '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#34495e', '#ffffff'
                                    ].map(colorHex => (
                                      <button
                                        key={colorHex}
                                        type="button"
                                        onClick={() => handleInputChange('welcome.embedColor', colorHex)}
                                        style={{
                                          width: '20px',
                                          height: '20px',
                                          borderRadius: '50%',
                                          backgroundColor: colorHex,
                                          border: settings.welcome.embedColor === colorHex ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                                          cursor: 'pointer',
                                          scale: settings.welcome.embedColor === colorHex ? '1.2' : '1',
                                          transition: 'all 0.15s ease'
                                        }}
                                        title={colorHex}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Thumbnail Section */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', width: '100%', textAlign: 'right' }}>
                                  Thumbnail
                                </span>
                                <div style={{
                                  position: 'relative',
                                  width: '85px',
                                  height: '85px',
                                  borderRadius: '8px',
                                  backgroundColor: '#111216',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden'
                                }}>
                                  {(() => {
                                    const t = settings.welcome.embedThumbnail;
                                    let thumbSrc = null;
                                    if (t === '{server_icon}') thumbSrc = guildIcon || 'https://cdn.discordapp.com/embed/avatars/0.png';
                                    else if (t === 'none') thumbSrc = null;
                                    else if (t && t !== '{user_avatar}') thumbSrc = resolveUploadUrl(t);
                                    else thumbSrc = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

                                    if (thumbSrc) {
                                      return (
                                        <>
                                          <img src={thumbSrc} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                          <button
                                            type="button"
                                            onClick={() => handleInputChange('welcome.embedThumbnail', 'none')}
                                            style={{
                                              position: 'absolute',
                                              top: '4px',
                                              right: '4px',
                                              width: '18px',
                                              height: '18px',
                                              borderRadius: '50%',
                                              backgroundColor: 'rgba(0,0,0,0.85)',
                                              color: '#ffffff',
                                              border: 'none',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center'
                                            }}
                                            title="Remove Thumbnail"
                                          >
                                            <X size={12} />
                                          </button>
                                        </>
                                      );
                                    }
                                    return (
                                      <label style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '4px' }}>
                                        <ImageIcon size={22} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Upload</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          style={{ display: 'none' }}
                                          onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                              const res = await api.uploadBackground(guildId, file).catch(() => null);
                                              if (res && res.url) handleInputChange('welcome.embedThumbnail', res.url);
                                            }
                                            e.target.value = null;
                                          }}
                                        />
                                      </label>
                                    );
                                  })()}
                                </div>

                                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange('welcome.embedThumbnail', '{user_avatar}')}
                                    className="btn-secondary"
                                    style={{ padding: '2px 6px', fontSize: '0.62rem', borderRadius: '4px', background: settings.welcome.embedThumbnail === '{user_avatar}' || !settings.welcome.embedThumbnail ? 'var(--primary)' : undefined }}
                                  >
                                    User Avatar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange('welcome.embedThumbnail', '{server_icon}')}
                                    className="btn-secondary"
                                    style={{ padding: '2px 6px', fontSize: '0.62rem', borderRadius: '4px', background: settings.welcome.embedThumbnail === '{server_icon}' ? 'var(--primary)' : undefined }}
                                  >
                                    Server Icon
                                  </button>
                                </div>
                              </div>

                            </div>

                            {/* Author Section */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Author
                              </label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <label className="btn-secondary" style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '38px', borderRadius: '6px' }} title="Upload Author Icon">
                                  <ImageIcon size={16} />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        const res = await api.uploadBackground(guildId, file).catch(() => null);
                                        if (res && res.url) handleInputChange('welcome.embedAuthorIcon', res.url);
                                      }
                                      e.target.value = null;
                                    }}
                                  />
                                </label>

                                <button
                                  type="button"
                                  className="btn-secondary"
                                  onClick={() => {
                                    const url = prompt('Enter Author Link URL:', settings.welcome.embedAuthorUrl || '');
                                    if (url !== null) handleInputChange('welcome.embedAuthorUrl', url);
                                  }}
                                  style={{ padding: '8px 10px', height: '38px', borderRadius: '6px', background: settings.welcome.embedAuthorUrl ? 'var(--primary-glow)' : undefined }}
                                  title="Set Author Link URL"
                                >
                                  <LinkIcon size={16} />
                                </button>

                                <input
                                  type="text"
                                  value={settings.welcome.embedAuthorName || ''}
                                  onChange={(e) => handleInputChange('welcome.embedAuthorName', e.target.value)}
                                  className="glass-input"
                                  placeholder="HERE IS OUR WEBSITE"
                                  style={{ flex: 1 }}
                                />
                              </div>
                              {(settings.welcome.embedAuthorIcon || settings.welcome.embedAuthorUrl) && (
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  {settings.welcome.embedAuthorIcon && <span>Icon: {settings.welcome.embedAuthorIcon}</span>}
                                  {settings.welcome.embedAuthorUrl && <span>URL: {settings.welcome.embedAuthorUrl}</span>}
                                </div>
                              )}
                            </div>

                            {/* Title Section */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Title
                              </label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  onClick={() => {
                                    const url = prompt('Enter Title Link URL:', settings.welcome.embedTitleUrl || '');
                                    if (url !== null) handleInputChange('welcome.embedTitleUrl', url);
                                  }}
                                  style={{ padding: '8px 10px', height: '38px', borderRadius: '6px', background: settings.welcome.embedTitleUrl ? 'var(--primary-glow)' : undefined }}
                                  title="Set Title Link URL"
                                >
                                  <LinkIcon size={16} />
                                </button>

                                <input
                                  type="text"
                                  value={settings.welcome.embedTitle || ''}
                                  onChange={(e) => handleInputChange('welcome.embedTitle', e.target.value)}
                                  className="glass-input"
                                  placeholder="Website"
                                  style={{ flex: 1 }}
                                />
                              </div>
                              {settings.welcome.embedTitleUrl && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                  Link URL: {settings.welcome.embedTitleUrl}
                                </span>
                              )}
                            </div>

                            {/* Description Section */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                  Description
                                </label>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {(settings.welcome.message || '').length} / 4096
                                </span>
                              </div>
                              <textarea
                                value={settings.welcome.message || ''}
                                onChange={(e) => handleInputChange('welcome.message', e.target.value)}
                                className="glass-input"
                                rows="3"
                                placeholder="**BUY ALL THINGS FROM HERE <#153338781401100410>**"
                                style={{ width: '100%', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                              />
                            </div>

                            {/* Fields Section */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                  Fields
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentFields = settings.welcome.embedFields || [];
                                    handleInputChange('welcome.embedFields', [...currentFields, { name: '', value: '', inline: false }]);
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Plus size={14} /> Add Field
                                </button>
                              </div>

                              {Array.isArray(settings.welcome.embedFields) && settings.welcome.embedFields.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {settings.welcome.embedFields.map((field, idx) => (
                                    <div key={idx} style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                          type="text"
                                          value={field.name || ''}
                                          onChange={(e) => {
                                            const newFields = [...(settings.welcome.embedFields || [])];
                                            newFields[idx].name = e.target.value;
                                            handleInputChange('welcome.embedFields', newFields);
                                          }}
                                          className="glass-input"
                                          placeholder="Field Name"
                                          style={{ flex: 1, fontSize: '0.85rem' }}
                                        />
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                          <input
                                            type="checkbox"
                                            checked={Boolean(field.inline)}
                                            onChange={(e) => {
                                              const newFields = [...(settings.welcome.embedFields || [])];
                                              newFields[idx].inline = e.target.checked;
                                              handleInputChange('welcome.embedFields', newFields);
                                            }}
                                          />
                                          Inline
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newFields = settings.welcome.embedFields.filter((_, i) => i !== idx);
                                            handleInputChange('welcome.embedFields', newFields);
                                          }}
                                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                      <textarea
                                        value={field.value || ''}
                                        onChange={(e) => {
                                          const newFields = [...(settings.welcome.embedFields || [])];
                                          newFields[idx].value = e.target.value;
                                          handleInputChange('welcome.embedFields', newFields);
                                        }}
                                        className="glass-input"
                                        rows="2"
                                        placeholder="Field Value"
                                        style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Image Section (Main Banner Image) */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Image
                              </label>
                              <div style={{
                                position: 'relative',
                                width: '100%',
                                minHeight: '90px',
                                borderRadius: '8px',
                                backgroundColor: '#111216',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '10px',
                                overflow: 'hidden'
                              }}>
                                {settings.welcome.embedImage ? (
                                  <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
                                    <img src={resolveUploadUrl(settings.welcome.embedImage)} alt="Embed Main Image" style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                                    <button
                                      type="button"
                                      onClick={() => handleInputChange('welcome.embedImage', '')}
                                      style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(0,0,0,0.85)',
                                        color: '#ffffff',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Remove Main Image"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                                    <ImageIcon size={28} style={{ color: 'var(--text-muted)' }} />
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                      <label className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                        Upload Image
                                        <input
                                          type="file"
                                          accept="image/*"
                                          style={{ display: 'none' }}
                                          onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                              const res = await api.uploadBackground(guildId, file).catch(() => null);
                                              if (res && res.url) handleInputChange('welcome.embedImage', res.url);
                                            }
                                            e.target.value = null;
                                          }}
                                        />
                                      </label>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or paste URL below</span>
                                    </div>
                                    <input
                                      type="text"
                                      value={settings.welcome.embedImage || ''}
                                      onChange={(e) => handleInputChange('welcome.embedImage', e.target.value)}
                                      className="glass-input"
                                      placeholder="https://example.com/banner.png"
                                      style={{ width: '280px', fontSize: '0.8rem', textAlign: 'center' }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Footer Section */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Footer
                              </label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <label className="btn-secondary" style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '38px', borderRadius: '6px' }} title="Upload Footer Icon">
                                  <ImageIcon size={16} />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        const res = await api.uploadBackground(guildId, file).catch(() => null);
                                        if (res && res.url) handleInputChange('welcome.embedFooterIcon', res.url);
                                      }
                                      e.target.value = null;
                                    }}
                                  />
                                </label>

                                <input
                                  type="text"
                                  value={settings.welcome.embedFooterText || ''}
                                  onChange={(e) => handleInputChange('welcome.embedFooterText', e.target.value)}
                                  className="glass-input"
                                  placeholder="@everyone Welcome to my Server"
                                  style={{ flex: 1 }}
                                />

                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                                  <input
                                    type="checkbox"
                                    checked={settings.welcome.embedTimestamp !== false}
                                    onChange={(e) => handleInputChange('welcome.embedTimestamp', e.target.checked)}
                                  />
                                  • Add timestamp
                                </label>
                              </div>
                              {settings.welcome.embedFooterIcon && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                  Footer Icon URL: {settings.welcome.embedFooterIcon}
                                </span>
                              )}
                            </div>

                          </div>

                          {/* Control Customizers and Live Preview Grid */}
                          <div className="welcome-preview-grid">

                            {/* Element Sliders */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>Welcome Card Elements Sizing</h4>
                                <button
                                  type="button"
                                  onClick={handleResetLayout}
                                  className="btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  Reset Layout
                                </button>
                              </div>

                              {/* Add/Remove Action Buttons */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '4px 0 12px 0', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                                <div style={{ width: '100%', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Toggle Card Elements:</div>

                                {/* Profile Toggle Button */}
                                {settings.welcome.avatarEnabled !== false ? (
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange('welcome.avatarEnabled', false)}
                                    className="btn-danger"
                                    style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                  >
                                    <Trash2 size={12} /> Remove Profile
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange('welcome.avatarEnabled', true)}
                                    className="btn-primary"
                                    style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                  >
                                    <Plus size={12} /> Add Profile
                                  </button>
                                )}

                                {/* Title Toggle Button */}
                                {settings.welcome.titleEnabled !== false ? (
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange('welcome.titleEnabled', false)}
                                    className="btn-danger"
                                    style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                  >
                                    <Trash2 size={12} /> Remove Title
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange('welcome.titleEnabled', true)}
                                    className="btn-primary"
                                    style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                  >
                                    <Plus size={12} /> Add Title
                                  </button>
                                )}

                                {/* Username Toggle Button */}
                                {settings.welcome.usernameEnabled !== false ? (
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange('welcome.usernameEnabled', false)}
                                    className="btn-danger"
                                    style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                  >
                                    <Trash2 size={12} /> Remove Username
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange('welcome.usernameEnabled', true)}
                                    className="btn-primary"
                                    style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                  >
                                    <Plus size={12} /> Add Username
                                  </button>
                                )}

                                {/* Subtext Toggle Button */}
                                {settings.welcome.subtextEnabled !== false ? (
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange('welcome.subtextEnabled', false)}
                                    className="btn-danger"
                                    style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                  >
                                    <Trash2 size={12} /> Remove Subtext
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange('welcome.subtextEnabled', true)}
                                    className="btn-primary"
                                    style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', height: '28px', border: 'none' }}
                                  >
                                    <Plus size={12} /> Add Subtext
                                  </button>
                                )}
                              </div>

                              {/* Profile Picture Control Group */}
                              <div style={{
                                padding: '12px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                marginBottom: '4px'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Profile Picture (Pfp)</span>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={settings.welcome.avatarEnabled !== false}
                                      onChange={() => handleInputChange('welcome.avatarEnabled', !(settings.welcome.avatarEnabled !== false))}
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>

                                {settings.welcome.avatarEnabled !== false ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                    {/* Avatar Size */}
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <span>Pfp Size</span>
                                        <span>{settings.welcome.avatarSize || 140}px</span>
                                      </div>
                                      <input
                                        type="range" min="50" max="250" step="5"
                                        value={settings.welcome.avatarSize || 140}
                                        onChange={(e) => handleInputChange('welcome.avatarSize', parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                      />
                                    </div>

                                    {/* Avatar Rotation */}
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <span>Pfp Rotation</span>
                                        <span>{settings.welcome.avatarRotation || 0}°</span>
                                      </div>
                                      <input
                                        type="range" min="0" max="360" step="5"
                                        value={settings.welcome.avatarRotation || 0}
                                        onChange={(e) => handleInputChange('welcome.avatarRotation', parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                      />
                                    </div>

                                    {/* Border Size & Color */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px' }}>
                                      <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                          <span>Border Thickness</span>
                                          <span>{settings.welcome.avatarBorderThickness !== undefined ? settings.welcome.avatarBorderThickness : 6}px</span>
                                        </div>
                                        <input
                                          type="range" min="0" max="20" step="1"
                                          value={settings.welcome.avatarBorderThickness !== undefined ? settings.welcome.avatarBorderThickness : 6}
                                          onChange={(e) => handleInputChange('welcome.avatarBorderThickness', parseInt(e.target.value))}
                                          style={{ width: '100%', accentColor: 'var(--primary)' }}
                                        />
                                      </div>
                                      <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2px' }}>Border Color</label>
                                        <input
                                          type="color"
                                          value={settings.welcome.avatarBorderColor || '#ffffff'}
                                          onChange={(e) => handleInputChange('welcome.avatarBorderColor', e.target.value)}
                                          style={{ width: '100%', height: '24px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                    Profile Picture is disabled and hidden from the welcome card.
                                  </div>
                                )}
                              </div>

                              {/* Title Text Control Group */}
                              <div style={{
                                padding: '12px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                marginBottom: '4px'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Title Text ("WELCOME")</span>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={settings.welcome.titleEnabled !== false}
                                      onChange={() => handleInputChange('welcome.titleEnabled', !(settings.welcome.titleEnabled !== false))}
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>

                                {settings.welcome.titleEnabled !== false ? (
                                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <span>Title Text Size</span>
                                        <span>{settings.welcome.titleSize || 54}px</span>
                                      </div>
                                      <input
                                        type="range" min="12" max="100" step="1"
                                        value={settings.welcome.titleSize || 54}
                                        onChange={(e) => handleInputChange('welcome.titleSize', parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                      />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
                                      <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Font Family</label>
                                        <select
                                          value={settings.welcome.titleFontFamily || ''}
                                          onChange={(e) => handleInputChange('welcome.titleFontFamily', e.target.value)}
                                          className="glass-input"
                                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                        >
                                          <option value="">Use Global Font</option>
                                          <option value="Sans">Sans-Serif (Default)</option>
                                          <option value="Poppins">Poppins</option>
                                          <option value="Montserrat">Montserrat</option>
                                          <option value="Bebas Neue">Bebas Neue</option>
                                          <option value="Orbitron">Orbitron</option>
                                          <option value="Oswald">Oswald</option>
                                          <option value="Inter">Inter</option>
                                          <option value="Roboto">Roboto</option>
                                          <option value="Ethnocentric">Ethnocentric (Futuristic)</option>
                                          <option value="Oxanium">Oxanium (Cyberpunk)</option>
                                          <option value="Permanent Marker">Permanent Marker (Brush)</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textAlign: 'center' }}>Italic</label>
                                        <label className="switch" style={{ scale: '0.85' }}>
                                          <input
                                            type="checkbox"
                                            checked={settings.welcome.titleFontStyle === 'italic'}
                                            onChange={(e) => handleInputChange('welcome.titleFontStyle', e.target.checked ? 'italic' : 'normal')}
                                          />
                                          <span className="slider"></span>
                                        </label>
                                      </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '4px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Neon Glow Effect</span>
                                        <label className="switch" style={{ scale: '0.8' }}>
                                          <input
                                            type="checkbox"
                                            checked={settings.welcome.titleGlowEnabled || false}
                                            onChange={(e) => handleInputChange('welcome.titleGlowEnabled', e.target.checked)}
                                          />
                                          <span className="slider"></span>
                                        </label>
                                      </div>
                                      {settings.welcome.titleGlowEnabled && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                                          <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                              <span>Glow Radius</span>
                                              <span>{settings.welcome.titleGlowBlur || 10}px</span>
                                            </div>
                                            <input
                                              type="range" min="1" max="40" step="1"
                                              value={settings.welcome.titleGlowBlur || 10}
                                              onChange={(e) => handleInputChange('welcome.titleGlowBlur', parseInt(e.target.value))}
                                              style={{ width: '100%', accentColor: 'var(--primary)' }}
                                            />
                                          </div>
                                          <div>
                                            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2px' }}>Color</label>
                                            <input
                                              type="color"
                                              value={settings.welcome.titleGlowColor || '#00ff66'}
                                              onChange={(e) => handleInputChange('welcome.titleGlowColor', e.target.value)}
                                              style={{ width: '100%', height: '20px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                    Title Text is disabled and hidden from the welcome card.
                                  </div>
                                )}
                              </div>

                              {/* Username Text Control Group */}
                              <div style={{
                                padding: '12px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                marginBottom: '4px'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Username Text</span>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={settings.welcome.usernameEnabled !== false}
                                      onChange={() => handleInputChange('welcome.usernameEnabled', !(settings.welcome.usernameEnabled !== false))}
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>

                                {settings.welcome.usernameEnabled !== false ? (
                                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <span>Username Text Size</span>
                                        <span>{settings.welcome.usernameSize || 38}px</span>
                                      </div>
                                      <input
                                        type="range" min="12" max="100" step="1"
                                        value={settings.welcome.usernameSize || 38}
                                        onChange={(e) => handleInputChange('welcome.usernameSize', parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                      />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
                                      <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Font Family</label>
                                        <select
                                          value={settings.welcome.usernameFontFamily || ''}
                                          onChange={(e) => handleInputChange('welcome.usernameFontFamily', e.target.value)}
                                          className="glass-input"
                                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                        >
                                          <option value="">Use Global Font</option>
                                          <option value="Sans">Sans-Serif (Default)</option>
                                          <option value="Poppins">Poppins</option>
                                          <option value="Montserrat">Montserrat</option>
                                          <option value="Bebas Neue">Bebas Neue</option>
                                          <option value="Orbitron">Orbitron</option>
                                          <option value="Oswald">Oswald</option>
                                          <option value="Inter">Inter</option>
                                          <option value="Roboto">Roboto</option>
                                          <option value="Ethnocentric">Ethnocentric (Futuristic)</option>
                                          <option value="Oxanium">Oxanium (Cyberpunk)</option>
                                          <option value="Permanent Marker">Permanent Marker (Brush)</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textAlign: 'center' }}>Italic</label>
                                        <label className="switch" style={{ scale: '0.85' }}>
                                          <input
                                            type="checkbox"
                                            checked={settings.welcome.usernameFontStyle === 'italic'}
                                            onChange={(e) => handleInputChange('welcome.usernameFontStyle', e.target.checked ? 'italic' : 'normal')}
                                          />
                                          <span className="slider"></span>
                                        </label>
                                      </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '4px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Neon Glow Effect</span>
                                        <label className="switch" style={{ scale: '0.8' }}>
                                          <input
                                            type="checkbox"
                                            checked={settings.welcome.usernameGlowEnabled || false}
                                            onChange={(e) => handleInputChange('welcome.usernameGlowEnabled', e.target.checked)}
                                          />
                                          <span className="slider"></span>
                                        </label>
                                      </div>
                                      {settings.welcome.usernameGlowEnabled && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                                          <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                              <span>Glow Radius</span>
                                              <span>{settings.welcome.usernameGlowBlur || 10}px</span>
                                            </div>
                                            <input
                                              type="range" min="1" max="40" step="1"
                                              value={settings.welcome.usernameGlowBlur || 10}
                                              onChange={(e) => handleInputChange('welcome.usernameGlowBlur', parseInt(e.target.value))}
                                              style={{ width: '100%', accentColor: 'var(--primary)' }}
                                            />
                                          </div>
                                          <div>
                                            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2px' }}>Color</label>
                                            <input
                                              type="color"
                                              value={settings.welcome.usernameGlowColor || '#2563eb'}
                                              onChange={(e) => handleInputChange('welcome.usernameGlowColor', e.target.value)}
                                              style={{ width: '100%', height: '20px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                    Username Text is disabled and hidden from the welcome card.
                                  </div>
                                )}
                              </div>

                              {/* Subtext Text Control Group */}
                              <div style={{
                                padding: '12px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                marginBottom: '4px'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Subtext Text</span>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={settings.welcome.subtextEnabled !== false}
                                      onChange={() => handleInputChange('welcome.subtextEnabled', !(settings.welcome.subtextEnabled !== false))}
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>

                                {settings.welcome.subtextEnabled !== false ? (
                                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <span>Subtext Text Size</span>
                                        <span>{settings.welcome.subtextSize || 22}px</span>
                                      </div>
                                      <input
                                        type="range" min="10" max="60" step="1"
                                        value={settings.welcome.subtextSize || 22}
                                        onChange={(e) => handleInputChange('welcome.subtextSize', parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                      />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
                                      <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Font Family</label>
                                        <select
                                          value={settings.welcome.subtextFontFamily || ''}
                                          onChange={(e) => handleInputChange('welcome.subtextFontFamily', e.target.value)}
                                          className="glass-input"
                                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                        >
                                          <option value="">Use Global Font</option>
                                          <option value="Sans">Sans-Serif (Default)</option>
                                          <option value="Poppins">Poppins</option>
                                          <option value="Montserrat">Montserrat</option>
                                          <option value="Bebas Neue">Bebas Neue</option>
                                          <option value="Orbitron">Orbitron</option>
                                          <option value="Oswald">Oswald</option>
                                          <option value="Inter">Inter</option>
                                          <option value="Roboto">Roboto</option>
                                          <option value="Ethnocentric">Ethnocentric (Futuristic)</option>
                                          <option value="Oxanium">Oxanium (Cyberpunk)</option>
                                          <option value="Permanent Marker">Permanent Marker (Brush)</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textAlign: 'center' }}>Italic</label>
                                        <label className="switch" style={{ scale: '0.85' }}>
                                          <input
                                            type="checkbox"
                                            checked={settings.welcome.subtextFontStyle === 'italic'}
                                            onChange={(e) => handleInputChange('welcome.subtextFontStyle', e.target.checked ? 'italic' : 'normal')}
                                          />
                                          <span className="slider"></span>
                                        </label>
                                      </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '4px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Neon Glow Effect</span>
                                        <label className="switch" style={{ scale: '0.8' }}>
                                          <input
                                            type="checkbox"
                                            checked={settings.welcome.subtextGlowEnabled || false}
                                            onChange={(e) => handleInputChange('welcome.subtextGlowEnabled', e.target.checked)}
                                          />
                                          <span className="slider"></span>
                                        </label>
                                      </div>
                                      {settings.welcome.subtextGlowEnabled && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                                          <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                              <span>Glow Radius</span>
                                              <span>{settings.welcome.subtextGlowBlur || 10}px</span>
                                            </div>
                                            <input
                                              type="range" min="1" max="40" step="1"
                                              value={settings.welcome.subtextGlowBlur || 10}
                                              onChange={(e) => handleInputChange('welcome.subtextGlowBlur', parseInt(e.target.value))}
                                              style={{ width: '100%', accentColor: 'var(--primary)' }}
                                            />
                                          </div>
                                          <div>
                                            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2px' }}>Color</label>
                                            <input
                                              type="color"
                                              value={settings.welcome.subtextGlowColor || '#00ff66'}
                                              onChange={(e) => handleInputChange('welcome.subtextGlowColor', e.target.value)}
                                              style={{ width: '100%', height: '20px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                    Subtext Text is disabled and hidden from the welcome card.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Column 2: Advanced Visual Styles */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', height: '28px', display: 'flex', alignItems: 'center' }}>Advanced Visual Styles</h4>

                              {/* 1. Background Overlay Tint */}
                              <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px', marginTop: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Dark Background Overlay</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round((settings.welcome.overlayOpacity !== undefined ? settings.welcome.overlayOpacity : 0.3) * 100)}% Opacity</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'center' }}>
                                  <input
                                    type="range" min="0" max="1" step="0.05"
                                    value={settings.welcome.overlayOpacity !== undefined ? settings.welcome.overlayOpacity : 0.3}
                                    onChange={(e) => handleInputChange('welcome.overlayOpacity', parseFloat(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                                  />
                                  <input
                                    type="color"
                                    value={settings.welcome.overlayColor || '#000000'}
                                    onChange={(e) => handleInputChange('welcome.overlayColor', e.target.value)}
                                    style={{ width: '100%', height: '24px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                  />
                                </div>
                              </div>

                              {/* 2. Text Shadow Effect */}
                              <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block' }}>Text Shadow Glow</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Adds readable shadow behind card texts</span>
                                  </div>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={settings.welcome.textShadowEnabled || false}
                                      onChange={() => handleToggle('welcome.textShadowEnabled')}
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>
                                {settings.welcome.textShadowEnabled && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        <span>Blur Radius</span>
                                        <span>{settings.welcome.textShadowBlur || 5}px</span>
                                      </div>
                                      <input
                                        type="range" min="1" max="20" step="1"
                                        value={settings.welcome.textShadowBlur || 5}
                                        onChange={(e) => handleInputChange('welcome.textShadowBlur', parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2px' }}>Color</label>
                                      <input
                                        type="color"
                                        value={settings.welcome.textShadowColor || '#000000'}
                                        onChange={(e) => handleInputChange('welcome.textShadowColor', e.target.value)}
                                        style={{ width: '100%', height: '24px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* 3. Avatar Shadow Glow */}
                              <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block' }}>Profile Picture Glow</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Neon glow around avatar circle</span>
                                  </div>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={settings.welcome.avatarShadowEnabled || false}
                                      onChange={() => handleToggle('welcome.avatarShadowEnabled')}
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>
                                {settings.welcome.avatarShadowEnabled && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        <span>Glow Radius</span>
                                        <span>{settings.welcome.avatarShadowBlur || 15}px</span>
                                      </div>
                                      <input
                                        type="range" min="1" max="40" step="1"
                                        value={settings.welcome.avatarShadowBlur || 15}
                                        onChange={(e) => handleInputChange('welcome.avatarShadowBlur', parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2px' }}>Color</label>
                                      <input
                                        type="color"
                                        value={settings.welcome.avatarShadowColor || '#2563eb'}
                                        onChange={(e) => handleInputChange('welcome.avatarShadowColor', e.target.value)}
                                        style={{ width: '100%', height: '24px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* 4. Card Outer Border Frame */}
                              <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block' }}>Outer Card Frame</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Draws frame border around canvas</span>
                                  </div>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={settings.welcome.cardBorderEnabled || false}
                                      onChange={() => handleToggle('welcome.cardBorderEnabled')}
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>
                                {settings.welcome.cardBorderEnabled && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        <span>Frame Thickness</span>
                                        <span>{settings.welcome.cardBorderThickness || 8}px</span>
                                      </div>
                                      <input
                                        type="range" min="1" max="25" step="1"
                                        value={settings.welcome.cardBorderThickness || 8}
                                        onChange={(e) => handleInputChange('welcome.cardBorderThickness', parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2px' }}>Color</label>
                                      <input
                                        type="color"
                                        value={settings.welcome.cardBorderColor || '#2563eb'}
                                        onChange={(e) => handleInputChange('welcome.cardBorderColor', e.target.value)}
                                        style={{ width: '100%', height: '24px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>
                          {/* End of welcome-settings-column */}
                        </div>

                        {/* Right Column: Sticky Discord Preview */}
                        <div className="welcome-preview-column">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>
                            <Eye size={14} />
                            Interactive Discord Chat Preview (Drag elements to position)
                          </span>

                          <div className="discord-chat-container">
                            <div className="discord-chat-header">
                              <span className="discord-channel-hash">#</span>
                              <span className="discord-channel-name">
                                {channels.find(c => c.id === settings.welcome.channelId)?.name || 'welcome'}
                              </span>
                              <div className="discord-channel-divider"></div>
                              <span className="discord-channel-description">Greeting channel preview</span>
                            </div>

                            <div className="discord-chat-messages">
                              <div className="discord-message">
                                <img
                                  src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                  alt="bot avatar"
                                  className="discord-author-avatar"
                                />
                                <div className="discord-message-content">
                                  <div className="discord-author-header">
                                    <span className="discord-author-name">SMOOTH MODE</span>
                                    <span className="discord-bot-tag">BOT</span>
                                    <span className="discord-message-timestamp">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>

                                  {/* Conditionally render preview content based on selected layoutType */}
                                  {(settings.welcome.layoutType === 'text-only' || !settings.welcome.layoutType) && (
                                    <>
                                      <div className="discord-message-text">
                                        {formatWelcomeText(settings.welcome.message)}
                                      </div>
                                      {renderRedirectButton()}
                                      <div className="discord-info-banner">
                                        <Info size={16} style={{ flexShrink: 0 }} />
                                        <span>
                                          <strong>Text Message Only</strong> layout is selected. The Canvas Card image is disabled. Select <strong>Classic Card</strong> or <strong>Embed with Card</strong> to design and position your canvas elements.
                                        </span>
                                      </div>
                                    </>
                                  )}

                                  {/* Render rich embed for embed-only and embed-card */}
                                  {(settings.welcome.layoutType === 'embed-only' || settings.welcome.layoutType === 'embed-card') && (() => {
                                    let previewThumbUrl = null;
                                    const thumbSetting = settings.welcome.embedThumbnail;
                                    if (thumbSetting === '{server_icon}') {
                                      previewThumbUrl = guildIcon || 'https://cdn.discordapp.com/embed/avatars/0.png';
                                    } else if (thumbSetting === 'none') {
                                      previewThumbUrl = null;
                                    } else if (thumbSetting && thumbSetting !== '{user_avatar}') {
                                      previewThumbUrl = resolveUploadUrl(thumbSetting);
                                    } else {
                                      previewThumbUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';
                                    }

                                    const authorIconUrl = settings.welcome.embedAuthorIcon ? resolveUploadUrl(settings.welcome.embedAuthorIcon) : null;
                                    const footerIconUrl = settings.welcome.embedFooterIcon ? resolveUploadUrl(settings.welcome.embedFooterIcon) : null;
                                    const mainImageUrl = settings.welcome.embedImage ? resolveUploadUrl(settings.welcome.embedImage) : null;

                                    return (
                                      <>
                                        <div className="discord-message-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '4px' }}>
                                          Mentions <span style={{ backgroundColor: 'rgba(88, 101, 242, 0.3)', color: '#c9cdfb', padding: '0 4px', borderRadius: '3px' }}>@{user?.username || 'Member'}</span>
                                        </div>

                                        <div className="discord-embed" style={{ borderLeftColor: settings.welcome.embedColor || settings.welcome.textColor || '#2563eb', padding: '12px 16px', borderRadius: '4px', backgroundColor: '#2b2d31' }}>
                                          
                                          {/* Author Section */}
                                          {settings.welcome.embedAuthorName && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                              {authorIconUrl && (
                                                <img src={authorIconUrl} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                                              )}
                                              {settings.welcome.embedAuthorUrl ? (
                                                <a href={settings.welcome.embedAuthorUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff', textDecoration: 'none' }} onClick={e => e.preventDefault()}>
                                                  {formatWelcomeText(settings.welcome.embedAuthorName)} ⮩
                                                </a>
                                              ) : (
                                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff' }}>
                                                  {formatWelcomeText(settings.welcome.embedAuthorName)}
                                                </span>
                                              )}
                                            </div>
                                          )}

                                          {/* Title & Thumbnail Row */}
                                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                              <div style={{ fontWeight: '700', color: '#38bdf8', fontSize: '1rem', marginBottom: '6px' }}>
                                                {settings.welcome.embedTitleUrl ? (
                                                  <a href={settings.welcome.embedTitleUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }} onClick={e => e.preventDefault()}>
                                                    {formatWelcomeText(settings.welcome.embedTitle || `Welcome to ${guildName || 'Server'}!`)}
                                                  </a>
                                                ) : (
                                                  formatWelcomeText(settings.welcome.embedTitle || `Welcome to ${guildName || 'Server'}!`)
                                                )}
                                              </div>

                                              {/* Description */}
                                              {settings.welcome.message && (
                                                <div style={{ fontSize: '0.875rem', color: '#dbdee1', whiteSpace: 'pre-wrap', marginBottom: '8px', wordBreak: 'break-word' }}>
                                                  {formatWelcomeText(settings.welcome.message)}
                                                </div>
                                              )}
                                            </div>

                                            {/* Thumbnail */}
                                            {previewThumbUrl && (
                                              <img
                                                src={previewThumbUrl}
                                                alt="embed thumbnail"
                                                style={{ width: '70px', height: '70px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                                              />
                                            )}
                                          </div>

                                          {/* Fields */}
                                          {Array.isArray(settings.welcome.embedFields) && settings.welcome.embedFields.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: '8px', marginBottom: '8px' }}>
                                              {settings.welcome.embedFields.map((f, idx) => (
                                                <div key={idx} style={{ flex: f.inline ? '1 0 120px' : '100%', maxWidth: f.inline ? 'calc(33.3% - 11px)' : '100%' }}>
                                                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff' }}>{formatWelcomeText(f.name)}</div>
                                                  <div style={{ fontSize: '0.825rem', color: '#dbdee1' }}>{formatWelcomeText(f.value)}</div>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {/* Main Image Banner */}
                                          {settings.welcome.layoutType === 'embed-card' ? (
                                            <div style={{ marginTop: '10px', borderRadius: '4px', overflow: 'hidden' }}>
                                              {renderCanvasCard()}
                                            </div>
                                          ) : (
                                            (mainImageUrl || (settings.welcome.gifSupport && settings.welcome.background)) && (
                                              <div style={{ marginTop: '10px', borderRadius: '4px', overflow: 'hidden' }}>
                                                <img src={mainImageUrl || resolveUploadUrl(settings.welcome.background)} alt="embed main banner" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '4px', objectFit: 'cover' }} />
                                              </div>
                                            )
                                          )}

                                          {/* Footer & Timestamp */}
                                          {(settings.welcome.embedFooterText || footerIconUrl || settings.welcome.embedTimestamp !== false) && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#949ba4', fontSize: '0.75rem' }}>
                                              {footerIconUrl && (
                                                <img src={footerIconUrl} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                                              )}
                                              {settings.welcome.embedFooterText && (
                                                <span>{formatWelcomeText(settings.welcome.embedFooterText)}</span>
                                              )}
                                              {settings.welcome.embedTimestamp !== false && (
                                                <>
                                                  {settings.welcome.embedFooterText && <span>•</span>}
                                                  <span>Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </>
                                              )}
                                            </div>
                                          )}

                                        </div>
                                        {renderRedirectButton()}
                                      </>
                                    );
                                  })()}

                                </div>
                              </div>
                            </div>
                          </div>

                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', display: 'block', marginTop: '12px' }}>
                            💡 Reposition elements inside the banner by clicking and dragging them directly in the preview!
                          </span>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: VERIFICATION */}
              {activeTab === 'verification' && (
                <div>

                  <div className="preview-layout-container">
                    {/* Left Column: Form Controls */}
                    <div className="glass-panel" style={{
                      flex: '1 1 500px',
                      padding: '24px',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Role Assignment Verification</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Users must verify themselves to receive a member role.</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.verification.enabled}
                            onChange={() => handleToggle('verification.enabled')}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>

                      {settings.verification.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>

                          {/* Verification Method Selection */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>Verification Method</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                              {[
                                { id: 'button', title: 'Discord Button', desc: 'Click an interactive button to verify' },
                                { id: 'reaction', title: 'Emoji Reaction', desc: 'React with an emoji to verify (Reaction Role)' }
                              ].map(methodOption => (
                                <div
                                  key={methodOption.id}
                                  onClick={() => handleInputChange('verification.type', methodOption.id)}
                                  style={{
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    border: `2px solid ${settings.verification.type === methodOption.id || (!settings.verification.type && methodOption.id === 'button') ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`,
                                    backgroundColor: settings.verification.type === methodOption.id || (!settings.verification.type && methodOption.id === 'button') ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                  }}
                                >
                                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: settings.verification.type === methodOption.id || (!settings.verification.type && methodOption.id === 'button') ? '#ffffff' : 'var(--text-secondary)' }}>
                                    {methodOption.title}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1rem' }}>
                                    {methodOption.desc}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Channel and Role selection */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Verification Channel</label>
                              <select
                                value={settings.verification.channelId}
                                onChange={(e) => handleInputChange('verification.channelId', e.target.value)}
                                className="glass-input"
                              >
                                <option value="">-- Select Channel --</option>
                                {channels.map(ch => (
                                  <option key={ch.id} value={ch.id}>#{ch.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Role to Grant upon Verification</label>
                              <select
                                value={settings.verification.roleId}
                                onChange={(e) => handleInputChange('verification.roleId', e.target.value)}
                                className="glass-input"
                              >
                                <option value="">-- Select Role --</option>
                                {roles.map(role => (
                                  <option key={role.id} value={role.id} style={{ color: role.color }}>{role.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Conditional Text Fields based on type */}
                          {settings.verification.type === 'reaction' ? (
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Reaction Emoji</label>
                              <input
                                type="text"
                                value={settings.verification.reactionEmoji || '✅'}
                                onChange={(e) => handleInputChange('verification.reactionEmoji', e.target.value)}
                                className="glass-input"
                                style={{ maxWidth: '200px' }}
                                placeholder="e.g. ✅ or custom emoji"
                              />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                Use a standard emoji (like ✅, ⭐, 👍) or a custom server emoji.
                              </span>
                            </div>
                          ) : (
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Verify Button Label</label>
                              <input
                                type="text"
                                value={settings.verification.buttonText || 'Verify'}
                                onChange={(e) => handleInputChange('verification.buttonText', e.target.value)}
                                className="glass-input"
                                placeholder="Verify"
                              />
                            </div>
                          )}

                          {/* Embed Description */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Verification Embed Description</label>
                            <textarea
                              rows="3"
                              value={settings.verification.welcomeMessage || ''}
                              onChange={(e) => handleInputChange('verification.welcomeMessage', e.target.value)}
                              className="glass-input"
                              placeholder={
                                settings.verification.type === 'reaction'
                                  ? 'React to this message with the emoji below to verify and gain access to the server.'
                                  : 'Click the button below to verify your account and gain access to the server.'
                              }
                            />
                          </div>

                          {/* Publish Panel card */}
                          <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(37, 99, 235, 0.05)', borderColor: 'var(--primary-glow)' }}>
                            <div>
                              <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px' }}>Publish Panel to Discord</h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Send the verification box with the interactive button/reaction directly to the selected channel.</p>
                            </div>
                            <button
                              type="button"
                              onClick={handlePublishVerification}
                              disabled={saving || !settings.verification.channelId || !settings.verification.roleId}
                              className="btn-success"
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Publish Embed
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Live Discord Preview */}
                    <div style={{
                      flex: '1 0 350px',
                      maxWidth: '520px',
                      position: 'sticky',
                      top: '24px',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <Eye size={14} />
                        Live Discord Preview
                      </span>
                      {settings.verification.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <DiscordMessagePreview
                            botUser={{ username: user?.username }}
                            guildName={guildName}
                            guildIcon={guildIcon}
                            message=""
                            buttonEnabled={settings.verification.type !== 'reaction'}
                            buttonLabel={settings.verification.buttonText || 'Verify'}
                            buttonUrl=""
                            embedEnabled={true}
                            embedTitle="Verification Required"
                            embedDesc={settings.verification.welcomeMessage || (
                              settings.verification.type === 'reaction'
                                ? 'React to this message with the emoji below to verify and gain access to the server.'
                                : 'Click the button below to verify your account and gain access to the server.'
                            )}
                            embedColor="#2563eb"
                            embedThumb=""
                            embedImage=""
                            isDM={false}
                          />
                          {/* Reaction Emoji rendering beneath the preview if reaction type */}
                          {settings.verification.type === 'reaction' && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: '#2b2d31',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              width: 'fit-content',
                              marginLeft: '56px',
                              gap: '6px',
                              border: '1px solid rgba(255,255,255,0.05)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                              userSelect: 'none'
                            }}>
                              <span style={{ fontSize: '1.15rem' }}>{settings.verification.reactionEmoji || '✅'}</span>
                              <span style={{ fontSize: '0.8rem', color: '#949ba4', fontWeight: 'bold' }}>1</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: TICKET SYSTEM */}
              {/* TAB 8: SUPPORT TICKETS */}
              {activeTab === 'tickets' && settings && (() => {
                const currentOptions = (Array.isArray(settings.tickets?.options) && settings.tickets.options.length > 0)
                  ? settings.tickets.options
                  : [{
                      label: settings.tickets?.buttonText || 'Create Ticket',
                      emoji: '🎫',
                      style: 'primary',
                      categoryId: settings.tickets?.categoryId || '',
                      supportRoleId: settings.tickets?.supportRoleId || '',
                      title: settings.tickets?.title || 'Support Ticket',
                      ticketMessage: settings.tickets?.ticketMessage || 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.'
                    }];

                const updateTicketOptions = (newOptions) => {
                  const updatedTickets = {
                    ...(settings.tickets || {}),
                    options: newOptions,
                    buttonText: newOptions[0]?.label || 'Create Ticket',
                    categoryId: newOptions[0]?.categoryId || '',
                    supportRoleId: newOptions[0]?.supportRoleId || '',
                    title: newOptions[0]?.title || 'Support Ticket',
                    ticketMessage: newOptions[0]?.ticketMessage || 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.'
                  };
                  handleInputChange('tickets', updatedTickets);
                };

                const handleOptionChange = (index, field, value) => {
                  const next = currentOptions.map((item, idx) => {
                    if (idx === index) {
                      return { ...item, [field]: value };
                    }
                    return item;
                  });
                  updateTicketOptions(next);
                };

                const handleAddOption = () => {
                  if (currentOptions.length >= 6) return;
                  const next = [
                    ...currentOptions,
                    {
                      label: `Option #${currentOptions.length + 1}`,
                      emoji: '🎫',
                      style: 'primary',
                      categoryId: settings.tickets?.categoryId || '',
                      supportRoleId: settings.tickets?.supportRoleId || '',
                      title: 'Support Ticket',
                      ticketMessage: 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.'
                    }
                  ];
                  updateTicketOptions(next);
                };

                const handleRemoveOption = (index) => {
                  if (currentOptions.length <= 1) {
                    const next = [{
                      label: 'Create Ticket',
                      emoji: '🎫',
                      style: 'primary',
                      categoryId: '',
                      supportRoleId: '',
                      title: 'Support Ticket',
                      ticketMessage: 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.'
                    }];
                    updateTicketOptions(next);
                  } else {
                    const next = currentOptions.filter((_, idx) => idx !== index);
                    updateTicketOptions(next);
                  }
                };

                const previewButtons = currentOptions.map(opt => ({
                  label: (opt.emoji ? `${opt.emoji} ` : '') + (opt.label || 'Ticket')
                }));

                return (
                  <div>
                    <div className="preview-layout-container">
                      {/* Left Column: Form Controls */}
                      <div className="glass-panel" style={{
                        flex: '1 1 500px',
                        padding: '24px',
                        backgroundColor: 'rgba(255,255,255,0.01)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                      }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Support Ticket System</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                              Activate support tickets and configure up to 6 custom ticket options for your members.
                            </p>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={settings.tickets?.enabled || false}
                              onChange={() => handleToggle('tickets.enabled')}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        {settings.tickets?.enabled && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>

                            {/* Panel Channel & Panel Embed Settings */}
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                                PANEL EMBED SETTINGS
                              </span>

                              <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                  Ticket Panel Channel <span style={{ color: 'var(--danger)' }}>*</span>
                                </label>
                                <select
                                  value={settings.tickets.channelId || ''}
                                  onChange={(e) => handleInputChange('tickets.channelId', e.target.value)}
                                  className="glass-input"
                                >
                                  <option value="">-- Select Channel --</option>
                                  {channels.map(ch => (
                                    <option key={ch.id} value={ch.id}>#{ch.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Panel Embed Title</label>
                                  <input
                                    type="text"
                                    value={settings.tickets.title || ''}
                                    onChange={(e) => handleInputChange('tickets.title', e.target.value)}
                                    className="glass-input"
                                    placeholder="Support Ticket System"
                                  />
                                </div>

                                <div>
                                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Panel Embed Description</label>
                                  <textarea
                                    rows="2"
                                    value={settings.tickets.welcomeMessage || ''}
                                    onChange={(e) => handleInputChange('tickets.welcomeMessage', e.target.value)}
                                    className="glass-input"
                                    placeholder="Click a button below to open a ticket. Our support team will help you shortly."
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Ticket Options Section */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                Ticket Options ({currentOptions.length} / 6)
                              </span>
                              <button
                                type="button"
                                onClick={handleAddOption}
                                disabled={currentOptions.length >= 6}
                                className="btn-primary"
                                style={{
                                  padding: '6px 14px',
                                  fontSize: '0.825rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  opacity: currentOptions.length >= 6 ? 0.5 : 1,
                                  cursor: currentOptions.length >= 6 ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <span>+ Add Ticket Option</span>
                              </button>
                            </div>

                            {/* Option List Cards */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              {currentOptions.map((opt, index) => (
                                <div
                                  key={index}
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '10px',
                                    padding: '18px',
                                    position: 'relative'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                                      OPTION #{index + 1}
                                    </span>
                                    {currentOptions.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(index)}
                                        style={{
                                          background: 'rgba(239, 68, 68, 0.15)',
                                          color: '#ef4444',
                                          border: '1px solid rgba(239, 68, 68, 0.3)',
                                          borderRadius: '6px',
                                          padding: '4px 10px',
                                          fontSize: '0.75rem',
                                          fontWeight: '600',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s'
                                        }}
                                      >
                                        Remove Option
                                      </button>
                                    )}
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                                    {/* Button Label */}
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                        Button Label <span style={{ color: 'var(--danger)' }}>*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={opt.label || ''}
                                        onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                                        className="glass-input"
                                        placeholder="e.g. General Support"
                                      />
                                    </div>

                                    {/* Emoji */}
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                        Button Emoji
                                      </label>
                                      <input
                                        type="text"
                                        value={opt.emoji || ''}
                                        onChange={(e) => handleOptionChange(index, 'emoji', e.target.value)}
                                        className="glass-input"
                                        placeholder="e.g. 🎫"
                                      />
                                    </div>

                                    {/* Button Style */}
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                        Button Style
                                      </label>
                                      <select
                                        value={opt.style || 'primary'}
                                        onChange={(e) => handleOptionChange(index, 'style', e.target.value)}
                                        className="glass-input"
                                      >
                                        <option value="primary">Primary (Blue)</option>
                                        <option value="secondary">Secondary (Grey)</option>
                                        <option value="success">Success (Green)</option>
                                        <option value="danger">Danger (Red)</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                                    {/* Target Category */}
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                        Ticket Parent Category
                                      </label>
                                      <select
                                        value={opt.categoryId || ''}
                                        onChange={(e) => handleOptionChange(index, 'categoryId', e.target.value)}
                                        className="glass-input"
                                      >
                                        <option value="">-- Select Category --</option>
                                        {categories.map(cat => (
                                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Support Team Role */}
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                        Support Team Role
                                      </label>
                                      <select
                                        value={opt.supportRoleId || ''}
                                        onChange={(e) => handleOptionChange(index, 'supportRoleId', e.target.value)}
                                        className="glass-input"
                                      >
                                        <option value="">-- Select Role --</option>
                                        {roles.map(role => (
                                          <option key={role.id} value={role.id} style={{ color: role.color }}>{role.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Ticket Channel Title */}
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                        Ticket Channel Title
                                      </label>
                                      <input
                                        type="text"
                                        value={opt.title || ''}
                                        onChange={(e) => handleOptionChange(index, 'title', e.target.value)}
                                        className="glass-input"
                                        placeholder="Support Ticket"
                                      />
                                    </div>

                                    {/* Ticket Channel Welcome Message */}
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                        Ticket Channel Welcome Message (Supports {`{user}`}, {`{server}`})
                                      </label>
                                      <textarea
                                        rows="2"
                                        value={opt.ticketMessage || ''}
                                        onChange={(e) => handleOptionChange(index, 'ticketMessage', e.target.value)}
                                        className="glass-input"
                                        placeholder="Welcome {user}! Please describe your issue. Support staff will assist you shortly."
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Publish Panel Component */}
                            <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                              <div>
                                <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px' }}>Publish Panel to Discord</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  Send the support ticket panel embed with all {currentOptions.length} interactive buttons directly to the selected channel.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handlePublishTickets}
                                disabled={saving || !settings.tickets.channelId}
                                className="btn-success"
                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                              >
                                Publish Embed
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Live Discord Preview */}
                      <div style={{
                        flex: '1 0 350px',
                        maxWidth: '520px',
                        position: 'sticky',
                        top: '24px',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                          <Eye size={14} />
                          Live Discord Preview
                        </span>
                        {settings.tickets?.enabled && (
                          <DiscordMessagePreview
                            botUser={{ username: user?.username }}
                            guildName={guildName}
                            guildIcon={guildIcon}
                            message=""
                            buttonEnabled={false}
                            buttons={previewButtons}
                            embedEnabled={true}
                            embedTitle={settings.tickets.title || 'Support Ticket System'}
                            embedDesc={settings.tickets.welcomeMessage || 'Click a button below to open a ticket. Our support team will help you shortly.'}
                            embedColor="#2563eb"
                            embedThumb=""
                            embedImage=""
                            isDM={false}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 5: ROLES & NICKNAMES */}
              {activeTab === 'roles' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Roles & Nicknames</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Automatically assign roles and structure nickname formatting when members join your server.</p>

                  {/* Auto Role Card */}
                  <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Auto Role on Join</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Automatically assigns a specific role as soon as a user joins the server.</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.autoRole.enabled}
                          onChange={() => handleToggle('autoRole.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.autoRole.enabled && (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Role to Auto-Assign</label>
                        <select
                          value={settings.autoRole.roleId}
                          onChange={(e) => handleInputChange('autoRole.roleId', e.target.value)}
                          className="glass-input"
                          style={{ maxWidth: '300px' }}
                        >
                          <option value="">-- Select Role --</option>
                          {roles.map(role => (
                            <option key={role.id} value={role.id} style={{ color: role.color }}>{role.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Auto Nickname Card */}
                  <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Auto Nickname Formatter</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Automatically renames new users matching your server nickname format guidelines.</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.autoNickname.enabled}
                          onChange={() => handleToggle('autoNickname.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.autoNickname.enabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>Nickname Template</label>
                          <input
                            type="text"
                            value={settings.autoNickname.template !== undefined ? settings.autoNickname.template : (settings.autoNickname.format || '{DISPLAY_NAME}')}
                            onChange={(e) => {
                              handleInputChange('autoNickname.template', e.target.value);
                              handleInputChange('autoNickname.format', e.target.value); // Sync to format for backward compatibility
                            }}
                            className="glass-input"
                            style={{ maxWidth: '400px' }}
                            placeholder="{DISPLAY_NAME}"
                          />
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Use <code>{`{USERNAME}`}</code> or <code>{`{DISPLAY_NAME}`}</code> as placeholders. They will be replaced with each user's chosen source name.
                          </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '600px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>Source Name</label>
                            <select
                              value={settings.autoNickname.sourceName || 'displayName'}
                              onChange={(e) => handleInputChange('autoNickname.sourceName', e.target.value)}
                              className="glass-input"
                              style={{ width: '100%', cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: '#ffffff' }}
                            >
                              <option value="displayName">Display Name (Nickname)</option>
                              <option value="username">Username</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>Capitalization Options</label>
                            <select
                              value={settings.autoNickname.casing || 'original'}
                              onChange={(e) => handleInputChange('autoNickname.casing', e.target.value)}
                              className="glass-input"
                              style={{ width: '100%', cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: '#ffffff' }}
                            >
                              <option value="original">Keep Original (e.g. Smooth)</option>
                              <option value="upper">UPPERCASE (e.g. SMOOTH)</option>
                              <option value="lower">lowercase (e.g. smooth)</option>
                            </select>
                          </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '12px 16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', maxWidth: '600px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>Live Preview</span>
                          <span style={{ fontSize: '0.9rem', color: '#ffffff', fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                            {(() => {
                              const t = settings.autoNickname.template !== undefined ? settings.autoNickname.template : (settings.autoNickname.format || '{DISPLAY_NAME}');
                              const s = settings.autoNickname.sourceName || 'displayName';
                              const c = settings.autoNickname.casing || 'original';
                              const nameSample = 'Smooth';
                              let formatted = nameSample;
                              if (c === 'upper') formatted = nameSample.toUpperCase();
                              if (c === 'lower') formatted = nameSample.toLowerCase();
                              return t.replace(/\{username\}/gi, formatted).replace(/\{display_name\}/gi, formatted);
                            })()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SERVER AUDIT LOGS */}
              {activeTab === 'logs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Header & Controls Bar */}
                  <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                          🛡️ Sidcord Audit Logs
                        </h2>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          color: '#22c55e',
                          border: '1px solid rgba(34, 197, 94, 0.2)'
                        }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></span>
                          Live WebSocket Feed Active
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Real-time audit log stream for bans, kicks, mutes, voice activity, roles, channels, and member actions.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setShowLogSettingsPanel(!showLogSettingsPanel)}
                        className="btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          backgroundColor: showLogSettingsPanel ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                          color: '#fff',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer'
                        }}
                      >
                        <Settings size={15} />
                        {showLogSettingsPanel ? 'Close Config' : 'Log Channel Config'}
                      </button>

                      <button
                        type="button"
                        onClick={handleExportLogs}
                        disabled={!logs || logs.length === 0}
                        className="btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          cursor: logs && logs.length > 0 ? 'pointer' : 'not-allowed',
                          opacity: logs && logs.length > 0 ? 1 : 0.5
                        }}
                      >
                        <FileText size={15} />
                        Export JSON
                      </button>

                      <button
                        type="button"
                        onClick={handleClearLogs}
                        disabled={clearingLogs || !logs || logs.length === 0}
                        className="btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(244, 63, 94, 0.1)',
                          color: '#f43f5e',
                          border: '1px solid rgba(244, 63, 94, 0.2)',
                          cursor: logs && logs.length > 0 ? 'pointer' : 'not-allowed',
                          opacity: logs && logs.length > 0 ? 1 : 0.5
                        }}
                      >
                        <Trash2 size={15} />
                        {clearingLogs ? 'Clearing...' : 'Clear Logs'}
                      </button>
                    </div>
                  </div>

                  {/* Log Channel & Logging Toggle Configuration Panel */}
                  {showLogSettingsPanel && (
                    <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'rgba(37, 99, 235, 0.03)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>
                            📢 Discord Server Audit Log Channel Settings
                          </h3>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Select the Discord text channel in your server where audit log embeds will be automatically posted.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                        {/* Target Channel Selector */}
                        <div>
                          <label className="form-label" style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Hash size={16} /> Audit Log Text Channel
                          </label>
                          <select
                            className="form-control"
                            value={settings?.logging?.logChannelId || ''}
                            onChange={(e) => handleInputChange('logging.logChannelId', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '11px 14px',
                              borderRadius: '8px',
                              backgroundColor: '#0f172a',
                              color: '#ffffff',
                              border: '1px solid rgba(59, 130, 246, 0.4)',
                              outline: 'none',
                              fontWeight: '600',
                              fontSize: '0.9rem'
                            }}
                          >
                            <option value="" style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}>-- Disabled (No Channel Selected) --</option>
                            {channels.map(ch => (
                              <option key={ch.id} value={ch.id} style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>#{ch.name}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleApplyChannelToAllLogs(settings?.logging?.logChannelId)}
                            disabled={!settings?.logging?.logChannelId}
                            style={{
                              marginTop: '8px',
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              color: '#3b82f6',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              cursor: settings?.logging?.logChannelId ? 'pointer' : 'not-allowed',
                              width: '100%'
                            }}
                          >
                            ⚡ Send ALL Server Logs to This Text Channel
                          </button>
                        </div>

                        {/* Master Enable Switch */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Enable Audit Logger</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Global toggle for bot audit events</div>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={settings?.logging?.enabled !== false}
                              onChange={() => handleToggle('logging.enabled')}
                            />
                            <span className="slider round"></span>
                          </label>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>
                        Filter Which Events Are Logged:
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        {[
                          { key: 'logBans', label: '🔨 Member Bans & Unbans' },
                          { key: 'logKicks', label: '👢 Member Kicks' },
                          { key: 'logMutes', label: '🔇 Mutes / Timeouts' },
                          { key: 'logVoice', label: '🎤 Voice VC Activity' },
                          { key: 'logRoles', label: '🏷️ Member Role Changes' },
                          { key: 'logChannels', label: '📁 Channel Edits' },
                          { key: 'logMessages', label: '🗑️ Message Deletions' },
                          { key: 'logMembers', label: '📥 Member Joins & Leaves' }
                        ].map(item => (
                          <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{item.label}</span>
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={settings?.logging?.[item.key] !== false}
                                onChange={() => handleToggle(`logging.${item.key}`)}
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={(e) => handleSave(e)}
                          className="btn btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontWeight: '600' }}
                        >
                          <Check size={16} /> Save Audit Log Settings
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Summary Stats Overview */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div className="glass-panel" style={{ padding: '16px 20px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Logs</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>{logs.length}</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '16px 20px', backgroundColor: 'rgba(239, 68, 68, 0.02)', borderLeft: '4px solid #ef4444' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Moderation Actions</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>
                        {logs.filter(l => ['ban', 'unban', 'kick', 'timeout', 'untimeout'].includes((l.actionType || '').toLowerCase())).length}
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '16px 20px', backgroundColor: 'rgba(59, 130, 246, 0.02)', borderLeft: '4px solid #3b82f6' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Voice Activity</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#3b82f6', marginTop: '4px' }}>
                        {logs.filter(l => (l.actionType || '').toLowerCase().startsWith('voice_')).length}
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '16px 20px', backgroundColor: 'rgba(6, 182, 212, 0.02)', borderLeft: '4px solid #06b6d4' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role Changes</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#06b6d4', marginTop: '4px' }}>
                        {logs.filter(l => (l.actionType || '').toLowerCase().startsWith('role_')).length}
                      </div>
                    </div>
                  </div>

                  {/* Filter Tabs & Search Bar */}
                  <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    {/* Category Filter Pills */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'ALL', label: 'All Logs' },
                        { id: 'MODERATION', label: '🔨 Moderation' },
                        { id: 'VOICE', label: '🎤 Voice VC' },
                        { id: 'ROLES', label: '🏷️ Roles' },
                        { id: 'CHANNELS', label: '📁 Channels' },
                        { id: 'MESSAGES', label: '💬 Messages & Members' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setLogFilterCategory(tab.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            border: '1px solid',
                            borderColor: logFilterCategory === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            backgroundColor: logFilterCategory === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                            color: logFilterCategory === tab.id ? '#fff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div style={{ position: 'relative', width: '260px' }}>
                      <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search logs by user or reason..."
                        value={logSearchQuery}
                        onChange={(e) => setLogSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 12px 7px 34px',
                          borderRadius: '20px',
                          fontSize: '0.82rem',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Logs Feed List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto', paddingRight: '6px' }}>
                    {(() => {
                      const filteredLogs = logs.filter(log => {
                        const action = (log.actionType || '').toLowerCase();
                        if (logFilterCategory === 'MODERATION') {
                          if (!['ban', 'unban', 'kick', 'timeout', 'untimeout', 'warn'].includes(action)) return false;
                        } else if (logFilterCategory === 'VOICE') {
                          if (!action.startsWith('voice_')) return false;
                        } else if (logFilterCategory === 'ROLES') {
                          if (!action.startsWith('role_')) return false;
                        } else if (logFilterCategory === 'CHANNELS') {
                          if (!action.startsWith('channel_')) return false;
                        } else if (logFilterCategory === 'MESSAGES') {
                          if (!['message_delete', 'member_join', 'member_leave'].includes(action)) return false;
                        }

                        if (logSearchQuery.trim()) {
                          const q = logSearchQuery.toLowerCase();
                          const modName = log.moderator?.username?.toLowerCase() || '';
                          const targetName = log.target?.username?.toLowerCase() || '';
                          const details = (log.details || '').toLowerCase();
                          return modName.includes(q) || targetName.includes(q) || details.includes(q) || action.includes(q);
                        }
                        return true;
                      });

                      if (filteredLogs.length === 0) {
                        return (
                          <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                            <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: '500' }}>
                              {logs.length === 0 ? 'No audit logs recorded yet. Live monitoring is active.' : 'No audit logs found matching your filters.'}
                            </p>
                          </div>
                        );
                      }

                      return filteredLogs.map((log, idx) => {
                        const info = getLogActionInfo(log.actionType);
                        const modAvatar = (log.moderator && log.moderator.avatar && log.moderator.id)
                          ? `https://cdn.discordapp.com/avatars/${log.moderator.id}/${log.moderator.avatar}.png`
                          : 'https://cdn.discordapp.com/embed/avatars/0.png';

                        const targetAvatar = (log.target && log.target.avatar && log.target.id)
                          ? `https://cdn.discordapp.com/avatars/${log.target.id}/${log.target.avatar}.png`
                          : 'https://cdn.discordapp.com/embed/avatars/0.png';

                        return (
                          <div
                            key={log._id || idx}
                            className="glass-panel"
                            onClick={() => setSelectedLogDetail(log)}
                            style={{
                              padding: '14px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '16px',
                              backgroundColor: 'rgba(255,255,255,0.01)',
                              borderLeft: `4px solid ${info.color}`,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                              {/* Avatar stack */}
                              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '54px', height: '32px', flexShrink: 0 }}>
                                <img
                                  src={modAvatar}
                                  alt="Mod"
                                  title={`Executor / Mod: ${log.moderator?.username || 'Unknown Moderator'}`}
                                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--border-color)', position: 'absolute', left: 0, zIndex: 2 }}
                                />
                                <img
                                  src={targetAvatar}
                                  alt="Target"
                                  title={`Target: ${log.target?.username || 'Unknown Target'}`}
                                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${info.color}`, position: 'absolute', left: '18px', zIndex: 1 }}
                                />
                              </div>

                              <div style={{ flexGrow: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ color: 'var(--text-primary)' }}>{log.moderator?.username || 'Unknown Moderator'}</span>
                                  <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>→</span>
                                  <span style={{ color: info.color, fontWeight: '700' }}>{log.target?.username || 'Target User'}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                                  {log.details}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: '800',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                color: info.color,
                                backgroundColor: info.bg,
                                border: `1px solid ${info.color}33`,
                                letterSpacing: '0.5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span>{info.icon}</span>
                                <span>{info.label}</span>
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Unknown Time'}
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Log Detail Modal */}
                  {selectedLogDetail && (
                    <div className="modal-backdrop" onClick={() => setSelectedLogDetail(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="glass-panel" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px', padding: '24px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                            🛡️ Audit Log Entry Details
                          </h3>
                          <button type="button" onClick={() => setSelectedLogDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Action Type: </span>
                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{selectedLogDetail.actionType}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Moderator: </span>
                            <span style={{ fontWeight: '600' }}>{selectedLogDetail.moderator?.username}</span> (ID: {selectedLogDetail.moderator?.id})
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Target: </span>
                            <span style={{ fontWeight: '600' }}>{selectedLogDetail.target?.username}</span> (ID: {selectedLogDetail.target?.id})
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Details: </span>
                            <div>{selectedLogDetail.details}</div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Timestamp: </span>
                            <div>{selectedLogDetail.timestamp ? new Date(selectedLogDetail.timestamp).toLocaleString() : 'N/A'}</div>
                          </div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button type="button" className="btn btn-secondary" onClick={() => setSelectedLogDetail(null)}>Close</button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
              {/* TAB 7: BROADCAST DMS */}
              {activeTab === 'broadcast' && (
                <div>

                  <div className="preview-layout-container">
                    {/* Left Column: Form Controls */}
                    <div className="glass-panel" style={{
                      flex: '1 1 500px',
                      padding: '24px',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px'
                    }}>



                      {/* Message Textarea */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Message Content</label>
                          <button
                            type="button"
                            onClick={() => openEmojiPickerFor(broadcastMessageRef, broadcastMessage, setBroadcastMessage)}
                            className="btn-secondary"
                            style={{
                              padding: '3px 9px',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa',
                              cursor: 'pointer'
                            }}
                          >
                            <Smile size={14} />
                            Add Emoji
                          </button>
                        </div>

                        {/* Quick Emoji Bar */}
                        <QuickEmojiBar
                          onSelectEmoji={(emoji) => insertEmojiAtCursor(broadcastMessageRef, broadcastMessage, emoji, setBroadcastMessage)}
                          onOpenPicker={() => openEmojiPickerFor(broadcastMessageRef, broadcastMessage, setBroadcastMessage)}
                        />

                        <textarea
                          ref={broadcastMessageRef}
                          rows="4"
                          value={broadcastMessage}
                          onChange={(e) => setBroadcastMessage(e.target.value)}
                          maxLength={2000}
                          className="glass-input"
                          placeholder="Hello {username}! Check out our new bot features..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Placeholders: Use <code>{`{username}`}</code> to name/mention the member, and <code>{`{server}`}</code> to insert the server name.
                          </span>
                          <span style={{ fontSize: '0.75rem', color: broadcastMessage.length >= 1900 ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {broadcastMessage.length} / 2000
                          </span>
                        </div>
                      </div>

                      {/* Multiple Link Buttons Settings panel */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: broadcastButtons.length > 0 ? '16px' : '0' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Attach Link Buttons (Up to 3)</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Adds clickable link buttons at the bottom of the message.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (broadcastButtons.length < 3) {
                                setBroadcastButtons([...broadcastButtons, { label: '', url: '' }]);
                              }
                            }}
                            disabled={broadcastButtons.length >= 3}
                            className="btn-success"
                            style={{ padding: '4px 10px', fontSize: '0.8rem', opacity: broadcastButtons.length >= 3 ? 0.5 : 1, cursor: broadcastButtons.length >= 3 ? 'not-allowed' : 'pointer' }}
                          >
                            + Add Button
                          </button>
                        </div>

                        {broadcastButtons.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {broadcastButtons.map((btn, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button {idx + 1} Label</label>
                                  <input
                                    type="text"
                                    value={btn.label}
                                    onChange={(e) => {
                                      const updated = [...broadcastButtons];
                                      updated[idx].label = e.target.value;
                                      setBroadcastButtons(updated);
                                    }}
                                    className="glass-input"
                                    placeholder="e.g. Website"
                                  />
                                </div>
                                <div style={{ flex: 2 }}>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button {idx + 1} URL</label>
                                  <input
                                    type="text"
                                    value={btn.url}
                                    onChange={(e) => {
                                      const updated = [...broadcastButtons];
                                      updated[idx].url = e.target.value;
                                      setBroadcastButtons(updated);
                                    }}
                                    className="glass-input"
                                    placeholder="e.g. https://website.com"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBroadcastButtons(broadcastButtons.filter((_, i) => i !== idx));
                                  }}
                                  className="btn-danger"
                                  style={{ padding: '8px 12px', fontSize: '0.85rem', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Legacy fallback toggle to show one single button if none are explicitly in the array */
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quick Button Toggle</span>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={broadcastButtonEnabled}
                                  onChange={(e) => setBroadcastButtonEnabled(e.target.checked)}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            {broadcastButtonEnabled && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button Label</label>
                                  <input
                                    type="text"
                                    value={broadcastButtonLabel}
                                    onChange={(e) => setBroadcastButtonLabel(e.target.value)}
                                    className="glass-input"
                                    placeholder="e.g. Visit Website"
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button URL</label>
                                  <input
                                    type="text"
                                    value={broadcastButtonUrl}
                                    onChange={(e) => setBroadcastButtonUrl(e.target.value)}
                                    className="glass-input"
                                    placeholder="e.g. https://website.com"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Embed Builder sub-panel */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: broadcastEmbedEnabled ? '16px' : '0' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Attach Rich Embed</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Creates a beautifully styled embed card with custom color, title, and media links.</p>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={broadcastEmbedEnabled}
                              onChange={(e) => setBroadcastEmbedEnabled(e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        {broadcastEmbedEnabled && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Author Customization */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Customize Embed Author</span>
                                <label className="switch" style={{ width: '40px', height: '20px' }}>
                                  <input
                                    type="checkbox"
                                    checked={broadcastEmbedAuthorEnabled}
                                    onChange={(e) => setBroadcastEmbedAuthorEnabled(e.target.checked)}
                                  />
                                  <span className="slider" style={{ borderRadius: '20px' }}></span>
                                </label>
                              </div>
                              {broadcastEmbedAuthorEnabled && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Author Name</label>
                                      <input
                                        type="text"
                                        value={broadcastEmbedAuthorName}
                                        onChange={(e) => setBroadcastEmbedAuthorName(e.target.value)}
                                        className="glass-input"
                                        placeholder="e.g. Server Owner"
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Author Icon URL</label>
                                      <input
                                        type="text"
                                        value={broadcastEmbedAuthorIcon}
                                        onChange={(e) => setBroadcastEmbedAuthorIcon(e.target.value)}
                                        className="glass-input"
                                        placeholder="https://example.com/icon.png"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Author Click URL</label>
                                    <input
                                      type="text"
                                      value={broadcastEmbedAuthorUrl}
                                      onChange={(e) => setBroadcastEmbedAuthorUrl(e.target.value)}
                                      className="glass-input"
                                      placeholder="https://example.com"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Embed Title & Sidebar Color */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Embed Title</label>
                                <input
                                  type="text"
                                  value={broadcastEmbedTitle}
                                  onChange={(e) => setBroadcastEmbedTitle(e.target.value)}
                                  className="glass-input"
                                  placeholder="Embed Title"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sidebar Color</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input
                                    type="color"
                                    value={broadcastEmbedColor}
                                    onChange={(e) => setBroadcastEmbedColor(e.target.value)}
                                    style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                                  />
                                  <input
                                    type="text"
                                    value={broadcastEmbedColor}
                                    onChange={(e) => setBroadcastEmbedColor(e.target.value)}
                                    className="glass-input"
                                    placeholder="#2563eb"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Embed Description */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Embed Description</label>
                              <textarea
                                rows="3"
                                value={broadcastEmbedDesc}
                                onChange={(e) => setBroadcastEmbedDesc(e.target.value)}
                                maxLength={4000}
                                className="glass-input"
                                placeholder="Rich description..."
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.7rem', color: broadcastEmbedDesc.length >= 3800 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                  {broadcastEmbedDesc.length} / 4000
                                </span>
                              </div>
                            </div>

                            {/* Embed Fields Section */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Embed Fields (Up to 5)</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (broadcastEmbedFields.length < 5) {
                                      setBroadcastEmbedFields([...broadcastEmbedFields, { name: '', value: '', inline: true }]);
                                    }
                                  }}
                                  disabled={broadcastEmbedFields.length >= 5}
                                  className="btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.8rem', opacity: broadcastEmbedFields.length >= 5 ? 0.5 : 1, cursor: broadcastEmbedFields.length >= 5 ? 'not-allowed' : 'pointer' }}
                                >
                                  + Add Field
                                </button>
                              </div>

                              {broadcastEmbedFields.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                                  {broadcastEmbedFields.map((fld, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Field #{idx + 1}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                            <input
                                              type="checkbox"
                                              checked={fld.inline}
                                              onChange={(e) => {
                                                const updated = [...broadcastEmbedFields];
                                                updated[idx].inline = e.target.checked;
                                                setBroadcastEmbedFields(updated);
                                              }}
                                              style={{ cursor: 'pointer' }}
                                            />
                                            Inline Grid Layout
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setBroadcastEmbedFields(broadcastEmbedFields.filter((_, i) => i !== idx));
                                            }}
                                            className="btn-danger"
                                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                                        <div>
                                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Field Name</label>
                                          <input
                                            type="text"
                                            value={fld.name}
                                            onChange={(e) => {
                                              const updated = [...broadcastEmbedFields];
                                              updated[idx].name = e.target.value;
                                              setBroadcastEmbedFields(updated);
                                            }}
                                            className="glass-input"
                                            placeholder="Field Title"
                                          />
                                        </div>
                                        <div>
                                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Field Value</label>
                                          <textarea
                                            rows="1"
                                            value={fld.value}
                                            onChange={(e) => {
                                              const updated = [...broadcastEmbedFields];
                                              updated[idx].value = e.target.value;
                                              setBroadcastEmbedFields(updated);
                                            }}
                                            className="glass-input"
                                            placeholder="Field Content"
                                            style={{ minHeight: '38px', resize: 'vertical' }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Embed Thumbnail & Image */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Thumbnail URL</label>
                                <input
                                  type="text"
                                  value={broadcastEmbedThumb}
                                  onChange={(e) => setBroadcastEmbedThumb(e.target.value)}
                                  className="glass-input"
                                  placeholder="https://example.com/thumbnail.png"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Large Image URL</label>
                                <input
                                  type="text"
                                  value={broadcastEmbedImage}
                                  onChange={(e) => setBroadcastEmbedImage(e.target.value)}
                                  className="glass-input"
                                  placeholder="https://example.com/banner.png"
                                />
                              </div>
                            </div>

                            {/* Footer Customization */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Customize Embed Footer</span>
                                <label className="switch" style={{ width: '40px', height: '20px' }}>
                                  <input
                                    type="checkbox"
                                    checked={broadcastEmbedFooterEnabled}
                                    onChange={(e) => setBroadcastEmbedFooterEnabled(e.target.checked)}
                                  />
                                  <span className="slider" style={{ borderRadius: '20px' }}></span>
                                </label>
                              </div>
                              {broadcastEmbedFooterEnabled && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Footer Text</label>
                                    <input
                                      type="text"
                                      value={broadcastEmbedFooterText}
                                      onChange={(e) => setBroadcastEmbedFooterText(e.target.value)}
                                      className="glass-input"
                                      placeholder="Footer Text"
                                    />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Footer Icon URL</label>
                                    <input
                                      type="text"
                                      value={broadcastEmbedFooterIcon}
                                      onChange={(e) => setBroadcastEmbedFooterIcon(e.target.value)}
                                      className="glass-input"
                                      placeholder="https://example.com/footer-icon.png"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Template Manager Section */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0' }}>Save or Load Templates</h4>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <input
                              type="text"
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                              className="glass-input"
                              placeholder="Template Name (e.g. Promo DM)"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (templateName.trim()) {
                                handleSaveTemplate(templateName, 'dm');
                                setTemplateName('');
                              }
                            }}
                            className="btn-success"
                            style={{ height: '40px', padding: '0 16px', fontSize: '0.85rem' }}
                          >
                            Save Draft
                          </button>
                        </div>

                        {templates.length > 0 && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Saved DM Templates</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {templates.map(tpl => (
                                <div key={tpl._id} className="badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                  <span
                                    onClick={() => handleLoadTemplate(tpl)}
                                    style={{ cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                                  >
                                    {tpl.name}
                                  </span>
                                  <Trash2
                                    size={12}
                                    style={{ color: 'var(--danger)', cursor: 'pointer' }}
                                    onClick={() => handleDeleteTemplate(tpl._id, 'dm')}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delivery & Scheduling Settings */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0', color: '#ffffff' }}>Delivery & Scheduling Settings</h4>

                        {/* Delay Slider */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Stagger Interval Delay: <strong style={{ color: 'var(--primary)' }}>{broadcastDelayInterval} second{broadcastDelayInterval !== 1 ? 's' : ''}</strong>
                            </label>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protects against API rate limits</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={broadcastDelayInterval}
                            onChange={(e) => setBroadcastDelayInterval(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                          />
                        </div>

                        {/* Scheduling Toggle & Input */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: broadcastIsScheduled ? '12px' : '0' }}>
                            <div>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Schedule Broadcast for Later</span>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Queue this broadcast to run at a specific future date and time.</p>
                            </div>
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={broadcastIsScheduled}
                                onChange={(e) => setBroadcastIsScheduled(e.target.checked)}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          {broadcastIsScheduled && (
                            <div style={{ marginTop: '12px' }}>
                              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Release Date & Time</label>
                              <input
                                type="datetime-local"
                                value={broadcastScheduledTime}
                                onChange={(e) => setBroadcastScheduledTime(e.target.value)}
                                className="glass-input"
                                style={{ colorScheme: 'dark' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mass DM Warning Banner */}
                      <div className="glass-panel" style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <h4 style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>⚠️ Mass DM rate limit & safety warning</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                          The bot sends direct messages to members using a **{broadcastDelayInterval}-second interval** to protect your bot from getting flagged as spam. Please be patient while the broadcast runs in the background.
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <button
                          type="button"
                          onClick={handleSendTestDM}
                          disabled={broadcasting}
                          className="btn-secondary"
                          style={{ gap: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '42px', padding: '0 16px', fontSize: '0.85rem' }}
                        >
                          <Eye size={18} />
                          Send Test DM
                        </button>
                        <button
                          type="button"
                          onClick={handleSendBroadcast}
                          disabled={broadcasting}
                          className="btn-primary pulse-glow"
                          style={{ gap: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '42px', padding: '0 20px', fontSize: '0.85rem' }}
                        >
                          <Send size={18} />
                          {broadcasting ? 'Broadcasting DMs...' : (broadcastIsScheduled ? 'Schedule DM Broadcast' : 'Send DMs to Members')}
                        </button>
                      </div>

                      {/* Pending Scheduled DMs List */}
                      {scheduledDMs.length > 0 && (
                        <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.02)', marginTop: '20px' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0', color: '#ffffff' }}>Pending Scheduled DMs ({scheduledDMs.length})</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {scheduledDMs.map(dm => {
                              return (
                                <div key={dm._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                  <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                                      {dm.message || (dm.embed && dm.embed.title) || 'Embed Only DM'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Publishing at {new Date(dm.publishAt).toLocaleString()}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Delay: {dm.delayInterval}s | Roles: Filter: {roles.find(r => r.id === dm.filterRole)?.name || 'None'} / Exclude: {roles.find(r => r.id === dm.excludeRole)?.name || 'None'}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteScheduledDM(dm._id)}
                                    className="btn-danger"
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}



                    </div>

                    {/* Right Column: Live Discord Preview */}
                    <div style={{
                      flex: '1 0 350px',
                      maxWidth: '520px',
                      position: 'sticky',
                      top: '24px',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <Eye size={14} />
                        Live Discord Preview
                      </span>
                      <DiscordMessagePreview
                        botUser={{ username: user?.username }}
                        guildName={guildName}
                        guildIcon={guildIcon}
                        message={broadcastMessage}
                        buttonEnabled={broadcastButtonEnabled}
                        buttonLabel={broadcastButtonLabel}
                        buttonUrl={broadcastButtonUrl}
                        embedEnabled={broadcastEmbedEnabled}
                        embedTitle={broadcastEmbedTitle}
                        embedDesc={broadcastEmbedDesc}
                        embedColor={broadcastEmbedColor}
                        embedThumb={broadcastEmbedThumb}
                        embedImage={broadcastEmbedImage}
                        isDM={true}
                        embedAuthorEnabled={broadcastEmbedAuthorEnabled}
                        embedAuthorName={broadcastEmbedAuthorName}
                        embedAuthorIcon={broadcastEmbedAuthorIcon}
                        embedAuthorUrl={broadcastEmbedAuthorUrl}
                        embedFooterEnabled={broadcastEmbedFooterEnabled}
                        embedFooterText={broadcastEmbedFooterText}
                        embedFooterIcon={broadcastEmbedFooterIcon}
                        embedFields={broadcastEmbedFields}
                        buttons={broadcastButtons.length > 0 ? broadcastButtons : (broadcastButtonEnabled && broadcastButtonLabel && broadcastButtonUrl ? [{ label: broadcastButtonLabel, url: broadcastButtonUrl }] : [])}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: PUBLISH ANNOUNCEMENT */}
              {activeTab === 'publish' && (
                <div>

                  <div className="preview-layout-container">
                    {/* Left Column: Form Controls */}
                    <div className="glass-panel" style={{
                      flex: '1 1 500px',
                      padding: '24px',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px'
                    }}>

                      {/* Target Channel & Ping Target Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        {/* Target Channel Dropdown */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Select Target Channel</label>
                          <select
                            value={pubChannelId}
                            onChange={(e) => setPubChannelId(e.target.value)}
                            className="glass-input"
                          >
                            <option value="">-- Select text channel --</option>
                            {channels.map(ch => (
                              <option key={ch.id} value={ch.id}>#{ch.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Ping Target Select */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Ping Target (Mentions)</label>
                          <select
                            value={pubPingType}
                            onChange={(e) => setPubPingType(e.target.value)}
                            className="glass-input"
                          >
                            <option value="none">No Mention</option>
                            <option value="everyone">@everyone</option>
                            <option value="here">@here</option>
                            <option value="role">Specific Role...</option>
                          </select>
                        </div>
                      </div>

                      {/* Specific Role Dropdown */}
                      {pubPingType === 'role' && (
                        <div style={{ marginTop: '-4px' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Select Role to Ping</label>
                          <select
                            value={pubPingRoleId}
                            onChange={(e) => setPubPingRoleId(e.target.value)}
                            className="glass-input"
                          >
                            <option value="">-- Select server role --</option>
                            {roles.map(r => (
                              <option key={r.id} value={r.id} style={{ color: r.color }}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Message Textarea */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Message Content</label>
                          <button
                            type="button"
                            onClick={() => openEmojiPickerFor(pubMessageRef, pubMessage, setPubMessage)}
                            className="btn-secondary"
                            style={{
                              padding: '3px 9px',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa',
                              cursor: 'pointer'
                            }}
                          >
                            <Smile size={14} />
                            Add Emoji
                          </button>
                        </div>

                        {/* Quick Emoji Bar */}
                        <QuickEmojiBar
                          onSelectEmoji={(emoji) => insertEmojiAtCursor(pubMessageRef, pubMessage, emoji, setPubMessage)}
                          onOpenPicker={() => openEmojiPickerFor(pubMessageRef, pubMessage, setPubMessage)}
                        />

                        <textarea
                          ref={pubMessageRef}
                          rows="4"
                          value={pubMessage}
                          onChange={(e) => setPubMessage(e.target.value)}
                          maxLength={2000}
                          className="glass-input"
                          placeholder="Type your channel message here... (Use quick emojis above or click 'Add Emoji' 🎉)"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Placeholders: Use <code>{`{server}`}</code> to insert the server name.
                          </span>
                          <span style={{ fontSize: '0.75rem', color: pubMessage.length >= 1900 ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {pubMessage.length} / 2000
                          </span>
                        </div>
                      </div>

                      {/* Emoji Picker Popover Modal */}
                      <EmojiPicker
                        isOpen={showEmojiPicker}
                        onClose={() => {
                          setShowEmojiPicker(false);
                          setEmojiTarget(null);
                        }}
                        onSelectEmoji={(emoji) => {
                          if (emojiTarget && emojiTarget.onChange) {
                            const updatedVal = insertEmojiAtCursor(emojiTarget.ref, emojiTarget.value, emoji, emojiTarget.onChange);
                            setEmojiTarget(prev => prev ? { ...prev, value: updatedVal } : null);
                          } else if (emojiTargetField === 'embedTitle') {
                            insertEmojiAtCursor(pubEmbedTitleRef, pubEmbedTitle, emoji, setPubEmbedTitle);
                          } else if (emojiTargetField === 'embedDesc') {
                            insertEmojiAtCursor(pubEmbedDescRef, pubEmbedDesc, emoji, setPubEmbedDesc);
                          } else {
                            insertEmojiAtCursor(pubMessageRef, pubMessage, emoji, setPubMessage);
                          }
                        }}
                      />

                      {/* Multiple Link Buttons Settings panel */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pubButtons.length > 0 ? '16px' : '0' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Attach Link Buttons (Up to 3)</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Adds clickable link buttons at the bottom of the message.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (pubButtons.length < 3) {
                                setPubButtons([...pubButtons, { label: '', url: '' }]);
                              }
                            }}
                            disabled={pubButtons.length >= 3}
                            className="btn-success"
                            style={{ padding: '4px 10px', fontSize: '0.8rem', opacity: pubButtons.length >= 3 ? 0.5 : 1, cursor: pubButtons.length >= 3 ? 'not-allowed' : 'pointer' }}
                          >
                            + Add Button
                          </button>
                        </div>

                        {pubButtons.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pubButtons.map((btn, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button {idx + 1} Label</label>
                                  <input
                                    type="text"
                                    value={btn.label}
                                    onChange={(e) => {
                                      const updated = [...pubButtons];
                                      updated[idx].label = e.target.value;
                                      setPubButtons(updated);
                                    }}
                                    className="glass-input"
                                    placeholder="e.g. Website"
                                  />
                                </div>
                                <div style={{ flex: 2 }}>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button {idx + 1} URL</label>
                                  <input
                                    type="text"
                                    value={btn.url}
                                    onChange={(e) => {
                                      const updated = [...pubButtons];
                                      updated[idx].url = e.target.value;
                                      setPubButtons(updated);
                                    }}
                                    className="glass-input"
                                    placeholder="e.g. https://website.com"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPubButtons(pubButtons.filter((_, i) => i !== idx));
                                  }}
                                  className="btn-danger"
                                  style={{ padding: '8px 12px', fontSize: '0.85rem', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Legacy fallback toggle to show one single button if none are explicitly in the array */
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quick Button Toggle</span>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={pubButtonEnabled}
                                  onChange={(e) => setPubButtonEnabled(e.target.checked)}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            {pubButtonEnabled && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button Label</label>
                                  <input
                                    type="text"
                                    value={pubButtonLabel}
                                    onChange={(e) => setPubButtonLabel(e.target.value)}
                                    className="glass-input"
                                    placeholder="e.g. Visit Website"
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Button URL</label>
                                  <input
                                    type="text"
                                    value={pubButtonUrl}
                                    onChange={(e) => setPubButtonUrl(e.target.value)}
                                    className="glass-input"
                                    placeholder="e.g. https://website.com"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Embed Builder sub-panel */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pubEmbedEnabled ? '16px' : '0' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Attach Rich Embed</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Creates a beautifully styled embed card with custom color, title, and media links.</p>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={pubEmbedEnabled}
                              onChange={(e) => setPubEmbedEnabled(e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        {pubEmbedEnabled && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Author customization */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Customize Embed Author</span>
                                <label className="switch" style={{ width: '40px', height: '20px' }}>
                                  <input
                                    type="checkbox"
                                    checked={pubEmbedAuthorEnabled}
                                    onChange={(e) => setPubEmbedAuthorEnabled(e.target.checked)}
                                  />
                                  <span className="slider" style={{ borderRadius: '20px' }}></span>
                                </label>
                              </div>
                              {pubEmbedAuthorEnabled && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Author Name</label>
                                        <button
                                          type="button"
                                          onClick={() => openEmojiPickerFor(pubEmbedAuthorNameRef, pubEmbedAuthorName, setPubEmbedAuthorName)}
                                          style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                        >
                                          <Smile size={12} /> Emoji
                                        </button>
                                      </div>
                                      <input
                                        ref={pubEmbedAuthorNameRef}
                                        type="text"
                                        value={pubEmbedAuthorName}
                                        onChange={(e) => setPubEmbedAuthorName(e.target.value)}
                                        className="glass-input"
                                        placeholder="e.g. Server Owner"
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Author Icon URL</label>
                                      <input
                                        type="text"
                                        value={pubEmbedAuthorIcon}
                                        onChange={(e) => setPubEmbedAuthorIcon(e.target.value)}
                                        className="glass-input"
                                        placeholder="https://example.com/icon.png"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Author Click URL</label>
                                    <input
                                      type="text"
                                      value={pubEmbedAuthorUrl}
                                      onChange={(e) => setPubEmbedAuthorUrl(e.target.value)}
                                      className="glass-input"
                                      placeholder="https://example.com"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Embed Title & Color */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Embed Title</label>
                                  <button
                                    type="button"
                                    onClick={() => openEmojiPickerFor(pubEmbedTitleRef, pubEmbedTitle, setPubEmbedTitle)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#60a5fa',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    <Smile size={12} /> Emoji
                                  </button>
                                </div>
                                <input
                                  ref={pubEmbedTitleRef}
                                  type="text"
                                  value={pubEmbedTitle}
                                  onChange={(e) => setPubEmbedTitle(e.target.value)}
                                  className="glass-input"
                                  placeholder="Embed Title"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sidebar Color</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input
                                    type="color"
                                    value={pubEmbedColor}
                                    onChange={(e) => setPubEmbedColor(e.target.value)}
                                    style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                                  />
                                  <input
                                    type="text"
                                    value={pubEmbedColor}
                                    onChange={(e) => setPubEmbedColor(e.target.value)}
                                    className="glass-input"
                                    placeholder="#2563eb"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Embed Description */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Embed Description</label>
                                <button
                                  type="button"
                                  onClick={() => openEmojiPickerFor(pubEmbedDescRef, pubEmbedDesc, setPubEmbedDesc)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#60a5fa',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  <Smile size={12} /> Emoji
                                </button>
                              </div>
                              <QuickEmojiBar
                                onSelectEmoji={(emoji) => insertEmojiAtCursor(pubEmbedDescRef, pubEmbedDesc, emoji, setPubEmbedDesc)}
                                onOpenPicker={() => openEmojiPickerFor(pubEmbedDescRef, pubEmbedDesc, setPubEmbedDesc)}
                              />
                              <textarea
                                ref={pubEmbedDescRef}
                                rows="3"
                                value={pubEmbedDesc}
                                onChange={(e) => setPubEmbedDesc(e.target.value)}
                                maxLength={4000}
                                className="glass-input"
                                placeholder="Rich description..."
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.7rem', color: pubEmbedDesc.length >= 3800 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                  {pubEmbedDesc.length} / 4000
                                </span>
                              </div>
                            </div>

                            {/* Embed Fields Section */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Embed Fields (Up to 5)</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (pubEmbedFields.length < 5) {
                                      setPubEmbedFields([...pubEmbedFields, { name: '', value: '', inline: true }]);
                                    }
                                  }}
                                  disabled={pubEmbedFields.length >= 5}
                                  className="btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.8rem', opacity: pubEmbedFields.length >= 5 ? 0.5 : 1, cursor: pubEmbedFields.length >= 5 ? 'not-allowed' : 'pointer' }}
                                >
                                  + Add Field
                                </button>
                              </div>

                              {pubEmbedFields.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                                  {pubEmbedFields.map((fld, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Field #{idx + 1}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                            <input
                                              type="checkbox"
                                              checked={fld.inline}
                                              onChange={(e) => {
                                                const updated = [...pubEmbedFields];
                                                updated[idx].inline = e.target.checked;
                                                setPubEmbedFields(updated);
                                              }}
                                              style={{ cursor: 'pointer' }}
                                            />
                                            Inline Grid Layout
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setPubEmbedFields(pubEmbedFields.filter((_, i) => i !== idx));
                                            }}
                                            className="btn-danger"
                                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                                        <div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Field Name</label>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                const inputElem = e.currentTarget.parentElement.nextElementSibling;
                                                openEmojiPickerFor({ current: inputElem }, fld.name, (val) => {
                                                  const updated = [...pubEmbedFields];
                                                  updated[idx].name = val;
                                                  setPubEmbedFields(updated);
                                                });
                                              }}
                                              style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                            >
                                              <Smile size={12} /> Emoji
                                            </button>
                                          </div>
                                          <input
                                            type="text"
                                            value={fld.name}
                                            onChange={(e) => {
                                              const updated = [...pubEmbedFields];
                                              updated[idx].name = e.target.value;
                                              setPubEmbedFields(updated);
                                            }}
                                            className="glass-input"
                                            placeholder="Field Title (e.g. Server Rules)"
                                          />
                                        </div>
                                        <div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Field Value</label>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                const inputElem = e.currentTarget.parentElement.nextElementSibling;
                                                openEmojiPickerFor({ current: inputElem }, fld.value, (val) => {
                                                  const updated = [...pubEmbedFields];
                                                  updated[idx].value = val;
                                                  setPubEmbedFields(updated);
                                                });
                                              }}
                                              style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                            >
                                              <Smile size={12} /> Emoji
                                            </button>
                                          </div>
                                          <textarea
                                            rows="1"
                                            value={fld.value}
                                            onChange={(e) => {
                                              const updated = [...pubEmbedFields];
                                              updated[idx].value = e.target.value;
                                              setPubEmbedFields(updated);
                                            }}
                                            className="glass-input"
                                            placeholder="Field Content"
                                            style={{ minHeight: '38px', resize: 'vertical' }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Embed Thumbnail & Image */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Thumbnail URL</label>
                                <input
                                  type="text"
                                  value={pubEmbedThumb}
                                  onChange={(e) => setPubEmbedThumb(e.target.value)}
                                  className="glass-input"
                                  placeholder="https://example.com/thumbnail.png"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Large Image / GIF URL</label>
                                <input
                                  type="text"
                                  value={pubEmbedImage}
                                  onChange={(e) => setPubEmbedImage(e.target.value)}
                                  className="glass-input"
                                  placeholder="https://example.com/banner.png or GIF URL"
                                />
                              </div>
                            </div>

                            {/* Footer customization */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Customize Embed Footer</span>
                                <label className="switch" style={{ width: '40px', height: '20px' }}>
                                  <input
                                    type="checkbox"
                                    checked={pubEmbedFooterEnabled}
                                    onChange={(e) => setPubEmbedFooterEnabled(e.target.checked)}
                                  />
                                  <span className="slider" style={{ borderRadius: '20px' }}></span>
                                </label>
                              </div>
                              {pubEmbedFooterEnabled && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '8px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Footer Text</label>
                                      <button
                                        type="button"
                                        onClick={() => openEmojiPickerFor(pubEmbedFooterTextRef, pubEmbedFooterText, setPubEmbedFooterText)}
                                        style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                      >
                                        <Smile size={12} /> Emoji
                                      </button>
                                    </div>
                                    <input
                                      ref={pubEmbedFooterTextRef}
                                      type="text"
                                      value={pubEmbedFooterText}
                                      onChange={(e) => setPubEmbedFooterText(e.target.value)}
                                      className="glass-input"
                                      placeholder="Footer Text"
                                    />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Footer Icon URL</label>
                                    <input
                                      type="text"
                                      value={pubEmbedFooterIcon}
                                      onChange={(e) => setPubEmbedFooterIcon(e.target.value)}
                                      className="glass-input"
                                      placeholder="https://example.com/footer-icon.png"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Template Manager Section */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0' }}>Save or Load Templates</h4>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <input
                              type="text"
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                              className="glass-input"
                              placeholder="Template Name (e.g. Rules Post)"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (templateName.trim()) {
                                handleSaveTemplate(templateName, 'announcement');
                                setTemplateName('');
                              }
                            }}
                            className="btn-success"
                            style={{ height: '40px', padding: '0 16px', fontSize: '0.85rem' }}
                          >
                            Save Draft
                          </button>
                        </div>

                        {templates.length > 0 && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Saved Announcement Templates</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {templates.map(tpl => (
                                <div key={tpl._id} className="badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                  <span
                                    onClick={() => handleLoadTemplate(tpl)}
                                    style={{ cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                                  >
                                    {tpl.name}
                                  </span>
                                  <Trash2
                                    size={12}
                                    style={{ color: 'var(--danger)', cursor: 'pointer' }}
                                    onClick={() => handleDeleteTemplate(tpl._id, 'announcement')}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Scheduled Announcement Options */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isScheduled ? '16px' : '0' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Schedule Publication</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Publish this announcement automatically at a future date & time.</p>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={isScheduled}
                              onChange={(e) => setIsScheduled(e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        {isScheduled && (
                          <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Select Release Date & Time</label>
                            <input
                              type="datetime-local"
                              value={scheduledTime}
                              onChange={(e) => setScheduledTime(e.target.value)}
                              className="glass-input"
                              style={{ width: '100%' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Pending Scheduled Announcements List */}
                      {scheduledAnnouncements.length > 0 && (
                        <div className="glass-panel" style={{ padding: '16px', borderColor: 'var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.02)' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0', color: '#ffffff' }}>Pending Scheduled Announcements ({scheduledAnnouncements.length})</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {scheduledAnnouncements.map(ann => {
                              const targetCh = channels.find(c => c.id === ann.channelId)?.name || 'unknown-channel';
                              return (
                                <div key={ann._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                  <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>#{targetCh}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Publishing at {new Date(ann.publishAt).toLocaleString()}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteScheduledAnnouncement(ann._id)}
                                    className="btn-danger"
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <button
                          type="button"
                          onClick={handleSendChannelMessage}
                          disabled={publishing}
                          className="btn-primary pulse-glow"
                          style={{ gap: '10px' }}
                        >
                          <Send size={18} />
                          {publishing ? (isScheduled ? 'Scheduling...' : 'Publishing...') : (isScheduled ? 'Schedule Announcement' : 'Publish Announcement')}
                        </button>
                      </div>

                    </div>

                    {/* Right Column: Live Discord Preview */}
                    <div style={{
                      flex: '1 0 350px',
                      maxWidth: '520px',
                      position: 'sticky',
                      top: '24px',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <Eye size={14} />
                        Live Discord Preview
                      </span>
                      <DiscordMessagePreview
                        botUser={{ username: user?.username }}
                        guildName={guildName}
                        guildIcon={guildIcon}
                        message={pubMessage}
                        buttonEnabled={pubButtonEnabled}
                        buttonLabel={pubButtonLabel}
                        buttonUrl={pubButtonUrl}
                        embedEnabled={pubEmbedEnabled}
                        embedTitle={pubEmbedTitle}
                        embedDesc={pubEmbedDesc}
                        embedColor={pubEmbedColor}
                        embedThumb={pubEmbedThumb}
                        embedImage={pubEmbedImage}
                        isDM={false}
                        pingType={pubPingType}
                        pingRoleId={pubPingRoleId}
                        roles={roles}
                        embedAuthorEnabled={pubEmbedAuthorEnabled}
                        embedAuthorName={pubEmbedAuthorName}
                        embedAuthorIcon={pubEmbedAuthorIcon}
                        embedAuthorUrl={pubEmbedAuthorUrl}
                        embedFooterEnabled={pubEmbedFooterEnabled}
                        embedFooterText={pubEmbedFooterText}
                        embedFooterIcon={pubEmbedFooterIcon}
                        embedFields={pubEmbedFields}
                        buttons={pubButtons.length > 0 ? pubButtons : (pubButtonEnabled && pubButtonLabel && pubButtonUrl ? [{ label: pubButtonLabel, url: pubButtonUrl }] : [])}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8.5: YOUTUBE ANNOUNCEMENTS */}
              {activeTab === 'youtube' && settings && (
                <div>

                  <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.01)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>YouTube Upload Notifications</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toggle the automated YouTube uploader checker system.</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.youtube?.enabled || false}
                          onChange={() => handleToggle('youtube.enabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {settings.youtube?.enabled && (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Channel URL connection row */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            YouTube Channel URL or Handle <span style={{ color: 'var(--danger)' }}>*</span>
                          </label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                              type="text"
                              value={settings.youtube?.channelUrl || ''}
                              onChange={(e) => handleInputChange('youtube.channelUrl', e.target.value)}
                              className="glass-input"
                              placeholder="e.g. @smooth or https://youtube.com/channel/UC..."
                            />
                            <button
                              type="button"
                              onClick={handleResolveYoutubeChannel}
                              disabled={resolvingChannel || !settings.youtube?.channelUrl}
                              className="btn-primary"
                              style={{ whiteSpace: 'nowrap', minWidth: '130px', justifyContent: 'center' }}
                            >
                              {resolvingChannel ? 'Connecting...' : 'Connect Channel'}
                            </button>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                            Enter your YouTube custom handle (with @) or the full channel URL, then click Connect.
                          </span>
                        </div>

                        {/* Resolved Connection Status Banner */}
                        {settings.youtube?.channelId && (
                          <div className="glass-panel" style={{
                            padding: '12px 16px',
                            backgroundColor: 'rgba(37, 99, 235, 0.05)',
                            borderColor: 'rgba(37, 99, 235, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '10px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                              <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>
                                Connected Channel: <strong style={{ color: 'white' }}>{settings.youtube?.channelName || 'YouTube Channel'}</strong>
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                              ID: {settings.youtube?.channelId}
                            </span>
                          </div>
                        )}

                        {resolveSuccessMsg && (
                          <div style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '500' }}>
                            {resolveSuccessMsg}
                          </div>
                        )}

                        {/* Dropdown Configuration fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

                          {/* Discord Channel Dropdown */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                              Announcement Discord Channel <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <select
                              value={settings.youtube?.targetChannelId || ''}
                              onChange={(e) => handleInputChange('youtube.targetChannelId', e.target.value)}
                              className="glass-input"
                            >
                              <option value="">-- Select Discord Channel --</option>
                              {channels.map(ch => (
                                <option key={ch.id} value={ch.id}>#{ch.name}</option>
                              ))}
                            </select>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              The channel where upload announcements will be published.
                            </span>
                          </div>

                          {/* Ping Mention Role Dropdown */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                              Mention Role (Ping)
                            </label>
                            <select
                              value={settings.youtube?.pingRoleId || ''}
                              onChange={(e) => handleInputChange('youtube.pingRoleId', e.target.value)}
                              className="glass-input"
                            >
                              <option value="">-- None --</option>
                              <option value="everyone">@everyone</option>
                              <option value="here">@here</option>
                              {roles.map(role => (
                                <option key={role.id} value={role.id} style={{ color: role.color }}>@{role.name}</option>
                              ))}
                            </select>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              Optional role to mention/ping when announcing new videos.
                            </span>
                          </div>

                        </div>

                        {/* Announcement Message Template */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Video Upload Message Template
                          </label>
                          <textarea
                            value={settings.youtube?.messageTemplate || ''}
                            onChange={(e) => handleInputChange('youtube.messageTemplate', e.target.value)}
                            className="glass-input"
                            style={{ minHeight: '90px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                            placeholder="{url}"
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                            Available Placeholders: <code>{`{channel}`}</code> (YouTube Channel Name), <code>{`{title}`}</code> (Video Title), <code>{`{url}`}</code> (Video Link).
                          </span>
                        </div>

                        {/* Custom Discord Live Preview */}
                        <div style={{ marginTop: '10px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                            Live Discord Announcement Preview
                          </label>

                          <div style={{
                            backgroundColor: '#313338',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                            color: '#dbdee1',
                            fontSize: '0.9375rem',
                            lineHeight: '1.375rem',
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            width: '100%',
                            maxWidth: '520px'
                          }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              <img
                                src={user?.avatar
                                  ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                                  : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                alt=""
                                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: '600', color: '#f2f3f5', fontSize: '0.95rem' }}>
                                    SMOOTH MODE
                                  </span>
                                  <span style={{
                                    backgroundColor: '#5865F2',
                                    color: '#ffffff',
                                    fontSize: '0.625rem',
                                    fontWeight: '700',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    lineHeight: '0.8rem',
                                    height: '14px',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                  }}>
                                    BOT
                                  </span>
                                  <span style={{ fontSize: '0.72rem', color: '#949ba4' }}>
                                    Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                  {/* Ping preview */}
                                  {settings.youtube?.pingRoleId && settings.youtube?.pingRoleId !== 'none' && (
                                    <span style={{
                                      backgroundColor: 'rgba(88, 101, 242, 0.3)',
                                      color: '#c9cdfb',
                                      padding: '0 4px',
                                      borderRadius: '3px',
                                      fontWeight: '500',
                                      marginRight: '6px',
                                      userSelect: 'none'
                                    }}>
                                      {settings.youtube?.pingRoleId === 'everyone' ? '@everyone' :
                                        settings.youtube?.pingRoleId === 'here' ? '@here' :
                                          `@${roles.find(r => r.id === settings.youtube?.pingRoleId)?.name || 'Role'}`}
                                    </span>
                                  )}

                                  {/* Message template preview resolved */}
                                  {(() => {
                                    let resolved = settings.youtube?.messageTemplate || '{url}';
                                    if (!/{url}/i.test(resolved)) {
                                      resolved = resolved.trim() ? `${resolved.trim()}\n{url}` : '{url}';
                                    }
                                    resolved = resolved
                                      .replace(/{channel}/gi, settings.youtube?.channelName || 'Smooth')
                                      .replace(/{title}/gi, 'My Awesome New Video!')
                                      .replace(/{url}/gi, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

                                    // Parse bold markdown tags **text** into HTML preview
                                    const parts = resolved.split(/(\*\*.*?\*\*)/g);
                                    return parts.map((part, index) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={index} style={{ color: '#ffffff' }}>{part.slice(2, -2)}</strong>;
                                      }
                                      return part;
                                    });
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 9: TEMPORARY VOICE CHANNELS */}
              {activeTab === 'tempvoice' && settings && (() => {
                const currentChannels = (Array.isArray(settings.tempVoice?.channels) && settings.tempVoice.channels.length > 0)
                  ? settings.tempVoice.channels
                  : [{
                      channelId: settings.tempVoice?.channelId || '',
                      categoryId: settings.tempVoice?.categoryId || '',
                      nameTemplate: settings.tempVoice?.nameTemplate || "🔊 {username}'s Room"
                    }];

                const updateTempVoiceChannels = (newChannels) => {
                  const updatedTempVoice = {
                    ...(settings.tempVoice || {}),
                    channels: newChannels,
                    channelId: newChannels[0]?.channelId || '',
                    categoryId: newChannels[0]?.categoryId || '',
                    nameTemplate: newChannels[0]?.nameTemplate || "🔊 {username}'s Room"
                  };
                  handleInputChange('tempVoice', updatedTempVoice);
                };

                const handleChannelChange = (index, field, value) => {
                  const next = currentChannels.map((item, idx) => {
                    if (idx === index) {
                      return { ...item, [field]: value };
                    }
                    return item;
                  });
                  updateTempVoiceChannels(next);
                };

                const handleAddChannel = () => {
                  if (currentChannels.length >= 10) return;
                  const next = [
                    ...currentChannels,
                    { channelId: '', categoryId: '', nameTemplate: "🔊 {username}'s Room" }
                  ];
                  updateTempVoiceChannels(next);
                };

                const handleRemoveChannel = (index) => {
                  if (currentChannels.length <= 1) {
                    const next = [{ channelId: '', categoryId: '', nameTemplate: "🔊 {username}'s Room" }];
                    updateTempVoiceChannels(next);
                  } else {
                    const next = currentChannels.filter((_, idx) => idx !== index);
                    updateTempVoiceChannels(next);
                  }
                };

                return (
                  <div>
                    <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Join-to-Create Voice Channels</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Configure up to 10 automated temporary voice channel triggers for your server.
                          </p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.tempVoice?.enabled || false}
                            onChange={() => handleToggle('tempVoice.enabled')}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>

                      {settings.tempVoice?.enabled && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                              Trigger Channels ({currentChannels.length} / 10)
                            </span>
                            <button
                              type="button"
                              onClick={handleAddChannel}
                              disabled={currentChannels.length >= 10}
                              className="btn-primary"
                              style={{
                                padding: '6px 14px',
                                fontSize: '0.825rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                opacity: currentChannels.length >= 10 ? 0.5 : 1,
                                cursor: currentChannels.length >= 10 ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <span>+ Add Trigger Channel</span>
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {currentChannels.map((chConfig, index) => (
                              <div
                                key={index}
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  borderRadius: '10px',
                                  padding: '18px',
                                  position: 'relative'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                                    OPTION #{index + 1}
                                  </span>
                                  {currentChannels.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveChannel(index)}
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        color: '#ef4444',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '6px',
                                        padding: '4px 10px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      Remove Option
                                    </button>
                                  )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '14px' }}>
                                  {/* Trigger Voice Channel */}
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                      Trigger Channel (Join to Create) <span style={{ color: 'var(--danger)' }}>*</span>
                                    </label>
                                    <select
                                      value={chConfig.channelId || ''}
                                      onChange={(e) => handleChannelChange(index, 'channelId', e.target.value)}
                                      className="glass-input"
                                    >
                                      <option value="">-- Select voice channel --</option>
                                      {voiceChannels.map(vc => (
                                        <option key={vc.id} value={vc.id}>🔊 {vc.name}</option>
                                      ))}
                                    </select>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                      Members joining this voice channel will get their own temporary channel.
                                    </span>
                                  </div>

                                  {/* Target Category */}
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                      Target Category (Optional)
                                    </label>
                                    <select
                                      value={chConfig.categoryId || ''}
                                      onChange={(e) => handleChannelChange(index, 'categoryId', e.target.value)}
                                      className="glass-input"
                                    >
                                      <option value="">-- Use same category as trigger channel --</option>
                                      {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                      ))}
                                    </select>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                      Where newly generated voice rooms will be created.
                                    </span>
                                  </div>
                                </div>

                                {/* Channel Name Template */}
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Channel Name Template
                                  </label>
                                  <input
                                    type="text"
                                    value={chConfig.nameTemplate || ''}
                                    onChange={(e) => handleChannelChange(index, 'nameTemplate', e.target.value)}
                                    className="glass-input"
                                    style={{ maxWidth: '450px' }}
                                    placeholder="🔊 {username}'s Room"
                                  />
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                    Supports placeholder: <code>{`{username}`}</code>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 8.8: PREMIUM POLLS */}
              {activeTab === 'polls' && (
                <div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start', marginBottom: '40px' }}>
                    {/* Left Column: Creator Form */}
                    <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

                      {/* Target Channel */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Target Discord Channel <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <select
                          value={pollChannelId}
                          onChange={(e) => setPollChannelId(e.target.value)}
                          className="glass-input"
                        >
                          <option value="">-- Select Discord Channel --</option>
                          {channels.map(ch => (
                            <option key={ch.id} value={ch.id}># {ch.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Question */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Poll Question <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                          type="text"
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          maxLength={256}
                          className="glass-input"
                          placeholder="e.g., What feature should we build next?"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description / Details (Optional)</label>
                        <textarea
                          rows="3"
                          value={pollDescription}
                          onChange={(e) => setPollDescription(e.target.value)}
                          maxLength={1024}
                          className="glass-input"
                          placeholder="Provide context or explanation for the poll..."
                        />
                      </div>

                      {/* Options Configuration */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Poll Options ({pollOptions.length}/10)</h4>
                          <button
                            type="button"
                            onClick={() => {
                              if (pollOptions.length < 10) setPollOptions([...pollOptions, '']);
                            }}
                            disabled={pollOptions.length >= 10}
                            className="btn-success"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          >
                            + Add Option
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {pollOptions.map((opt, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '24px', fontWeight: '600' }}>#{idx + 1}</span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...pollOptions];
                                  updated[idx] = e.target.value;
                                  setPollOptions(updated);
                                }}
                                className="glass-input"
                                placeholder={`Option ${idx + 1}`}
                                maxLength={80}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (pollOptions.length > 2) {
                                    setPollOptions(pollOptions.filter((_, i) => i !== idx));
                                  } else {
                                    alert('A poll must have at least 2 options.');
                                  }
                                }}
                                className="btn-danger"
                                style={{ padding: '8px 12px', height: '38px', display: 'flex', alignItems: 'center' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Advanced Settings Row */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '14px' }}>Poll Settings</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Allow Multiple Choices</span>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Voters can select more than one option.</p>
                            </div>
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={pollMultipleChoice}
                                onChange={(e) => setPollMultipleChoice(e.target.checked)}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                            <div>
                              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Anonymous Voting</span>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Hide the identity of voters (votes count will still update).</p>
                            </div>
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={pollAnonymous}
                                onChange={(e) => setPollAnonymous(e.target.checked)}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                            <div>
                              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Show Live Results</span>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Allow users to see current vote counts in Discord before ending.</p>
                            </div>
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={pollShowResultsBeforeEnding}
                                onChange={(e) => setPollShowResultsBeforeEnding(e.target.checked)}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Auto-Expiration Date & Time (Optional)</label>
                            <input
                              type="datetime-local"
                              value={pollExpiresAt}
                              onChange={(e) => setPollExpiresAt(e.target.value)}
                              className="glass-input"
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Embed Customization */}
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '14px' }}>Style Customization</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Embed Color</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={pollColor}
                                  onChange={(e) => setPollColor(e.target.value)}
                                  style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                                />
                                <input
                                  type="text"
                                  value={pollColor}
                                  onChange={(e) => setPollColor(e.target.value)}
                                  className="glass-input"
                                  placeholder="#2563eb"
                                />
                              </div>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Thumbnail URL</label>
                              <input
                                type="text"
                                value={pollThumbnailUrl}
                                onChange={(e) => setPollThumbnailUrl(e.target.value)}
                                className="glass-input"
                                placeholder="https://example.com/thumbnail.png"
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Image URL</label>
                            <input
                              type="text"
                              value={pollImageUrl}
                              onChange={(e) => setPollImageUrl(e.target.value)}
                              className="glass-input"
                              placeholder="https://example.com/banner.png"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                          type="button"
                          onClick={handleCreatePoll}
                          disabled={creatingPoll}
                          className="btn-primary pulse-glow"
                          style={{ gap: '10px' }}
                        >
                          <Send size={18} />
                          {creatingPoll ? 'Publishing...' : 'Publish Poll'}
                        </button>
                      </div>

                    </div>

                    {/* Right Column: Live Discord Preview */}
                    <div style={{
                      flex: '1 0 350px',
                      maxWidth: '520px',
                      position: 'sticky',
                      top: '24px',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <Eye size={14} />
                        Live Discord Preview
                      </span>
                      <DiscordMessagePreview
                        botUser={{ username: user?.username }}
                        guildName={guildName}
                        guildIcon={guildIcon}
                        message={pollDescription}
                        buttonEnabled={false}
                        buttonLabel=""
                        embedEnabled={true}
                        embedTitle={`Poll: ${pollQuestion || 'Enter Question'}`}
                        embedDesc={pollDescription}
                        embedColor={pollColor}
                        embedThumb={pollThumbnailUrl}
                        embedImage={pollImageUrl}
                        isDM={false}
                        buttons={pollOptions.filter(Boolean).map(opt => ({ label: opt }))}
                      />
                    </div>
                  </div>

                  {/* Polls History & Live Stats — Premium Glassmorphic Design */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '36px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Manage Server Polls</h3>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(148,163,184,0.7)', margin: '4px 0 0 0' }}>{polls.length} poll{polls.length !== 1 ? 's' : ''} found</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', fontSize: '0.78rem', color: '#60a5fa', fontWeight: '600' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                        Live Synced
                      </div>
                    </div>

                    {polls.length === 0 ? (
                      <div style={{
                        padding: '60px 40px',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(2,6,23,0.9))',
                        border: '1px dashed rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        backdropFilter: 'blur(12px)'
                      }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📊</div>
                        <p style={{ color: 'rgba(148,163,184,0.8)', margin: 0, fontSize: '1rem' }}>No polls yet. Create your first poll above or use <code style={{ color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: '2px 6px', borderRadius: '4px' }}>/poll</code> in Discord!</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
                        {polls.map(poll => {
                          const allVoters = new Set();
                          let maxVotes = 0;
                          poll.options.forEach(opt => {
                            if (opt.votes) opt.votes.forEach(v => allVoters.add(v));
                            const cnt = opt.votes ? opt.votes.length : 0;
                            if (cnt > maxVotes) maxVotes = cnt;
                          });
                          const totalVotes = allVoters.size;
                          const isPollActive = poll.status === 'active';
                          const themeColor = poll.settings?.color || '#2563eb';

                          return (
                            <div
                              key={poll._id}
                              style={{
                                position: 'relative',
                                background: 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.98) 100%)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: isPollActive
                                  ? `1px solid ${themeColor}55`
                                  : '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '20px',
                                padding: '22px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                boxShadow: isPollActive
                                  ? `0 0 30px ${themeColor}22, 0 8px 32px rgba(0,0,0,0.5)`
                                  : '0 8px 32px rgba(0,0,0,0.4)',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                                cursor: 'default',
                                overflow: 'hidden'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = isPollActive
                                  ? `0 0 40px ${themeColor}33, 0 16px 48px rgba(0,0,0,0.6)`
                                  : '0 16px 48px rgba(0,0,0,0.6)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = isPollActive
                                  ? `0 0 30px ${themeColor}22, 0 8px 32px rgba(0,0,0,0.5)`
                                  : '0 8px 32px rgba(0,0,0,0.4)';
                              }}
                            >
                              {/* Subtle top accent line */}
                              <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0,
                                height: '2px',
                                background: isPollActive
                                  ? `linear-gradient(90deg, transparent, ${themeColor}, transparent)`
                                  : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                borderRadius: '20px 20px 0 0'
                              }} />

                              {/* Header Row */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {/* Status Badge */}
                                  {isPollActive ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', fontSize: '0.7rem', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: '0 0 6px #22c55e' }} />
                                      Active
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.25)', fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      Ended
                                    </div>
                                  )}
                                  {/* Color dot */}
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: themeColor, boxShadow: `0 0 6px ${themeColor}` }} />
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.5)', fontWeight: '500' }}>
                                  {new Date(poll.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>

                              {/* Question */}
                              <div>
                                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                                  {poll.question}
                                </h4>
                                {poll.description && (
                                  <p style={{ fontSize: '0.78rem', color: 'rgba(148,163,184,0.7)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                                    {poll.description}
                                  </p>
                                )}
                              </div>

                              {/* Premium Progress Bars */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {poll.options.map((opt, idx) => {
                                  const optVotes = opt.votes ? opt.votes.length : 0;
                                  const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                                  const isWinner = !isPollActive && optVotes > 0 && optVotes === maxVotes;
                                  const barColor = isWinner ? '#eab308' : themeColor;

                                  return (
                                    <div key={opt.id || idx} style={{ position: 'relative' }}>
                                      {/* Label Row */}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{
                                          fontSize: '0.8rem',
                                          fontWeight: isWinner ? '700' : '500',
                                          color: isWinner ? '#fde047' : 'rgba(226,232,240,0.85)',
                                          display: 'flex', alignItems: 'center', gap: '5px',
                                          maxWidth: '72%',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}>
                                          {isWinner && <span style={{ fontSize: '0.9rem' }}>👑</span>}
                                          {opt.text}
                                        </span>
                                        <span style={{
                                          fontSize: '0.78rem',
                                          fontWeight: '700',
                                          color: isWinner ? '#fde047' : 'rgba(226,232,240,0.9)',
                                          whiteSpace: 'nowrap'
                                        }}>
                                          {pct}% <span style={{ opacity: 0.5, fontWeight: '400' }}>({optVotes})</span>
                                        </span>
                                      </div>

                                      {/* Bar Track */}
                                      <div style={{
                                        width: '100%',
                                        height: '10px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '999px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                      }}>
                                        {/* Filled portion */}
                                        <div style={{
                                          width: `${pct}%`,
                                          height: '100%',
                                          background: isWinner
                                            ? 'linear-gradient(90deg, #ca8a04, #fde047)'
                                            : `linear-gradient(90deg, ${themeColor}, ${themeColor}cc)`,
                                          borderRadius: '999px',
                                          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                                          position: 'relative',
                                          boxShadow: pct > 0 ? `0 0 10px ${barColor}88` : 'none'
                                        }}>
                                          {/* Sheen overlay */}
                                          {pct > 10 && (
                                            <div style={{
                                              position: 'absolute',
                                              inset: 0,
                                              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                                              borderRadius: '999px'
                                            }} />
                                          )}
                                        </div>
                                      </div>

                                      {/* Winner gold border accent */}
                                      {isWinner && (
                                        <div style={{
                                          position: 'absolute',
                                          inset: -1,
                                          borderRadius: '6px',
                                          border: '1px solid rgba(234,179,8,0.25)',
                                          pointerEvents: 'none'
                                        }} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Footer */}
                              <div style={{
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                paddingTop: '14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.7)' }}>
                                    🗳️ <strong style={{ color: '#e2e8f0' }}>{totalVotes}</strong> voter{totalVotes !== 1 ? 's' : ''}
                                  </span>
                                  {poll.settings?.multipleChoice && (
                                    <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)', fontWeight: '600' }}>
                                      Multi-Choice
                                    </span>
                                  )}
                                  {poll.settings?.anonymous && (
                                    <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)', fontWeight: '600' }}>
                                      Anon
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {isPollActive && (
                                    <button
                                      type="button"
                                      onClick={() => handleEndPoll(poll._id)}
                                      style={{
                                        padding: '6px 14px',
                                        fontSize: '0.72rem',
                                        fontWeight: '700',
                                        border: '1px solid rgba(251,191,36,0.35)',
                                        background: 'rgba(251,191,36,0.1)',
                                        color: '#fbbf24',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        letterSpacing: '0.03em'
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.2)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(251,191,36,0.25)'; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                      End Poll
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePoll(poll._id)}
                                    style={{
                                      padding: '6px 14px',
                                      fontSize: '0.72rem',
                                      fontWeight: '700',
                                      border: '1px solid rgba(239,68,68,0.3)',
                                      background: 'rgba(239,68,68,0.08)',
                                      color: '#f87171',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      letterSpacing: '0.03em'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(239,68,68,0.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Save Settings Button footer */}
              {activeTab !== 'overview' && activeTab !== 'logs' && activeTab !== 'broadcast' && activeTab !== 'publish' && activeTab !== 'polls' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving || !hasUnsavedChanges()}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    Reset Changes
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary pulse-glow"
                    style={{ gap: '10px' }}
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              )}

            </form>
          )}
        </main>
      </div>

      {showCropModal && uploadFile && (
        <CropModal
          file={uploadFile}
          onClose={() => {
            setShowCropModal(false);
            setUploadFile(null);
          }}
          onCrop={async ({ file, cropX, cropY, cropWidth, cropHeight }) => {
            setShowCropModal(false);
            setUploadFile(null);
            setSaving(true);
            setErrorMsg(null);
            try {
              const res = await api.uploadBackground(guildId, file, { cropX, cropY, cropWidth, cropHeight });
              handleInputChange('welcome.background', res.url);
              showNotification('Background uploaded and cropped successfully!');
            } catch (err) {
              console.error(err);
              setErrorMsg(err.message || 'File upload failed.');
            } finally {
              setSaving(false);
            }
          }}
        />
      )}
      {showWordBulkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '24px', borderRadius: '16px', background: '#181824', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={20} color="#3b82f6" /> Bulk Upload Filtered Words
              </h3>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowWordBulkModal(false)} />
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Upload a <code>.txt</code> or <code>.csv</code> file, or paste line-by-line / comma-separated words below.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px', fontSize: '0.85rem' }}>
                <UploadCloud size={16} /> Choose File (.txt / .csv)
                <input
                  type="file"
                  accept=".txt,.csv"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        setWordBulkText(evt.target.result || '');
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>

            <textarea
              rows="8"
              placeholder="Paste words here (one per line or comma separated)...&#10;badword1&#10;badword2, badword3"
              value={wordBulkText}
              onChange={(e) => setWordBulkText(e.target.value)}
              className="glass-input"
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowWordBulkModal(false)}>Cancel</button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (wordBulkText.trim()) {
                    const parsed = wordBulkText
                      .split(/[\n,]+/)
                      .map(w => w.trim().toLowerCase())
                      .filter(Boolean);

                    const current = settings?.moderation?.wordFilter?.words || [];
                    const combined = Array.from(new Set([...current, ...parsed]));
                    handleInputChange('moderation.wordFilter.words', combined);
                    showNotification(`Imported ${combined.length - current.length} new words into directory.`);
                  }
                  setWordBulkText('');
                  setShowWordBulkModal(false);
                }}
              >
                Import Words
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
