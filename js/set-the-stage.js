(function () {
  var PREFIX = 'stagesync_set_';

  function canEditTheSet() {
    if (typeof window.StageSyncAuth === 'undefined') return false;
    var member = window.StageSyncAuth.getCastMember();
    var ids = typeof THE_SET_EDIT_IDS !== 'undefined' ? THE_SET_EDIT_IDS : ['kane', 'lucas', 'cc'];
    return member && ids.indexOf(member) !== -1;
  }

  function storageKey(part) {
    return PREFIX + part;
  }

  function getVal(key) {
    if (typeof window.StageSyncStore !== 'undefined') {
      var v = window.StageSyncStore.getItem(key);
      if (v != null) return v;
    }
    return localStorage.getItem(key);
  }

  function setVal(key, val) {
    try { localStorage.setItem(key, val); } catch (e) {}
    if (typeof window.StageSyncStore !== 'undefined') window.StageSyncStore.setItem(key, val);
  }

  function load() {
    document.querySelectorAll('.set-notes').forEach(function (el) {
      var part = el.getAttribute('data-set-part');
      if (!part) return;
      try {
        var val = getVal(storageKey(part));
        if (val != null) el.value = val;
      } catch (e) {}
    });
  }

  function save(el) {
    var part = el.getAttribute('data-set-part');
    if (!part) return;
    try {
      setVal(storageKey(part), el.value);
    } catch (e) {}
  }

  function runInit() {
    var allowed = canEditTheSet();
    document.querySelectorAll('.set-notes').forEach(function (el) {
      if (!allowed) {
        el.readOnly = true;
        el.classList.add('set-notes-readonly');
      } else {
        el.addEventListener('input', function () { save(el); });
        el.addEventListener('blur', function () { save(el); });
      }
    });
    load();
  }

  function init() {
    if (typeof window.StageSyncStore !== 'undefined' && window.StageSyncStore.init) {
      window.StageSyncStore.init(runInit);
    } else {
      runInit();
    }
    window.addEventListener('stagesync-store-update', function (e) {
      if (e.detail && e.detail.key && e.detail.key.indexOf('stagesync_set_') === 0) load();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
