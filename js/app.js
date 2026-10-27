(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  // Cryptographic fair coin: heads=0, tails=1.
  // Uint32 has 2^32 equally-likely values, divisible by 2, so %2 has zero bias.
  function fairFlip() {
    if (window.crypto && window.crypto.getRandomValues) {
      var buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return buf[0] % 2;
    }
    // Fallback for non-secure contexts
    return Math.random() < 0.5 ? 0 : 1;
  }

  var state = {
    flips: [],       // newest first: {side:0|1, ts:number}
    count: 1,
    flipping: false,
    fresh: false
  };

  var coin = $('coin'), verdict = $('verdict');
  var lift = $('coin-lift'), shadow = $('coin-shadow'), ring = $('land-ring'), wrap = $('coin-wrap');
  var histEl = $('history');

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Give the coin real thickness: a stack of thin discs between the two faces.
  (function buildRim() {
    if (!coin) return;
    var n = 14, frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var z = -6.4 + (12.8 * i / (n - 1));
      var d = document.createElement('i');
      d.className = 'rim';
      d.style.transform = 'translateZ(' + z.toFixed(2) + 'px)';
      frag.appendChild(d);
    }
    coin.insertBefore(frag, coin.firstChild);
  })();

  function persist() {
    try { localStorage.setItem('tailsnow', JSON.stringify({ flips: state.flips, count: state.count })); } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem('tailsnow');
      if (raw) { var d = JSON.parse(raw); state.flips = d.flips || []; state.count = d.count || 1; }
    } catch (e) {}
  }

  function sideLabel(s) { return s === 0 ? 'Heads' : 'Tails'; }

  function renderStats() {
    var heads = state.flips.filter(function (f) { return f.side === 0; }).length;
    var tails = state.flips.length - heads;
    var total = state.flips.length;
    var hp = total ? Math.round((heads / total) * 100) : 0;
    var tp = total ? 100 - hp : 0;
    $('h-count').textContent = heads;
    $('t-count').textContent = tails;
    $('total').textContent = total;
    $('h-pct').textContent = hp + '%';
    $('t-pct').textContent = tp + '%';
    $('bar-h').style.width = hp + '%';
    $('bar-t').style.width = tp + '%';
  }

  function renderHistory() {
    if (state.flips.length === 0) {
      histEl.innerHTML = '<li class="empty">No flips yet</li>';
      return;
    }
    var max = 40;
    var row = function (f, i) {
      var lbl = sideLabel(f.side);
      var cls = f.side === 0 ? 'h' : 't';
      return '<li' + (i === 0 && state.fresh ? ' class="fresh"' : '') + '><span class="chip ' + cls + '">' + lbl + '</span><span class="time">#' + (state.flips.length - i) + '</span></li>';
    };
    var rows = state.flips.slice(0, max).map(row).join('');
    var more = state.flips.length > max ? '<li class="more">+' + (state.flips.length - max) + ' older</li>' : '';
    histEl.innerHTML = rows + more;
  }

  function renderCount() { $('count-label').textContent = state.count; }

  function resetCoin() {
    coin.classList.remove('landed');
    coin.style.transform = 'rotateX(0deg)';
    coin.style.filter = '';
    lift.style.transform = 'translate3d(0,0,0)';
    shadow.style.transform = 'scale(1,1)';
    shadow.style.opacity = '1';
    verdict.classList.remove('reveal');
    verdict.textContent = 'Tap the coin to begin';
  }

  /* ---------- Toss animation ----------------------------------------------
     A real toss: parabolic rise and fall, two decaying bounces, a fast spin
     that eases into the landing face, a shadow that shrinks with altitude,
     speed-based motion blur and impact rings on touchdown.
     Driven by rAF rather than CSS transitions, because a CSS transition on
     transform cannot interpolate var(--rot) reliably across browsers.
  ------------------------------------------------------------------------- */
  function popRing(scale) {
    if (!ring) return;
    ring.classList.remove('go');
    void ring.offsetWidth;
    ring.style.setProperty('--rs', scale);
    ring.classList.add('go');
  }

  function bumpEl(id) {
    var el = $(id);
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  function playToss(result, rounds, done) {
    var flight = 0.58, bounce1 = 0.19, bounce2 = 0.13;
    var dur = 1520;
    var hMax = Math.max(64, Math.round((lift.offsetWidth || 150) * 0.64));
    var turns = 4 + Math.floor(Math.random() * 3) + Math.min(rounds - 1, 4);
    var total = turns * 360 + (result === 1 ? 180 : 0);
    var spinEnd = flight + bounce1 * 0.5;

    if (reduceMotion) {
      lift.style.transform = 'translate3d(0,0,0)';
      coin.style.transform = 'rotateX(' + (result === 1 ? 180 : 0) + 'deg)';
      done();
      return;
    }

    lift.classList.remove('idle');
    var t0 = performance.now();
    var prevAngle = 0, blurLevel = -1, hit1 = false, hit2 = false;

    function frame(now) {
      var t = Math.min(1, (now - t0) / dur);
      var h;
      if (t < flight) {
        h = hMax * Math.sin(Math.PI * Math.pow(t / flight, 0.86));
      } else if (t < flight + bounce1) {
        h = hMax * 0.15 * Math.sin(Math.PI * (t - flight) / bounce1);
      } else if (t < flight + bounce1 + bounce2) {
        h = hMax * 0.05 * Math.sin(Math.PI * (t - flight - bounce1) / bounce2);
      } else {
        h = 0;
      }

      var sp = Math.min(1, t / spinEnd);
      var angle = total * (1 - Math.pow(1 - sp, 1.18));
      var yaw = 16 * Math.sin(t * Math.PI * 2.3) * (1 - t * 0.55);
      var tilt = 11 * Math.sin(t * Math.PI * 3.1) * (1 - t);

      lift.style.transform = 'translate3d(0,' + (-h).toFixed(2) + 'px,0)';
      coin.style.transform = 'rotateX(' + angle.toFixed(2) + 'deg) rotateY(' + yaw.toFixed(2) + 'deg) rotateZ(' + tilt.toFixed(2) + 'deg)';

      var hn = h / hMax;
      shadow.style.transform = 'scale(' + (1 - hn * 0.4).toFixed(3) + ',' + (1 - hn * 0.52).toFixed(3) + ')';
      shadow.style.opacity = (1 - hn * 0.6).toFixed(3);

      var d = Math.abs(angle - prevAngle);
      prevAngle = angle;
      var lv = d > 17 ? 2 : (d > 7 ? 1 : 0);
      if (lv !== blurLevel) {
        blurLevel = lv;
        coin.style.filter = lv ? 'blur(' + (lv * 0.45).toFixed(2) + 'px)' : '';
      }

      if (!hit1 && t >= flight) { hit1 = true; popRing(1); }
      if (!hit2 && t >= flight + bounce1) { hit2 = true; popRing(0.55); }

      if (t < 1) { requestAnimationFrame(frame); return; }

      coin.style.filter = '';
      lift.style.transform = 'translate3d(0,0,0)';
      shadow.style.transform = 'scale(1,1)';
      shadow.style.opacity = '1';
      coin.style.transform = 'rotateX(' + total + 'deg)';
      setTimeout(function () { lift.classList.add('idle'); }, 900);
      done();
    }
    requestAnimationFrame(frame);
  }

  function flipOnce() {
    var side = fairFlip();
    state.flips.unshift({ side: side, ts: Date.now() });
    if (state.flips.length > 1000) state.flips.length = 1000;
    persist();
    return side;
  }

  function doFlip() {
    if (state.flipping) return;
    setFlipping(true);
    var n = state.count;
    var sides = [];
    for (var i = 0; i < n; i++) sides.push(flipOnce());

    var last = sides[sides.length - 1];
    coin.classList.remove('landed');
    verdict.classList.remove('reveal');
    state.fresh = true;

    playToss(last, n, function () {
      coin.classList.add('landed');
      verdict.textContent = 'It\u2019s ' + sideLabel(last) + (n > 1 ? ' \u00b7 ' + headsCount(sides) + 'H / ' + tailsCount(sides) + 'T' : '') + ' \u2014 generated fairly, every time.';
      verdict.classList.add('reveal');
      setFlipping(false);
      renderStats();
      renderHistory();
      bumpEl(last === 0 ? 'h-count' : 't-count');
      bumpEl('total');
      state.fresh = false;
    });
  }

  function headsCount(a) { return a.filter(function (s) { return s === 0; }).length; }
  function tailsCount(a) { return a.filter(function (s) { return s === 1; }).length; }

  function setFlipping(on) {
    state.flipping = on;
    $('flip-btn').disabled = on;
  }

  load();

  function tossingText() {
    return state.count > 1 ? 'Tossing ' + state.count + ' coins\u2026' : 'Tossing\u2026';
  }
  function userFlip() {
    if (state.flipping) return;
    verdict.classList.remove('reveal');
    verdict.textContent = tossingText();
    doFlip();
  }

  $('flip-btn').addEventListener('click', userFlip);
  if (wrap) {
    wrap.addEventListener('click', userFlip);
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); userFlip(); }
    });
  }

  document.querySelectorAll('.count button').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = parseInt(b.getAttribute('data-step'), 10);
      state.count = Math.min(100, Math.max(1, state.count + d));
      renderCount(); persist();
    });
  });

  $('clear-btn').addEventListener('click', function () {
    state.flips = [];
    state.fresh = false;
    persist(); resetCoin(); renderStats(); renderHistory();
  });

  // Theme toggle
  var themeBtn = $('theme-toggle');
  var savedTheme = (function () { try { return localStorage.getItem('theme'); } catch (e) { return null; } })();
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  themeBtn.addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    try { localStorage.setItem('theme', cur); } catch (e) {}
  });


  // Mobile menu
  var navMenu = $('nav-menu');
  var yr = $('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  renderCount(); renderStats(); renderHistory();
})();
/* nav variant: drawer-kebab */
(function(){var b=document.getElementById('ts-kebab'),d=document.getElementById('ts-drawer'),v=document.getElementById('ts-veil');if(!b||!d)return;function setOpen(o){d.classList[o?'add':'remove']('ts-on');if(v)v.hidden=!o;d.setAttribute('aria-hidden',String(!o));b.setAttribute('aria-expanded',String(o));}b.addEventListener('click',function(e){e.stopPropagation();setOpen(!d.classList.contains('ts-on'));});if(v)v.addEventListener('click',function(){setOpen(false);});d.addEventListener('click',function(e){if(e.target.closest('a'))setOpen(false);});document.addEventListener('keydown',function(e){if(e.key==='Escape')setOpen(false);});document.addEventListener('click',function(e){if(d.classList.contains('ts-on')&&!d.contains(e.target)&&!b.contains(e.target))setOpen(false);});})();

/* nav variant: overlay-move */
(function(){var ids=['ts-drawer','ts-veil'];for(var i=0;i<ids.length;i++){var m=document.getElementById(ids[i]);if(m&&m.parentNode!==document.body)document.body.appendChild(m);}})();

/* nav variant: overlay-unify-close */
(function(){var p=document.getElementById('ts-drawer');if(!p)return;if(p.parentNode!==document.body)document.body.appendChild(p);p.addEventListener('click',function(e){if(e.target===p)p.classList.remove('ts-on');});})();