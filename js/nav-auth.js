(function () {
  var btn = document.getElementById('nav-sign-out');
  if (!btn) return;
  btn.addEventListener('click', function () {
    if (typeof window.StageSyncAuth !== 'undefined') {
      window.StageSyncAuth.clearAuth();
    } else {
      try { localStorage.removeItem('stagesync_chat_auth'); } catch (e) {}
    }
    var home = document.querySelector('a.nav-home');
    window.location.href = home ? home.getAttribute('href') : 'index.html';
  });
})();
