(function () {
  function initNav() {
    var items = document.querySelectorAll('.nav-item');
    items.forEach(function (item) {
      var btn = item.querySelector('button');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = item.classList.contains('nav-dropdown-open');
        items.forEach(function (i) { i.classList.remove('nav-dropdown-open'); });
        if (!isOpen) item.classList.add('nav-dropdown-open');
      });
    });
    document.addEventListener('click', function () {
      items.forEach(function (i) { i.classList.remove('nav-dropdown-open'); });
    });

    // Hamburger menu toggle
    var navToggle = document.getElementById('nav-toggle');
    var navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', function () {
        var isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
      });

      // Close menu when clicking outside
      document.addEventListener('click', function (e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('active');
        }
      });

      // Close menu when clicking a link
      navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('active');
        });
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
