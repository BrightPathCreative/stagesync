(function () {
  var PREFIX = 'stagesync_cast_';
  function key(member, character, field) {
    return PREFIX + member + '_' + character + '_' + field;
  }
  function getVal(k) {
    if (typeof window.StageSyncStore !== 'undefined') {
      var v = window.StageSyncStore.getItem(k);
      if (v != null) return v;
    }
    return localStorage.getItem(k);
  }
  function setVal(k, v) {
    try { localStorage.setItem(k, v); } catch (e) {}
    if (typeof window.StageSyncStore !== 'undefined') window.StageSyncStore.setItem(k, v);
  }
  function load() {
    document.querySelectorAll('.character-field').forEach(function (el) {
      var m = el.getAttribute('data-member');
      var c = el.getAttribute('data-character');
      var f = el.getAttribute('data-field');
      if (!m || !c || !f) return;
      try {
        var val = getVal(key(m, c, f));
        if (val != null) el.value = val;
      } catch (e) {}
    });
  }
  function save(el) {
    var m = el.getAttribute('data-member');
    var c = el.getAttribute('data-character');
    var f = el.getAttribute('data-field');
    if (!m || !c || !f) return;
    try {
      setVal(key(m, c, f), el.value);
    } catch (e) {}
  }
  function runInit() {
    document.querySelectorAll('.character-field').forEach(function (el) {
      el.addEventListener('input', function () { save(el); });
      el.addEventListener('blur', function () { save(el); });
    });
    load();
  }
  if (typeof window.StageSyncStore !== 'undefined' && window.StageSyncStore.init) {
    window.StageSyncStore.init(runInit);
  } else {
    runInit();
  }
  window.addEventListener('stagesync-store-update', function (e) {
    if (e.detail && e.detail.key && e.detail.key.indexOf(PREFIX) === 0) load();
  });
})();
