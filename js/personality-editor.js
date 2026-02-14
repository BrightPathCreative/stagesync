(function () {
  'use strict';

  var PREFIX = 'stagesync_cast_';
  var PERSONALITY_EDIT_KEY = 'stagesync_personality_edit_mode';

  function key(member, character) {
    return PREFIX + member + '_' + character + '_personality';
  }

  function isDirector() {
    return typeof window.StageSyncAuth !== 'undefined' && window.StageSyncAuth.isDirector();
  }

  function isPersonalityEditMode() {
    try {
      return localStorage.getItem(PERSONALITY_EDIT_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function setPersonalityEditMode(enabled) {
    try {
      if (enabled) {
        localStorage.setItem(PERSONALITY_EDIT_KEY, 'true');
      } else {
        localStorage.removeItem(PERSONALITY_EDIT_KEY);
      }
    } catch (e) {}
  }

  function initPersonalityFields() {
    document.querySelectorAll('.personality-field').forEach(function (textarea) {
      var member = textarea.getAttribute('data-member');
      var character = textarea.getAttribute('data-character');
      var storageKey = key(member, character);
      var readonlyView = textarea.previousElementSibling;

      if (!readonlyView || !readonlyView.classList.contains('personality-readonly')) {
        return;
      }

      function loadContent() {
        try {
          var saved = localStorage.getItem(storageKey);
          if (saved) {
            textarea.value = saved;
            readonlyView.textContent = saved;
            readonlyView.classList.remove('empty');
          } else {
            var originalText = textarea.getAttribute('data-original') || textarea.placeholder || '';
            if (originalText) {
              readonlyView.textContent = originalText;
              readonlyView.classList.remove('empty');
            } else {
              readonlyView.textContent = textarea.placeholder || '';
              readonlyView.classList.add('empty');
            }
          }
        } catch (e) {
          readonlyView.textContent = textarea.placeholder || '';
          readonlyView.classList.add('empty');
        }
      }

      function saveContent() {
        try {
          localStorage.setItem(storageKey, textarea.value);
          readonlyView.textContent = textarea.value || textarea.placeholder || '';
          if (textarea.value) {
            readonlyView.classList.remove('empty');
          } else {
            readonlyView.classList.add('empty');
          }
        } catch (e) {}
      }

      textarea.addEventListener('input', function () { saveContent(); });
      textarea.addEventListener('blur', function () { saveContent(); });
      loadContent();
    });
  }

  function updatePersonalityFieldsVisibility() {
    var director = isDirector();
    document.querySelectorAll('.personality-section').forEach(function (section) {
      var readonlyView = section.querySelector('.personality-readonly');
      var textarea = section.querySelector('.personality-field');
      var editBtn = section.querySelector('.personality-edit-btn');
      var saveBtn = section.querySelector('.personality-save-btn');

      if (!readonlyView || !textarea) return;

      readonlyView.style.display = 'block';
      textarea.style.display = 'none';

      if (editBtn) {
        editBtn.style.display = director ? 'inline-block' : 'none';
        editBtn.style.visibility = director ? 'visible' : 'hidden';
      }
      if (saveBtn) {
        saveBtn.style.display = 'none';
        saveBtn.style.visibility = 'hidden';
      }
    });
  }

  function setupEditButtons() {
    document.querySelectorAll('.personality-edit-btn').forEach(function (editBtn) {
      var newBtn = editBtn.cloneNode(true);
      editBtn.parentNode.replaceChild(newBtn, editBtn);

      newBtn.addEventListener('click', function () {
        if (!isDirector()) return;
        if (!isPersonalityEditMode()) {
          setPersonalityEditMode(true);
        }
        var section = newBtn.closest('.personality-section');
        if (!section) return;
        var readonlyView = section.querySelector('.personality-readonly');
        var textarea = section.querySelector('.personality-field');
        var saveBtn = section.querySelector('.personality-save-btn');

        if (readonlyView && textarea && saveBtn) {
          readonlyView.style.display = 'none';
          textarea.style.display = 'block';
          newBtn.style.display = 'none';
          newBtn.style.visibility = 'hidden';
          saveBtn.style.display = 'inline-block';
          saveBtn.style.visibility = 'visible';
          textarea.focus();
        }
      });
    });

    document.querySelectorAll('.personality-save-btn').forEach(function (saveBtn) {
      var newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

      newSaveBtn.addEventListener('click', function () {
        var section = newSaveBtn.closest('.personality-section');
        if (!section) return;
        var readonlyView = section.querySelector('.personality-readonly');
        var textarea = section.querySelector('.personality-field');
        var editBtn = section.querySelector('.personality-edit-btn');

        if (readonlyView && textarea && editBtn) {
          var member = textarea.getAttribute('data-member');
          var character = textarea.getAttribute('data-character');
          var storageKey = key(member, character);
          try {
            localStorage.setItem(storageKey, textarea.value);
            readonlyView.textContent = textarea.value || textarea.placeholder || '';
            readonlyView.classList.toggle('empty', !textarea.value);
          } catch (e) {}

          readonlyView.style.display = 'block';
          textarea.style.display = 'none';
          editBtn.style.display = 'inline-block';
          editBtn.style.visibility = 'visible';
          newSaveBtn.style.display = 'none';
          newSaveBtn.style.visibility = 'hidden';
        }
      });
    });
  }

  function init() {
    updatePersonalityFieldsVisibility();
    initPersonalityFields();
    setupEditButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
