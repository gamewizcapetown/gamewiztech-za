(function() {
  function applyTheme(theme) {
    var body = document.body;
    body.classList.remove('light', 'dark');
    if (theme === 'dark') body.classList.add('dark');
    if (theme === 'light') body.classList.add('light');
    var btn = document.getElementById('darkToggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '&#9728;&#65039;' : '&#127769;';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function currentTheme() {
    if (document.body.classList.contains('dark')) return 'dark';
    if (document.body.classList.contains('light')) return 'light';
    return null;
  }

  var stored = null;
  try { stored = localStorage.getItem('gamewiz-theme'); } catch (e) {}

  var btn = document.getElementById('darkToggle');
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  } else {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) document.body.classList.add('dark');
    if (btn) {
      btn.textContent = prefersDark ? '&#9728;&#65039;' : '&#127769;';
      btn.setAttribute('title', prefersDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  if (btn) {
    btn.addEventListener('click', function() {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('gamewiz-theme', next); } catch (e) {}
      applyTheme(next);
    });
  }
})();
