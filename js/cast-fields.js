(function () {
  var PREFIX = 'stagesync_cast_';
  function key(member, character, field) {
    return PREFIX + member + '_' + character + '_' + field;
  }
  function load() {
    document.querySelectorAll('.character-field').forEach(function (el) {
    var m = el.getAttribute('data-member');
    var c = el.getAttribute('data-character');
    var f = el.getAttribute('data-field');
    if (!m || !c || !f) return;
    try {
      var val = localStorage.getItem(key(m, c, f));
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
      localStorage.setItem(key(m, c, f), el.value);
    } catch (e) {}
  }
  document.querySelectorAll('.character-field').forEach(function (el) {
    el.addEventListener('input', function () { save(el); });
    el.addEventListener('blur', function () { save(el); });
  });
  load();
})();
