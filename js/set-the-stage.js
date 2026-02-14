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

  function load() {
    document.querySelectorAll('.set-notes').forEach(function (el) {
      var part = el.getAttribute('data-set-part');
      if (!part) return;
      try {
        var val = localStorage.getItem(storageKey(part));
        if (val != null) el.value = val;
      } catch (e) {}
    });
  }

  function save(el) {
    var part = el.getAttribute('data-set-part');
    if (!part) return;
    try {
      localStorage.setItem(storageKey(part), el.value);
    } catch (e) {}
  }

  function init() {
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
