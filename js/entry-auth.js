// Shared auth helpers: read/write the single entry PIN session
(function () {
  function getAuth() {
    try {
      var raw = localStorage.getItem(typeof STAGESYNC_AUTH_KEY !== 'undefined' ? STAGESYNC_AUTH_KEY : 'stagesync_chat_auth');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setAuth(pin, castMember) {
    try {
      var key = typeof STAGESYNC_AUTH_KEY !== 'undefined' ? STAGESYNC_AUTH_KEY : 'stagesync_chat_auth';
      localStorage.setItem(key, JSON.stringify({ pin: pin, castMember: castMember, timestamp: Date.now() }));
    } catch (e) {}
  }

  function clearAuth() {
    try {
      var key = typeof STAGESYNC_AUTH_KEY !== 'undefined' ? STAGESYNC_AUTH_KEY : 'stagesync_chat_auth';
      localStorage.removeItem(key);
    } catch (e) {}
  }

  function getCastMember() {
    var auth = getAuth();
    if (!auth || !auth.castMember) return null;
    if (typeof CAST_PIN_MAP !== 'undefined' && auth.pin && !CAST_PIN_MAP[auth.pin]) return null;
    return auth.castMember;
  }

  function isDirector() {
    var member = getCastMember();
    var ids = typeof DIRECTOR_IDS !== 'undefined' ? DIRECTOR_IDS : ['lucas', 'cc'];
    return ids.indexOf(member) !== -1;
  }

  window.StageSyncAuth = {
    getAuth: getAuth,
    setAuth: setAuth,
    clearAuth: clearAuth,
    getCastMember: getCastMember,
    isDirector: isDirector
  };
})();
