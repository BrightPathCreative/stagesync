(function () {
  var currentCastMember = null;

  // Storage keys for localStorage
  var GROUP_MESSAGES_KEY = 'stagesync_group_messages';
  var DIRECTORS_MESSAGES_KEY = 'stagesync_directors_messages';
  var AUTH_STORAGE_KEY = 'stagesync_chat_auth';

  // DOM elements
  var gate = document.getElementById('chat-gate');
  var chatView = document.getElementById('chat-view');
  var chatUserName = document.getElementById('chat-user-name');
  var pinForm = document.getElementById('pin-form');
  var pinInput = document.getElementById('pin-input');
  var pinSubmitBtn = document.getElementById('pin-submit-btn');
  var signOutBtn = document.getElementById('sign-out-btn');
  var authError = document.getElementById('auth-error');

  // Chat tabs
  var chatTabs = document.querySelectorAll('.chat-tab');
  var groupChatPanel = document.getElementById('group-chat-panel');
  var directorsChatPanel = document.getElementById('directors-chat-panel');

  // Message containers
  var groupMessages = document.getElementById('group-messages');
  var directorsMessages = document.getElementById('directors-messages');

  // Input fields
  var groupInput = document.getElementById('group-message-input');
  var directorsInput = document.getElementById('directors-message-input');
  var groupSendBtn = document.getElementById('group-send-btn');
  var directorsSendBtn = document.getElementById('directors-send-btn');

  // Check if user is already authenticated
  function checkExistingAuth() {
    try {
      var stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        var authData = JSON.parse(stored);
        // Verify the PIN is still valid (in case PINs were changed)
        if (typeof CAST_PIN_MAP !== 'undefined' && CAST_PIN_MAP[authData.pin]) {
          currentCastMember = CAST_PIN_MAP[authData.pin];
          showChat();
          return true;
        } else {
          // PIN no longer valid, clear auth
          clearAuth();
        }
      }
    } catch (e) {
      console.error('Failed to check existing auth:', e);
      clearAuth();
    }
    return false;
  }

  // Authenticate with PIN
  function authenticateWithPin(pin) {
    if (!pin || !pin.trim()) {
      showError('Please enter a PIN');
      return false;
    }

    pin = pin.trim();

    // Check if PIN exists in map
    if (typeof CAST_PIN_MAP === 'undefined' || !CAST_PIN_MAP[pin]) {
      showError('Invalid PIN. Please try again.');
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
      return false;
    }

    // PIN is valid
    currentCastMember = CAST_PIN_MAP[pin];
    
    // Store authentication
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        pin: pin,
        castMember: currentCastMember,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Failed to store auth:', e);
    }

    hideError();
    showChat();
    return true;
  }

  // Clear authentication
  function clearAuth() {
    currentCastMember = null;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
  }

  // Sign out
  function signOut() {
    clearAuth();
    showGate();
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
  }

  // Show error message
  function showError(message) {
    if (authError) {
      authError.textContent = message;
      authError.style.display = 'block';
    }
    if (pinInput) {
      pinInput.style.borderColor = '#d32f2f';
    }
  }

  // Hide error message
  function hideError() {
    if (authError) {
      authError.style.display = 'none';
    }
    if (pinInput) {
      pinInput.style.borderColor = 'var(--cream-darker)';
    }
  }

  // Show gate (login screen)
  function showGate() {
    if (gate) gate.hidden = false;
    if (chatView) chatView.hidden = true;
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
  }

  // Show chat interface
  function showChat() {
    if (gate) gate.hidden = true;
    if (chatView) chatView.hidden = false;

    // Update user info display
    if (currentCastMember) {
      var displayName = typeof CAST_DISPLAY_NAMES !== 'undefined' && CAST_DISPLAY_NAMES[currentCastMember] 
        ? CAST_DISPLAY_NAMES[currentCastMember] 
        : currentCastMember;
      
      if (chatUserName) {
        chatUserName.textContent = displayName;
      }
    }

    // Render messages for active tab
    var activeTab = document.querySelector('.chat-tab.active');
    var activeTabName = activeTab ? activeTab.getAttribute('data-tab') : 'group';
    renderMessages(activeTabName);
  }

  // Get messages from storage
  function getMessages(type) {
    try {
      var key = type === 'group' ? GROUP_MESSAGES_KEY : DIRECTORS_MESSAGES_KEY;
      var stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  // Save messages to storage
  function saveMessages(type, messages) {
    try {
      var key = type === 'group' ? GROUP_MESSAGES_KEY : DIRECTORS_MESSAGES_KEY;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {}
  }

  // Format timestamp
  function formatTime(timestamp) {
    var date = new Date(timestamp);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
  }

  // Format date
  function formatDate(timestamp) {
    var date = new Date(timestamp);
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Render messages
  function renderMessages(type) {
    if (!currentCastMember) return;

    var messages = getMessages(type);
    var container = type === 'group' ? groupMessages : directorsMessages;

    if (messages.length === 0) {
      container.innerHTML = '<div class="chat-empty">No messages yet. Be the first to say something!</div>';
      return;
    }

    var html = '';
    var lastDate = '';

    messages.forEach(function (msg) {
      var msgDate = formatDate(msg.timestamp);
      if (msgDate !== lastDate) {
        html += '<div class="chat-date-divider">' + escapeHtml(msgDate) + '</div>';
        lastDate = msgDate;
      }

      var isOwnMessage = msg.castMember === currentCastMember;
      var userName = typeof CAST_DISPLAY_NAMES !== 'undefined' && CAST_DISPLAY_NAMES[msg.castMember]
        ? CAST_DISPLAY_NAMES[msg.castMember]
        : msg.castMember;
      
      html += '<div class="chat-message' + (isOwnMessage ? ' chat-message-own' : '') + '">';
      html += '<div class="chat-message-header">';
      html += '<strong class="chat-message-author">' + escapeHtml(userName) + '</strong>';
      html += '<span class="chat-message-time">' + escapeHtml(formatTime(msg.timestamp)) + '</span>';
      html += '</div>';
      html += '<div class="chat-message-text">' + escapeHtml(msg.text).replace(/\n/g, '<br>') + '</div>';
      html += '</div>';
    });

    container.innerHTML = html;
    scrollToBottom(container);
  }

  // Scroll to bottom of messages
  function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }

  // Send message
  function sendMessage(type, text) {
    if (!text.trim()) return;
    if (!currentCastMember) return;

    var messages = getMessages(type);
    var newMessage = {
      castMember: currentCastMember,
      text: text.trim(),
      timestamp: Date.now()
    };

    messages.push(newMessage);
    saveMessages(type, messages);
    renderMessages(type);

    // Clear input
    if (type === 'group') {
      if (groupInput) groupInput.value = '';
    } else {
      if (directorsInput) directorsInput.value = '';
    }
  }

  // Handle tab switching
  function switchTab(tabName) {
    chatTabs.forEach(function (tab) {
      tab.classList.remove('active');
      if (tab.getAttribute('data-tab') === tabName) {
        tab.classList.add('active');
      }
    });

    if (groupChatPanel) groupChatPanel.classList.remove('active');
    if (directorsChatPanel) directorsChatPanel.classList.remove('active');

    if (tabName === 'group') {
      if (groupChatPanel) groupChatPanel.classList.add('active');
      renderMessages('group');
      if (groupInput) groupInput.focus();
    } else {
      if (directorsChatPanel) directorsChatPanel.classList.add('active');
      renderMessages('directors');
      if (directorsInput) directorsInput.focus();
    }
  }

  // Event listeners
  if (pinForm) {
    pinForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (pinInput) {
        authenticateWithPin(pinInput.value);
      }
    });
  }

  if (pinInput) {
    pinInput.addEventListener('input', function() {
      hideError();
    });

    pinInput.addEventListener('keypress', function(e) {
      // Only allow numbers
      if (!/[0-9]/.test(e.key) && e.key !== 'Enter' && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
        e.preventDefault();
      }
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', signOut);
  }

  // Tab switching
  if (chatTabs.length > 0) {
    chatTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var tabName = tab.getAttribute('data-tab');
        switchTab(tabName);
      });
    });
  }

  // Send buttons
  if (groupSendBtn) {
    groupSendBtn.addEventListener('click', function () {
      if (groupInput) sendMessage('group', groupInput.value);
    });
  }

  if (directorsSendBtn) {
    directorsSendBtn.addEventListener('click', function () {
      if (directorsInput) sendMessage('directors', directorsInput.value);
    });
  }

  // Enter key to send (Shift+Enter for new line)
  if (groupInput) {
    groupInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage('group', groupInput.value);
      }
    });
  }

  if (directorsInput) {
    directorsInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage('directors', directorsInput.value);
      }
    });
  }

  // Initialize
  function init() {
    // Check if PIN config is loaded
    if (typeof CAST_PIN_MAP === 'undefined') {
      showError('PIN configuration not found. Please configure js/pin-config.js');
      return;
    }

    // Check for existing authentication
    if (!checkExistingAuth()) {
      showGate();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
