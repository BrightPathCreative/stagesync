(function () {
  'use strict';

  // Initialize Edit/Save functionality for personal notes
  function initPersonalNotes() {
    document.querySelectorAll('.personal-notes').forEach(function (container) {
      var textarea = container.querySelector('textarea');
      if (!textarea) return;

      var label = container.querySelector('label');
      var storageKey = 'stagesync_personal_notes_' + textarea.id.replace('personal-notes-', '');
      
      // Create header with label and buttons
      var header = document.createElement('div');
      header.className = 'notes-header';
      
      var labelSpan = document.createElement('span');
      if (label) {
        labelSpan.textContent = label.textContent.replace(/\(.*\)/g, '').trim();
        labelSpan.style.fontSize = '0.85rem';
        labelSpan.style.fontWeight = '600';
        labelSpan.style.color = 'var(--maroon)';
      }
      
      var actions = document.createElement('div');
      actions.className = 'notes-actions';
      
      var editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'notes-btn';
      editBtn.textContent = 'Edit';
      
      var saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'notes-btn save-btn';
      saveBtn.textContent = 'Save';
      saveBtn.style.display = 'none';
      
      actions.appendChild(editBtn);
      actions.appendChild(saveBtn);
      
      header.appendChild(labelSpan);
      header.appendChild(actions);
      
      // Create read-only view
      var readonlyView = document.createElement('div');
      readonlyView.className = 'notes-readonly';
      
      // Load saved content
      function loadContent() {
        try {
          var saved = localStorage.getItem(storageKey);
          if (saved) {
            textarea.value = saved;
            readonlyView.textContent = saved;
            readonlyView.classList.remove('empty');
          } else {
            readonlyView.textContent = textarea.placeholder || 'No notes yet. Click Edit to add notes.';
            readonlyView.classList.add('empty');
          }
        } catch (e) {
          readonlyView.textContent = textarea.placeholder || 'No notes yet. Click Edit to add notes.';
          readonlyView.classList.add('empty');
        }
      }
      
      // Save content
      function saveContent() {
        try {
          localStorage.setItem(storageKey, textarea.value);
          readonlyView.textContent = textarea.value || textarea.placeholder || 'No notes yet. Click Edit to add notes.';
          if (textarea.value) {
            readonlyView.classList.remove('empty');
          } else {
            readonlyView.classList.add('empty');
          }
        } catch (e) {}
      }
      
      // Enter edit mode
      function enterEditMode() {
        container.classList.add('edit-mode');
        editBtn.style.display = 'none';
        saveBtn.style.display = 'block';
        textarea.focus();
      }
      
      // Exit edit mode
      function exitEditMode() {
        container.classList.remove('edit-mode');
        editBtn.style.display = 'block';
        saveBtn.style.display = 'none';
        saveContent();
      }
      
      // Event listeners
      editBtn.addEventListener('click', enterEditMode);
      saveBtn.addEventListener('click', exitEditMode);
      
      // Replace label with header
      if (label) {
        label.parentNode.insertBefore(header, label);
        label.remove();
      } else {
        container.insertBefore(header, textarea);
      }
      
      // Add readonly view
      container.insertBefore(readonlyView, textarea);
      
      // Load initial content
      loadContent();
    });
  }

  // Initialize Edit/Save functionality for character fields
  function initCharacterFields() {
    // Wait a bit for cast-fields.js to initialize first
    setTimeout(function () {
      document.querySelectorAll('.character-field').forEach(function (textarea) {
        // Skip if already initialized
        if (textarea.dataset.notesEditInitialized) return;
        textarea.dataset.notesEditInitialized = 'true';
        
        var section = textarea.closest('.character-extras');
        if (!section) return;
        
        // Create read-only view
        var readonlyView = document.createElement('div');
        readonlyView.className = 'character-field-readonly';
        
        // Create actions
        var actions = document.createElement('div');
        actions.className = 'character-field-actions';
        
        var editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'notes-btn';
        editBtn.textContent = 'Edit';
        editBtn.style.fontSize = '0.8rem';
        editBtn.style.padding = '0.25rem 0.5rem';
        
        var saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'notes-btn save-btn';
        saveBtn.textContent = 'Save';
        saveBtn.style.fontSize = '0.8rem';
        saveBtn.style.padding = '0.25rem 0.5rem';
        saveBtn.style.display = 'none';
        
        actions.appendChild(editBtn);
        actions.appendChild(saveBtn);
        
        // Get storage key (same as cast-fields.js uses)
        var member = textarea.getAttribute('data-member');
        var character = textarea.getAttribute('data-character');
        var field = textarea.getAttribute('data-field');
        var storageKey = 'stagesync_cast_' + member + '_' + character + '_' + field;
        
        // Load content
        function loadContent() {
          try {
            var saved = localStorage.getItem(storageKey);
            if (saved) {
              readonlyView.textContent = saved;
              readonlyView.classList.remove('empty');
            } else {
              readonlyView.textContent = textarea.placeholder || '';
              readonlyView.classList.add('empty');
            }
          } catch (e) {
            readonlyView.textContent = textarea.placeholder || '';
            readonlyView.classList.add('empty');
          }
        }
        
        // Update readonly view when textarea changes (for cast-fields.js auto-save)
        function updateReadonlyView() {
          var value = textarea.value;
          if (value) {
            readonlyView.textContent = value;
            readonlyView.classList.remove('empty');
          } else {
            readonlyView.textContent = textarea.placeholder || '';
            readonlyView.classList.add('empty');
          }
        }
        
        // Enter edit mode
        function enterEditMode() {
          section.classList.add('edit-mode');
          editBtn.style.display = 'none';
          saveBtn.style.display = 'block';
          textarea.focus();
        }
        
        // Exit edit mode
        function exitEditMode() {
          section.classList.remove('edit-mode');
          editBtn.style.display = 'block';
          saveBtn.style.display = 'none';
          updateReadonlyView();
        }
        
        // Event listeners
        editBtn.addEventListener('click', enterEditMode);
        saveBtn.addEventListener('click', exitEditMode);
        
        // Listen for changes from cast-fields.js
        textarea.addEventListener('input', updateReadonlyView);
        textarea.addEventListener('blur', updateReadonlyView);
        
        // Insert readonly view and actions
        textarea.parentNode.insertBefore(readonlyView, textarea);
        textarea.parentNode.insertBefore(actions, textarea.nextSibling);
        
        // Load initial content
        loadContent();
      });
    }, 100);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initPersonalNotes();
      initCharacterFields();
    });
  } else {
    initPersonalNotes();
    initCharacterFields();
  }
})();
