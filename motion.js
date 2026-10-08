/* hanjo motion system, the scripted half (see motion.css).
   - Work drifts: tiles in a work group move at slightly different rates while
     the group scrolls past (desktop with a mouse only).
   - Hover reads: hovering a cropped work frame scrolls its image to the end.
   - Big numbers rise into place the first time they scroll into view. */
(function () {
  if (!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var desktop = matchMedia('(min-width: 900px) and (hover: hover)').matches;

  /* Work groups: [container, tiles, rate per tile] */
  var groups = [
    ['.hx-strip', '.hx-row .hx-shot', [-0.06, 0.04, -0.03, 0.05, -0.05]],
    ['.rx-shots', '.rx-shots > .rx-shot', [-0.05, 0.05]],
    ['.wx-board', '.wx-board > *', [-0.03, 0.06]],
    ['.hero-collage', '.hero-collage .ew-track', [-0.18, 0.18]]
  ];

  var active = [];
  groups.forEach(function (g) {
    var box = document.querySelector(g[0]);
    var tiles = document.querySelectorAll(g[1]);
    if (!box || !tiles.length) return;
    tiles.forEach(function (t) { t.setAttribute('data-m-drift', ''); });
    active.push({ box: box, tiles: tiles, rates: g[2] });
  });

  if (desktop && active.length) {
    var queued = false;
    var drift = function () {
      queued = false;
      active.forEach(function (g) {
        var r = g.box.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var y = Math.min(r.top, innerHeight) - innerHeight * 0.5;
        g.tiles.forEach(function (el, i) {
          el.style.transform = 'translateY(' + (y * g.rates[i % g.rates.length]).toFixed(1) + 'px)';
        });
      });
    };
    addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(drift); } }, { passive: true });
    drift();
  }

  /* Hover reads */
  if (matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.hx-shot, .rx-shot, .wx-phone').forEach(function (frame) {
      var img = frame.querySelector('img');
      if (!img) return;
      frame.setAttribute('data-m-read', '');
      frame.addEventListener('mouseenter', function () {
        var d = img.offsetHeight - frame.clientHeight;
        if (d > 24) { img.style.transitionDuration = Math.min(5, 1.6 + d / 220).toFixed(1) + 's'; img.style.transform = 'translateY(' + (-d) + 'px)'; }
      });
      frame.addEventListener('mouseleave', function () { img.style.transitionDuration = '1.2s'; img.style.transform = ''; });
    });
  }

  /* Big numbers */
  if ('IntersectionObserver' in window) {
    document.querySelectorAll('.hx-num').forEach(function (num) {
      num.setAttribute('data-m-num', '');
      num.classList.add('is-waiting');
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        num.classList.remove('is-waiting');
      }, { threshold: 0.35 });
      io.observe(num.parentElement || num);
    });
  }
})();
