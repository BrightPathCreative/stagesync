(function () {
  function canEditPropsCostumes() {
    if (typeof window.StageSyncAuth === 'undefined') return false;
    var member = window.StageSyncAuth.getCastMember();
    var ids = typeof PROPS_COSTUMES_EDIT_IDS !== 'undefined' ? PROPS_COSTUMES_EDIT_IDS : ['lucas', 'cc', 'duncan', 'ben', 'albie'];
    return member && ids.indexOf(member) !== -1;
  }

  function getPageMember() {
    var first = document.querySelector('.character-field[data-field="notes"]');
    return first ? first.getAttribute('data-member') : null;
  }

  function canEditCharacterIdeas() {
    if (typeof window.StageSyncAuth === 'undefined') return false;
    var current = window.StageSyncAuth.getCastMember();
    var pageMember = getPageMember();
    return current && pageMember && current === pageMember;
  }

  function restrictCharacterIdeas() {
    var canEdit = canEditCharacterIdeas();
    document.querySelectorAll('.character-field[data-field="notes"]').forEach(function (el) {
      if (canEdit) return;
      el.readOnly = true;
      el.classList.add('character-ideas-readonly');
      var section = el.closest('.cast-section');
      if (section) {
        var actions = section.querySelector('.character-field-actions');
        if (actions) {
          var editBtn = actions.querySelector('.notes-btn:not(.save-btn)');
          if (editBtn) editBtn.style.display = 'none';
        }
      }
    });
  }

  function init() {
    var allowed = canEditPropsCostumes();

    document.querySelectorAll('.character-field').forEach(function (el) {
      var field = el.getAttribute('data-field');
      if (field !== 'props' && field !== 'costumes') return;
      if (!allowed) {
        el.readOnly = true;
        el.classList.add('props-costumes-readonly');
      }
    });

    var main = document.querySelector('main.page');
    if (main) {
      var noteId = 'props-costumes-note';
      if (!document.getElementById(noteId)) {
        var note = document.createElement('p');
        note.id = noteId;
        note.className = 'props-costumes-note';
        note.textContent = 'The props and costume section is only available to be edited by the directors and those that have it as a production role.';
        main.appendChild(note);
      }
    }

    // Character Ideas: only editable on your own profile. Run after notes-edit.js has added Edit buttons.
    setTimeout(restrictCharacterIdeas, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
