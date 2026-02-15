(function () {
  var SCRIPT_STORAGE_KEY = 'stagesync_script_content';
  var SCRIPT_URL = 'Script_Text/' + encodeURIComponent('EVERY NOVEL YOU READ IN HIGH SCHOOL (IN 25 MINUTES OR LESS).md');
  var container = document.getElementById('script-book-content');
  var prevBtn = document.getElementById('script-prev');
  var nextBtn = document.getElementById('script-next');
  var pageIndicator = document.getElementById('script-page-indicator');
  var editBtn = document.getElementById('script-edit-btn');
  var editArea = document.getElementById('script-edit-area');
  var editText = document.getElementById('script-edit-text');
  var saveBtn = document.getElementById('script-save-btn');
  var cancelEditBtn = document.getElementById('script-cancel-edit');
  var pages = [];
  var fullScriptText = '';
  var currentPage = 0;

  function canEditScript() {
    return typeof window.StageSyncAuth !== 'undefined' && window.StageSyncAuth.getCastMember() === 'lucas';
  }

  var PLAY_TITLE = 'EVERY NOVEL YOU READ IN HIGH SCHOOL (IN 25 MINUTES OR LESS)\nby Ian McWethy';

  function splitIntoPages(text) {
    if (!text || !text.trim()) return ['(No script content.)'];
    var parts = text.trim().split(/\n(?=Scene )/);
    parts = parts.map(function (p) { return p.trim(); });
    var first = parts[0];
    var sceneOneIdx = first.indexOf('Scene One');
    if (sceneOneIdx !== -1) parts[0] = first.substring(sceneOneIdx).trim();
    parts.shift();
    return parts.length ? parts : ['(No script content.)'];
  }

  function render() {
    if (!container) return;
    if (pages.length === 0) {
      container.innerHTML = '<p class="script-loading">Loading script…</p>';
      if (pageIndicator) pageIndicator.textContent = '';
      return;
    }
    var page = pages[currentPage];
    var firstLineEnd = page.indexOf('\n');
    var sceneTitle = firstLineEnd !== -1 ? page.substring(0, firstLineEnd) : page;
    var sceneBody = firstLineEnd !== -1 ? page.substring(firstLineEnd + 1) : '';
    var html = '';
    if (currentPage === 0) {
      html += '<div class="script-play-title">' + escapeHtml(PLAY_TITLE).replace(/\n/g, '<br>') + '</div>';
    }
    html += '<div class="script-scene-title">' + escapeHtml(sceneTitle) + '</div>';
    html += '<pre class="script-page-text">' + escapeHtml(sceneBody) + '</pre>';
    container.innerHTML = html;
    if (prevBtn) prevBtn.disabled = currentPage <= 0;
    if (nextBtn) nextBtn.disabled = currentPage >= pages.length - 1;
    if (pageIndicator) pageIndicator.textContent = (currentPage + 1) + ' / ' + pages.length;
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function goPrev() {
    if (currentPage > 0) {
      currentPage--;
      render();
    }
  }

  function goNext() {
    if (currentPage < pages.length - 1) {
      currentPage++;
      render();
    }
  }

  function onKey(e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
  }

  function getStoredScript() {
    if (typeof window.StageSyncStore !== 'undefined') {
      var v = window.StageSyncStore.getItem(SCRIPT_STORAGE_KEY);
      if (v != null && v.trim()) return v;
    }
    return localStorage.getItem(SCRIPT_STORAGE_KEY);
  }

  function setStoredScript(text) {
    try { localStorage.setItem(SCRIPT_STORAGE_KEY, text); } catch (e) {}
    if (typeof window.StageSyncStore !== 'undefined') window.StageSyncStore.setItem(SCRIPT_STORAGE_KEY, text);
  }

  function loadScript() {
    try {
      var stored = getStoredScript();
      if (stored && stored.trim()) {
        fullScriptText = stored;
        pages = splitIntoPages(fullScriptText);
        currentPage = 0;
        render();
        if (editBtn) editBtn.style.display = canEditScript() ? '' : 'none';
        return;
      }
    } catch (e) {}
    fetch(SCRIPT_URL)
      .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error('Not found')); })
      .then(function (text) {
        fullScriptText = text;
        setStoredScript(text);
        pages = splitIntoPages(text);
        currentPage = 0;
        render();
        if (editBtn) editBtn.style.display = canEditScript() ? '' : 'none';
      })
      .catch(function () {
        fullScriptText = '';
        pages = ['(Script file could not be loaded. Make sure the script file exists and is served by the same origin.)'];
        currentPage = 0;
        render();
        if (editBtn) editBtn.style.display = 'none';
      });
  }

  function showEditMode() {
    editText.value = fullScriptText;
    if (container) container.style.display = 'none';
    if (editArea) editArea.style.display = 'block';
    if (editBtn) editBtn.style.display = 'none';
    if (saveBtn) saveBtn.style.display = '';
    if (cancelEditBtn) cancelEditBtn.style.display = '';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (pageIndicator) pageIndicator.style.display = 'none';
  }

  function hideEditMode() {
    if (container) container.style.display = 'block';
    if (editArea) editArea.style.display = 'none';
    if (editBtn) editBtn.style.display = canEditScript() ? '' : 'none';
    if (saveBtn) saveBtn.style.display = 'none';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
    if (prevBtn) prevBtn.style.display = '';
    if (nextBtn) nextBtn.style.display = '';
    if (pageIndicator) pageIndicator.style.display = '';
  }

  function saveScript() {
    var text = editText.value.trim();
    fullScriptText = text;
    setStoredScript(text);
    pages = splitIntoPages(text);
    currentPage = 0;
    hideEditMode();
    render();
  }

  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtn) nextBtn.addEventListener('click', goNext);
  document.addEventListener('keydown', onKey);

  if (editBtn) {
    editBtn.addEventListener('click', function () {
      if (editArea && editArea.style.display === 'none') showEditMode();
      else { hideEditMode(); render(); }
    });
  }
  document.addEventListener('keydown', function (e) {
    if (editArea && editArea.style.display !== 'none' && e.key === 'Escape') {
      hideEditMode();
      render();
    }
  });
  if (saveBtn) saveBtn.addEventListener('click', saveScript);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', function () { hideEditMode(); render(); });

  function init() {
    if (typeof window.StageSyncStore !== 'undefined' && window.StageSyncStore.init) {
      window.StageSyncStore.init(loadScript);
    } else {
      loadScript();
    }
    window.addEventListener('stagesync-store-update', function (e) {
      if (e.detail && e.detail.key === SCRIPT_STORAGE_KEY) loadScript();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
