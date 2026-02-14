/**
 * Shared store: localStorage when Supabase is not configured,
 * Supabase app_data table when it is. Used for calendar, set, characters,
 * directors notes, script, etc. so edits sync across devices.
 */
(function () {
  var cache = {};
  var inited = false;
  var supabaseClient = null;

  function useSupabase() {
    var cfg = typeof window !== 'undefined' && window.StageSyncSupabase;
    return cfg && cfg.url && cfg.anonKey && typeof window.supabase !== 'undefined';
  }

  function getClient() {
    if (supabaseClient) return supabaseClient;
    if (!useSupabase()) return null;
    var cfg = window.StageSyncSupabase;
    supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
    return supabaseClient;
  }

  function init(callback) {
    if (inited) {
      if (callback) callback();
      return;
    }
    if (!useSupabase()) {
      inited = true;
      if (callback) callback();
      return;
    }
    var client = getClient();
    if (!client) {
      inited = true;
      if (callback) callback();
      return;
    }
    client
      .from('app_data')
      .select('key, value')
      .then(function (res) {
        var rows = Array.isArray(res.data) ? res.data : [];
        rows.forEach(function (row) {
          cache[row.key] = row.value;
        });
        inited = true;
        client
          .channel('stagesync-app-data')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'app_data' }, function (payload) {
            var row = payload.new;
            if (row && row.key != null) {
              cache[row.key] = row.value;
              try {
                window.dispatchEvent(new CustomEvent('stagesync-store-update', { detail: { key: row.key } }));
              } catch (e) {}
            }
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_data' }, function (payload) {
            var row = payload.new;
            if (row && row.key != null) {
              cache[row.key] = row.value;
              try {
                window.dispatchEvent(new CustomEvent('stagesync-store-update', { detail: { key: row.key } }));
              } catch (e) {}
            }
          })
          .subscribe();
        if (callback) callback();
      })
      .catch(function () {
        inited = true;
        if (callback) callback();
      });
  }

  function getItem(key) {
    if (!useSupabase() || !inited) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }
    return cache[key] != null ? cache[key] : null;
  }

  function setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
    if (!useSupabase()) return;
    cache[key] = value;
    var client = getClient();
    if (!client) return;
    client
      .from('app_data')
      .upsert({ key: key, value: value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .then(function () {})
      .catch(function () {});
  }

  window.StageSyncStore = {
    init: init,
    getItem: getItem,
    setItem: setItem,
    useSupabase: useSupabase
  };
})();
