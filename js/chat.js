(function () {
  var currentCastMember = null;

  var GROUP_MESSAGES_KEY = 'stagesync_group_messages';
  var DIRECTORS_MESSAGES_KEY = 'stagesync_directors_messages';

  var chatView = document.getElementById('chat-view');
  var chatUserName = document.getElementById('chat-user-name');
  var signOutBtn = document.getElementById('sign-out-btn');
  var chatTabs = document.querySelectorAll('.chat-tab');
  var groupChatPanel = document.getElementById('group-chat-panel');
  var directorsChatPanel = document.getElementById('directors-chat-panel');
  var groupMessages = document.getElementById('group-messages');
  var directorsMessages = document.getElementById('directors-messages');
  var groupInput = document.getElementById('group-message-input');
  var directorsInput = document.getElementById('directors-message-input');
  var groupSendBtn = document.getElementById('group-send-btn');
  var directorsSendBtn = document.getElementById('directors-send-btn');

  function checkAuth() {
    if (typeof window.StageSyncAuth === 'undefined') return null;
    var member = window.StageSyncAuth.getCastMember();
    return member || null;
  }

  function canDeleteMessages() {
    return currentCastMember === 'lucas';
  }

  function showChat() {
    if (chatView) chatView.hidden = false;
    if (currentCastMember && chatUserName) {
      var displayName = typeof CAST_DISPLAY_NAMES !== 'undefined' && CAST_DISPLAY_NAMES[currentCastMember]
        ? CAST_DISPLAY_NAMES[currentCastMember]
        : currentCastMember;
      chatUserName.textContent = displayName;
    }
    var activeTab = document.querySelector('.chat-tab.active');
    var activeTabName = activeTab ? activeTab.getAttribute('data-tab') : 'group';
    renderMessages(activeTabName);
  }

  function getMessages(type) {
    try {
      var key = type === 'group' ? GROUP_MESSAGES_KEY : DIRECTORS_MESSAGES_KEY;
      var stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveMessages(type, messages) {
    try {
      var key = type === 'group' ? GROUP_MESSAGES_KEY : DIRECTORS_MESSAGES_KEY;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {}
  }

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

  function formatDate(timestamp) {
    var date = new Date(timestamp);
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

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
    messages.forEach(function (msg, index) {
      var msgDate = formatDate(msg.timestamp);
      if (msgDate !== lastDate) {
        html += '<div class="chat-date-divider">' + escapeHtml(msgDate) + '</div>';
        lastDate = msgDate;
      }
      var isOwnMessage = msg.castMember === currentCastMember;
      var userName = typeof CAST_DISPLAY_NAMES !== 'undefined' && CAST_DISPLAY_NAMES[msg.castMember]
        ? CAST_DISPLAY_NAMES[msg.castMember]
        : msg.castMember;
      html += '<div class="chat-message' + (isOwnMessage ? ' chat-message-own' : '') + '" data-msg-index="' + index + '">';
      html += '<div class="chat-message-header">';
      html += '<strong class="chat-message-author">' + escapeHtml(userName) + '</strong>';
      html += '<span class="chat-message-time">' + escapeHtml(formatTime(msg.timestamp)) + '</span>';
      if (canDeleteMessages()) {
        html += '<button type="button" class="chat-message-delete" aria-label="Delete message" data-msg-index="' + index + '">×</button>';
      }
      html += '</div>';
      html += '<div class="chat-message-text">' + escapeHtml(msg.text).replace(/\n/g, '<br>') + '</div>';
      html += '</div>';
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
    if (canDeleteMessages()) {
      container.querySelectorAll('.chat-message-delete').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = parseInt(btn.getAttribute('data-msg-index'), 10);
          var list = getMessages(type);
          if (idx >= 0 && idx < list.length) {
            list.splice(idx, 1);
            saveMessages(type, list);
            renderMessages(type);
          }
        });
      });
    }
  }

  function sendMessage(type, text) {
    if (!text.trim() || !currentCastMember) return;
    var messages = getMessages(type);
    messages.push({ castMember: currentCastMember, text: text.trim(), timestamp: Date.now() });
    saveMessages(type, messages);
    renderMessages(type);
    if (type === 'group' && groupInput) groupInput.value = '';
    if (type === 'directors' && directorsInput) directorsInput.value = '';
  }

  function switchTab(tabName) {
    chatTabs.forEach(function (tab) {
      tab.classList.remove('active');
      if (tab.getAttribute('data-tab') === tabName) tab.classList.add('active');
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

  if (signOutBtn) {
    signOutBtn.addEventListener('click', function () {
      if (window.StageSyncAuth) window.StageSyncAuth.clearAuth();
      window.location.href = 'index.html';
    });
  }

  chatTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      switchTab(tab.getAttribute('data-tab'));
    });
  });

  if (groupSendBtn && groupInput) {
    groupSendBtn.addEventListener('click', function () { sendMessage('group', groupInput.value); });
  }
  if (directorsSendBtn && directorsInput) {
    directorsSendBtn.addEventListener('click', function () { sendMessage('directors', directorsInput.value); });
  }
  if (groupInput) {
    groupInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage('group', groupInput.value); }
    });
  }
  if (directorsInput) {
    directorsInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage('directors', directorsInput.value); }
    });
  }

  function init() {
    currentCastMember = checkAuth();
    if (!currentCastMember) {
      window.location.href = 'index.html';
      return;
    }
    showChat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
