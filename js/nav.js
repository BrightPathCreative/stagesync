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
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
