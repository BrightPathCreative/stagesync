(function () {
  var STORAGE_KEY = 'year9drama_calendar_events';
  var DIRECTOR_IDS = ['lucas', 'cc'];

  function getStoredEvents() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  function dateKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  var EDIT_CODE = '2665';
  var EDIT_MODE_KEY = 'year9drama_calendar_edit_mode';
  
  function isDirector() {
    try {
      return localStorage.getItem(EDIT_MODE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }
  
  function setDirectorMode(enabled) {
    try {
      if (enabled) {
        localStorage.setItem(EDIT_MODE_KEY, 'true');
      } else {
        localStorage.removeItem(EDIT_MODE_KEY);
      }
    } catch (e) {}
  }

  function renderMonth(year, month) {
    var first = new Date(year, month, 1);
    var last = new Date(year, month + 1, 0);
    var startDay = first.getDay();
    var daysInMonth = last.getDate();
    var events = getStoredEvents();
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var html = '<table class="calendar-grid" role="grid" aria-label="Month view">';
    html += '<thead><tr>';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function (d) {
      html += '<th scope="col">' + d + '</th>';
    });
    html += '</tr></thead><tbody>';

    var day = 1;
    var totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    var row = '<tr>';
    for (var i = 0; i < totalCells; i++) {
      if (i % 7 === 0 && i > 0) {
        html += row + '</tr>';
        row = '<tr>';
      }
      if (i < startDay || day > daysInMonth) {
        row += '<td class="calendar-day calendar-day-empty"></td>';
      } else {
        var d = new Date(year, month, day);
        var key = dateKey(d);
        var dayEvents = events[key] || [];
        var isToday = d.getTime() === today.getTime();
        var cellClass = 'calendar-day' + (isToday ? ' calendar-day-today' : '');
        var content = '<span class="calendar-day-num">' + day + '</span>';
        if (dayEvents.length) {
          content += '<ul class="calendar-day-events">';
          dayEvents.forEach(function (ev) {
            var type = (ev.type === 'reminder') ? 'reminder' : 'rehearsal';
            content += '<li class="calendar-event-' + type + '">' + escapeHtml(ev.title || (type === 'rehearsal' ? 'Rehearsal' : 'Reminder')) + '</li>';
          });
          content += '</ul>';
        }
        row += '<td class="' + cellClass + '" data-date="' + key + '" role="gridcell">' + content + '</td>';
        day++;
      }
    }
    html += row + '</tr></tbody></table>';
    return html;
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function showDayModal(dateKeyStr, year, month, dateNum) {
    var events = getStoredEvents();
    var list = events[dateKeyStr] || [];
    var canEdit = isDirector();
    var title = [monthNames[month], dateNum, year].join(' ');

    var modal = document.getElementById('calendar-day-modal');
    var content = document.getElementById('calendar-day-modal-content');
    if (!modal || !content) return;

    content.innerHTML =
      '<h2 id="modal-title">' + escapeHtml(title) + '</h2>' +
      '<div class="calendar-day-detail-events" id="calendar-day-detail-list">' +
      list.map(function (ev, i) {
        var type = (ev.type === 'reminder') ? 'reminder' : 'rehearsal';
        return '<div class="calendar-event-item calendar-event-' + type + '" data-index="' + i + '">' +
          '<strong>' + escapeHtml(ev.title || (type === 'rehearsal' ? 'Rehearsal' : 'Reminder')) + '</strong>' +
          (ev.details ? '<p>' + escapeHtml(ev.details) + '</p>' : '') +
          (canEdit ? '<button type="button" class="director-btn calendar-edit-event" data-index="' + i + '">Edit</button> <button type="button" class="link-style-btn calendar-remove-event" data-index="' + i + '">Remove</button>' : '') +
          '</div>';
      }).join('') +
      '</div>' +
      (canEdit
        ? '<p class="calendar-director-hint">Director / Assistant Director: you can add and edit events for this day.</p>' +
          '<div class="calendar-add-buttons">' +
          '<button type="button" class="director-btn calendar-add-rehearsal" id="calendar-add-rehearsal">Add rehearsal</button> ' +
          '<button type="button" class="director-btn director-btn-secondary calendar-add-reminder" id="calendar-add-reminder">Add reminder</button>' +
          '</div>'
        : '');

    modal.hidden = false;
    modal.setAttribute('aria-modal', 'true');

    var addRehearsalBtn = document.getElementById('calendar-add-rehearsal');
    var addReminderBtn = document.getElementById('calendar-add-reminder');
    if (addRehearsalBtn) addRehearsalBtn.onclick = function () { addEventForDay(dateKeyStr, year, month, dateNum, 'rehearsal'); };
    if (addReminderBtn) addReminderBtn.onclick = function () { addEventForDay(dateKeyStr, year, month, dateNum, 'reminder'); };

    content.querySelectorAll('.calendar-edit-event').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(btn.getAttribute('data-index'), 10);
        editEventForDay(dateKeyStr, list[idx], idx, year, month, dateNum);
      };
    });
    content.querySelectorAll('.calendar-remove-event').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(btn.getAttribute('data-index'), 10);
        list.splice(idx, 1);
        events[dateKeyStr] = list.length ? list : null;
        if (!list.length) delete events[dateKeyStr];
        saveEvents(events);
        showDayModal(dateKeyStr, year, month, dateNum);
        renderCalendar();
      };
    });
  }

  function closeDayModal() {
    var modal = document.getElementById('calendar-day-modal');
    if (modal) {
      modal.hidden = true;
      modal.removeAttribute('aria-modal');
    }
  }

  function addEventForDay(key, year, month, dateNum, type) {
    type = type === 'reminder' ? 'reminder' : 'rehearsal';
    var defaultTitle = type === 'rehearsal' ? 'Rehearsal' : 'Reminder';
    var title = prompt('Event title (e.g. ' + defaultTitle + ', Dress rehearsal):', defaultTitle);
    if (title === null) return;
    title = (title || '').trim() || defaultTitle;
    var details = prompt('Details (optional — what’s happening, time, etc.):', '');
    var events = getStoredEvents();
    if (!events[key]) events[key] = [];
    events[key].push({ title: title, details: (details || '').trim(), type: type });
    saveEvents(events);
    renderCalendar();
    showDayModal(key, year, month, dateNum);
  }

  function editEventForDay(key, ev, index, year, month, dateNum) {
    var currentType = ev.type === 'reminder' ? 'reminder' : 'rehearsal';
    var title = prompt('Event title:', ev.title || (currentType === 'rehearsal' ? 'Rehearsal' : 'Reminder'));
    if (title === null) return;
    var details = prompt('Details:', ev.details || '');
    var typePrompt = prompt('Type: rehearsal or reminder', currentType);
    var type = (typePrompt || '').toLowerCase().trim();
    type = type === 'reminder' ? 'reminder' : 'rehearsal';
    var events = getStoredEvents();
    if (!events[key] || !events[key][index]) return;
    events[key][index] = { title: (title || '').trim() || 'Rehearsal', details: (details || '').trim(), type: type };
    saveEvents(events);
    renderCalendar();
    showDayModal(key, year, month, dateNum);
  }

  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var currentYear, currentMonth;

  function renderCalendar() {
    var wrap = document.getElementById('calendar-month-wrap');
    var nav = document.getElementById('calendar-month-nav');
    if (!wrap || !nav) return;
    wrap.innerHTML = renderMonth(currentYear, currentMonth);
    nav.textContent = monthNames[currentMonth] + ' ' + currentYear;
  }

  function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  }

  function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  }

  function init() {
    var now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();

    var prevBtn = document.getElementById('calendar-prev');
    var nextBtn = document.getElementById('calendar-next');
    if (prevBtn) prevBtn.onclick = prevMonth;
    if (nextBtn) nextBtn.onclick = nextMonth;

    var editIcon = document.getElementById('calendar-edit-icon');
    var saveBtn = document.getElementById('calendar-save-btn');
    var codeModal = document.getElementById('calendar-code-modal');
    var codeInput = document.getElementById('calendar-code-input');
    var codeSubmit = document.getElementById('calendar-code-submit');
    var codeCancel = document.getElementById('calendar-code-cancel');
    var codeClose = document.getElementById('calendar-code-modal-close');
    var codeError = document.getElementById('calendar-code-error');
    
    function updateUI() {
      var inEditMode = isDirector();
      if (saveBtn) {
        if (inEditMode) {
          saveBtn.classList.add('visible');
        } else {
          saveBtn.classList.remove('visible');
        }
      }
      if (editIcon) {
        if (inEditMode) {
          editIcon.setAttribute('aria-label', 'Disable edit mode');
          editIcon.setAttribute('title', 'Disable edit mode');
          editIcon.classList.add('active');
          // Change icon to X/close
          var svg = document.getElementById('calendar-edit-icon-svg');
          if (svg) {
            svg.innerHTML = '<path d="M18 6L6 18M6 6l12 12"></path>';
          }
        } else {
          editIcon.setAttribute('aria-label', 'Enable edit mode');
          editIcon.setAttribute('title', 'Enable edit mode');
          editIcon.classList.remove('active');
          // Change icon back to edit
          var svg = document.getElementById('calendar-edit-icon-svg');
          if (svg) {
            svg.innerHTML = '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>';
          }
        }
      }
    }
    
    function showCodeModal() {
      if (codeModal) {
        codeModal.hidden = false;
        codeModal.setAttribute('aria-modal', 'true');
        if (codeInput) {
          codeInput.value = '';
          codeInput.focus();
        }
        if (codeError) {
          codeError.style.display = 'none';
        }
      }
    }
    
    function closeCodeModal() {
      if (codeModal) {
        codeModal.hidden = true;
        codeModal.removeAttribute('aria-modal');
      }
    }
    
    function verifyCode() {
      var entered = codeInput ? codeInput.value.trim() : '';
      if (entered === EDIT_CODE) {
        setDirectorMode(true);
        closeCodeModal();
        updateUI();
        renderCalendar();
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
    
    function disableEditMode() {
      setDirectorMode(false);
      updateUI();
      renderCalendar();
    }
    
    if (editIcon) {
      editIcon.onclick = function() {
        if (isDirector()) {
          disableEditMode();
        } else {
          showCodeModal();
        }
      };
    }
    
    if (saveBtn) {
      saveBtn.onclick = function() {
        // Save is handled automatically by localStorage, but we can refresh the view
        renderCalendar();
        // Optionally show a brief confirmation
        var originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        setTimeout(function() {
          saveBtn.textContent = originalText;
        }, 1000);
      };
    }
    
    if (codeSubmit) {
      codeSubmit.onclick = verifyCode;
    }
    
    if (codeCancel || codeClose) {
      var cancelHandler = function() {
        closeCodeModal();
      };
      if (codeCancel) codeCancel.onclick = cancelHandler;
      if (codeClose) codeClose.onclick = cancelHandler;
    }
    
    if (codeInput) {
      codeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          verifyCode();
        }
      });
    }
    
    if (codeModal) {
      codeModal.addEventListener('click', function(e) {
        if (e.target === codeModal) closeCodeModal();
      });
    }
    
    updateUI();

    renderCalendar();

    var wrap = document.getElementById('calendar-month-wrap');
    if (wrap) {
      wrap.addEventListener('click', function (e) {
        var cell = e.target.closest('td.calendar-day');
        if (!cell || cell.classList.contains('calendar-day-empty')) return;
        var key = cell.getAttribute('data-date');
        if (!key) return;
        var parts = key.split('-').map(Number);
        showDayModal(key, parts[0], parts[1] - 1, parts[2]);
      });
    }

    var closeBtn = document.getElementById('calendar-day-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', function (e) { e.preventDefault(); closeDayModal(); });

    var modal = document.getElementById('calendar-day-modal');
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeDayModal();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
