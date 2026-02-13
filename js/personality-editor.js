(function () {
  'use strict';

  var EDIT_CODE = '2665';
  var PREFIX = 'stagesync_cast_';
  var PERSONALITY_EDIT_KEY = 'stagesync_personality_edit_mode';

  function key(member, character) {
    return PREFIX + member + '_' + character + '_personality';
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

  function createPinModal() {
    // Check if modal already exists
    var existingModal = document.getElementById('personality-code-modal');
    if (existingModal) {
      return existingModal;
    }

    var modal = document.createElement('div');
    modal.id = 'personality-code-modal';
    modal.className = 'calendar-modal';
    modal.setAttribute('hidden', '');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'personality-code-modal-title');
    modal.setAttribute('aria-modal', 'true');
    
    modal.innerHTML = '<div class="calendar-modal-inner">' +
      '<button type="button" class="calendar-modal-close" id="personality-code-modal-close" aria-label="Close">×</button>' +
      '<h2 id="personality-code-modal-title">Enter Access Code</h2>' +
      '<p style="margin: 0.5rem 0 1rem; color: var(--text-muted);">Directors only: Enter code to edit personality.</p>' +
      '<input type="text" id="personality-code-input" class="calendar-code-input" placeholder="Enter code" maxlength="4" autocomplete="off" />' +
      '<div class="calendar-form-buttons" style="margin-top: 1rem;">' +
      '<button type="button" class="director-btn" id="personality-code-submit">Submit</button>' +
      '<button type="button" class="director-btn director-btn-secondary" id="personality-code-cancel">Cancel</button>' +
      '</div>' +
      '<p id="personality-code-error" style="margin: 0.75rem 0 0; color: var(--maroon); font-size: 0.9rem; display: none;">Unfortunately, only the directors are allowed to edit personality sections.</p>' +
      '</div>';
    
    document.body.appendChild(modal);
    return modal;
  }

  function showPinModal() {
    var modal = createPinModal();
    var codeInput = document.getElementById('personality-code-input');
    var codeError = document.getElementById('personality-code-error');
    
    modal.hidden = false;
    modal.setAttribute('aria-modal', 'true');
    if (codeInput) {
      codeInput.value = '';
      codeInput.focus();
    }
    if (codeError) {
      codeError.style.display = 'none';
    }
  }

  function closePinModal() {
    var modal = document.getElementById('personality-code-modal');
    if (modal) {
      modal.hidden = true;
      modal.removeAttribute('aria-modal');
    }
  }

  function verifyPin() {
    var codeInput = document.getElementById('personality-code-input');
    var codeError = document.getElementById('personality-code-error');
    
    if (!codeInput) return false;
    
    var enteredCode = codeInput.value.trim();
    
    if (enteredCode === EDIT_CODE) {
      setPersonalityEditMode(true);
      closePinModal();
      updatePersonalityFieldsVisibility();
      return true;
    } else {
      if (codeError) {
        codeError.style.display = 'block';
      }
      if (codeInput) {
        codeInput.value = '';
        codeInput.focus();
      }
      return false;
    }
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

      // Load saved content
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

      // Save content
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

      // Event listeners
      textarea.addEventListener('input', function () {
        saveContent();
      });
      textarea.addEventListener('blur', function () {
        saveContent();
      });

      // Load initial content
      loadContent();
    });
  }

  function updatePersonalityFieldsVisibility() {
    var editMode = isPersonalityEditMode();
    document.querySelectorAll('.personality-section').forEach(function (section) {
      var readonlyView = section.querySelector('.personality-readonly');
      var textarea = section.querySelector('.personality-field');
      var editBtn = section.querySelector('.personality-edit-btn');
      var saveBtn = section.querySelector('.personality-save-btn');

      if (!readonlyView || !textarea) return;

      // Always show readonly view and edit button
      readonlyView.style.display = 'block';
      textarea.style.display = 'none';
      
      if (editBtn) {
        editBtn.style.display = 'inline-block';
        editBtn.style.visibility = 'visible';
      }
      
      if (editMode) {
        // In edit mode, show save button if we're currently editing
        // But initially, we're not editing, so hide save button
        if (saveBtn && textarea.style.display === 'none') {
          saveBtn.style.display = 'none';
          saveBtn.style.visibility = 'hidden';
        }
      } else {
        // Not in edit mode, hide save button
        if (saveBtn) {
          saveBtn.style.display = 'none';
          saveBtn.style.visibility = 'hidden';
        }
      }
    });
  }

  function setupEditButtons() {
    document.querySelectorAll('.personality-edit-btn').forEach(function (editBtn) {
      // Remove any existing listeners by cloning
      var newBtn = editBtn.cloneNode(true);
      editBtn.parentNode.replaceChild(newBtn, editBtn);
      
      newBtn.addEventListener('click', function () {
        // Check if already in edit mode
        if (isPersonalityEditMode()) {
          // Already authenticated, allow editing
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
        } else {
          // Not authenticated, show pin modal
          showPinModal();
        }
      });
    });

    document.querySelectorAll('.personality-save-btn').forEach(function (saveBtn) {
      // Remove any existing listeners by cloning
      var newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
      
      newSaveBtn.addEventListener('click', function () {
        var section = newSaveBtn.closest('.personality-section');
        if (!section) return;
        var readonlyView = section.querySelector('.personality-readonly');
        var textarea = section.querySelector('.personality-field');
        var editBtn = section.querySelector('.personality-edit-btn');

        if (readonlyView && textarea && editBtn) {
          // Save content
          var member = textarea.getAttribute('data-member');
          var character = textarea.getAttribute('data-character');
          var storageKey = key(member, character);
          try {
            localStorage.setItem(storageKey, textarea.value);
            readonlyView.textContent = textarea.value || textarea.placeholder || '';
            if (textarea.value) {
              readonlyView.classList.remove('empty');
            } else {
              readonlyView.classList.add('empty');
            }
          } catch (e) {}

          // Switch back to read-only view
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

  function setupPinModal() {
    var modal = createPinModal();
    var codeInput = document.getElementById('personality-code-input');
    var codeSubmit = document.getElementById('personality-code-submit');
    var codeCancel = document.getElementById('personality-code-cancel');
    var codeClose = document.getElementById('personality-code-modal-close');
    
    function handleSubmit() {
      if (verifyPin()) {
        // After successful pin, trigger edit mode for the first personality section
        var firstEditBtn = document.querySelector('.personality-edit-btn');
        if (firstEditBtn) {
          firstEditBtn.click();
        }
      }
    }
    
    if (codeSubmit) {
      codeSubmit.addEventListener('click', handleSubmit);
    }
    
    if (codeInput) {
      codeInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          handleSubmit();
        }
      });
    }
    
    if (codeCancel) {
      codeCancel.addEventListener('click', closePinModal);
    }
    
    if (codeClose) {
      codeClose.addEventListener('click', closePinModal);
    }
    
    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          closePinModal();
        }
      });
    }
  }

  // Initialize when DOM is ready
  function init() {
    updatePersonalityFieldsVisibility();
    initPersonalityFields();
    setupEditButtons();
    setupPinModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
