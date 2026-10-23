/* Protocol boot splash: CSS sequence, the "welcome back, doctor" voice line
   pulled from the source video, and the two-panel hand-off into the app.
   Every failure path only shortens the splash. */
(function () {
  var boot = document.getElementById('gsb');
  if (!boot) return;

  var BOOT_SOUND = __BOOT_SOUND__;
  var KEY = 'gsb:sound';
  var finished = false;
  var timer = 0;
  var soundOn = BOOT_SOUND;
  var blocked = false;

  try {
    var saved = window.localStorage.getItem(KEY);
    if (saved === '0' || saved === '1') soundOn = saved === '1';
  } catch (e) {}

  var audio = document.getElementById('gsb-audio');
  var soundBtn = document.getElementById('gsb-sound');
  var soundLabel = document.getElementById('gsb-sound-label');
  var skipBtn = document.getElementById('gsb-skip');

  function paintSound() {
    if (!soundBtn) return;
    soundBtn.setAttribute('data-on', soundOn ? '1' : '0');
    soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    if (soundLabel) soundLabel.textContent = blocked ? '点击开启音效' : soundOn ? '音效 开' : '音效 关';
  }

  function playWelcome() {
    if (!soundOn || !audio) return;
    try {
      audio.currentTime = 0;
      var p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.then(function () { blocked = false; paintSound(); }).catch(function () {
          blocked = true;
          paintSound();
        });
      }
    } catch (e) {}
  }

  var contourEl = null;
  var maskPending = false;
  var lastMask = 0;

  function fitContour() {
    try {
      var col = document.querySelector('[class*="sidebarCol"]');
      var root = document.documentElement.style;
      var logo = document.querySelector('.gs-logo');
      if (!col) return false;
      var rect = col.getBoundingClientRect();
      root.setProperty('--gs-contour-top', Math.round(rect.top) + 'px');
      root.setProperty('--gs-contour-left', Math.round(rect.right) + 'px');
      if (logo) {
        if (rect.width < 8) {
          logo.style.display = 'none';
        } else {
          logo.style.display = '';
          logo.style.left = Math.round(rect.left) + 'px';
          logo.style.top = Math.round(rect.top) + 'px';
          logo.style.width = Math.round(rect.width) + 'px';
          logo.style.height = Math.round(rect.height) + 'px';
        }
      }
      scheduleMask();
      return true;
    } catch (e) {
      return false;
    }
  }

  /* the app mounts after this script runs, so wait for the sidebar element */
  var sidebarTries = 0;
  function waitSidebar() {
    if (fitContour()) {
      try {
        var col = document.querySelector('[class*="sidebarCol"]');
        if (window.ResizeObserver && col) new window.ResizeObserver(fitContour).observe(col);
      } catch (e) {}
      return;
    }
    if (sidebarTries++ < 80) window.setTimeout(waitSidebar, 150);
  }

  /* Cut the contour map around every visible picture: a viewed image gets a
     clean rectangle, the rest of the page keeps the map. */
  function maskContours() {
    try {
      if (!contourEl) contourEl = document.querySelector('.gs-contour');
      if (!contourEl) return;
      var box = contourEl.getBoundingClientRect();
      if (!box.width || !box.height) return;
      var media = document.querySelectorAll('img, video, canvas');
      var holes = [];
      for (var i = 0; i < media.length; i++) {
        var b = media[i].getBoundingClientRect();
        if (b.width < 24 || b.height < 24) continue;
        if (b.bottom <= box.top || b.top >= box.bottom || b.right <= box.left || b.left >= box.right) continue;
        var x1 = Math.max(box.left, b.left) - box.left;
        var y1 = Math.max(box.top, b.top) - box.top;
        var x2 = Math.min(box.right, b.right) - box.left;
        var y2 = Math.min(box.bottom, b.bottom) - box.top;
        if (x2 - x1 < 8 || y2 - y1 < 8) continue;
        holes.push('M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'H' + x2.toFixed(1) + 'V' + y2.toFixed(1) + 'H' + x1.toFixed(1) + 'Z');
      }
      if (holes.length === 0) {
        contourEl.style.clipPath = '';
        return;
      }
      contourEl.style.clipPath =
        'path(evenodd, "M0 0H' + box.width.toFixed(1) + 'V' + box.height.toFixed(1) + 'H0Z ' + holes.join(' ') + '")';
    } catch (e) {}
  }

  function scheduleMask() {
    if (maskPending) return;
    if (Date.now() - lastMask < 160) {
      window.setTimeout(scheduleMask, 170);
      return;
    }
    maskPending = true;
    window.requestAnimationFrame(function () {
      maskPending = false;
      lastMask = Date.now();
      maskContours();
    });
  }

  function hexBurst() {
    try {
      var layer = document.createElement('div');
      layer.className = 'gsx';
      var w = 72;
      var h = 83;
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var cols = Math.ceil(vw / (w * 0.75)) + 2;
      var rows = Math.ceil(vh / h) + 2;
      var cx = vw / 2;
      var cy = vh / 2;
      var maxD = Math.sqrt(cx * cx + cy * cy) || 1;
      var frag = document.createDocumentFragment();
      for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
          var x = c * w * 0.75;
          var y = r * h + (c % 2 ? h / 2 : 0);
          var dx = x - cx;
          var dy = y - cy;
          var d = Math.sqrt(dx * dx + dy * dy) / maxD;
          var tile = document.createElement('i');
          tile.style.left = x + 'px';
          tile.style.top = y + 'px';
          tile.style.setProperty('--d', (d * 0.34).toFixed(3) + 's');
          frag.appendChild(tile);
        }
      }
      layer.appendChild(frag);
      document.body.appendChild(layer);
      window.setTimeout(function () {
        if (layer.parentNode) layer.parentNode.removeChild(layer);
      }, 1500);
    } catch (e) {}
  }

  function finish() {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    hexBurst();
    boot.classList.add('gsb--out');
    document.documentElement.classList.add('gsb-handoff');
    window.setTimeout(function () { boot.setAttribute('data-hidden', '1'); }, 480);
    window.setTimeout(function () { document.documentElement.classList.remove('gsb-handoff'); }, 1700);
  }

  function toggleSound() {
    if (blocked) {
      soundOn = true;
      blocked = false;
      try { window.localStorage.setItem(KEY, '1'); } catch (e) {}
      paintSound();
      playWelcome();
      return;
    }
    soundOn = !soundOn;
    try { window.localStorage.setItem(KEY, soundOn ? '1' : '0'); } catch (e) {}
    paintSound();
    if (soundOn) {
      playWelcome();
    } else if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    }
  }

  paintSound();
  playWelcome();


  waitSidebar();
  window.addEventListener('resize', fitContour);
  window.addEventListener('scroll', scheduleMask, true);
  document.addEventListener('load', scheduleMask, true);
  if (window.MutationObserver) {
    try {
      new window.MutationObserver(scheduleMask).observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }
  if (window.ResizeObserver) {
    try {

    } catch (e) {}
  }

  timer = window.setTimeout(finish, 3400);
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.clearTimeout(timer);
    timer = window.setTimeout(finish, 1600);
  }

  if (skipBtn) skipBtn.addEventListener('click', function (e) { e.stopPropagation(); finish(); });
  if (soundBtn) soundBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleSound(); });
  boot.addEventListener('click', finish);
  window.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'Escape' || k === 'Enter' || k === ' ') { e.preventDefault(); finish(); }
    else if (k === 'm' || k === 'M') toggleSound();
  });

  window.__PRTS__ = {
    replay: function () {
      var node = document.getElementById('gsb');
      if (!node || !node.parentNode) return false;
      var clone = node.cloneNode(true);
      clone.removeAttribute('data-hidden');
      clone.classList.remove('gsb--out');
      node.parentNode.replaceChild(clone, node);
      boot = clone;
      finished = false;
      boot.addEventListener('click', finish);
      window.setTimeout(finish, 3400);
      return true;
    },
    setSound: function (on) {
      soundOn = !!on;
      blocked = false;
      try { window.localStorage.setItem(KEY, soundOn ? '1' : '0'); } catch (e) {}
      paintSound();
      if (soundOn) playWelcome();
      return soundOn;
    },
    sound: function () { return soundOn; },
  };
})();