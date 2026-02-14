(function () {
  function init() {
    var body = document.body;
    if (body.classList.contains('page-loading')) {
      body.classList.remove('page-loading');
      body.classList.add('page-visible');
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || !a.href) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      try {
        var url = new URL(a.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && !url.hash) return;
      } catch (err) {
        return;
      }
      e.preventDefault();
      body.classList.add('page-leaving');
      body.addEventListener('animationend', function onLeave() {
        body.removeEventListener('animationend', onLeave);
        window.location.href = a.href;
      }, { once: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
