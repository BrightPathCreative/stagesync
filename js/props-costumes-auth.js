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
        var note1 = document.createElement('p');
        note1.id = noteId;
        note1.className = 'props-costumes-note';
        note1.textContent = 'The props and costume section is only available to be edited by the directors and those that have it as a production role.';
        main.appendChild(note1);
      }
      var ideasNoteId = 'character-ideas-note';
      if (!document.getElementById(ideasNoteId)) {
        var note2 = document.createElement('p');
        note2.id = ideasNoteId;
        note2.className = 'props-costumes-note';
        note2.textContent = 'The Character Ideas section is only editable by yourself (the person you are signed in as).';
        main.appendChild(note2);
      }
    }

    // Character Ideas: only editable on your own profile. Run after notes-edit.js has added Edit buttons.
    setTimeout(restrictCharacterIdeas, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
