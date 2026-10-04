/*
© 2026 Lorena Poza y Ricardo Arranz. Todos los derechos reservados.
Obra protegida por la normativa de propiedad intelectual. Queda prohibida su copia,
modificación, distribución o comunicación pública, total o parcial, sin autorización
expresa y por escrito de sus autores.
*/
/* ============================================================
   clicApp · Motor: pantallas, flujo de niveles y utilidades
   Solo JS clásico (sin módulos, sin fetch) → funciona con file://
   ============================================================ */
(function () {
  'use strict';
  var CLIC = window.CLIC = window.CLIC || {};
  var A = CLIC.ART;
  var DBL_MS = 800;   // ventana del doble clic: más generosa que la del sistema
  var DBL_PX = 50;    // tolerancia de movimiento entre los dos clics

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDate(d) { return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + pad2(d.getFullYear() % 100); }

  /* ---------- Almacén temporal (sessionStorage con respaldo en memoria) ---------- */
  var mem = {};
  function sget(k) {
    try { var v = sessionStorage.getItem('clicapp.' + k); if (v !== null) return v; } catch (e) { /* sin acceso */ }
    return mem[k] === undefined ? null : mem[k];
  }
  function sset(k, v) {
    mem[k] = String(v);
    try { sessionStorage.setItem('clicapp.' + k, String(v)); } catch (e) { /* sin acceso */ }
  }
  function sdel(k) {
    delete mem[k];
    try { sessionStorage.removeItem('clicapp.' + k); } catch (e) { /* sin acceso */ }
  }

  /* ---------- Sonido (apagado por defecto: 16 ordenadores en la misma aula) ---------- */
  var snd = { on: false, ac: null };
  function beep(kind) {
    if (!snd.on) return;
    try {
      if (!snd.ac) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        snd.ac = new AC();
      }
      var c = snd.ac;
      var seq = kind === 'win' ? [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36]] :
        kind === 'pop' ? [[760, 0], [990, 0.07]] : [[330, 0]];
      seq.forEach(function (s) {
        var o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + s[1];
        o.type = 'sine'; o.frequency.value = s[0];
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
        o.connect(g); g.connect(c.destination);
        o.start(t0); o.stop(t0 + 0.24);
      });
    } catch (e) { /* sin audio: no pasa nada */ }
  }

  /* ---------- Efectos ---------- */
  function burst(node, txt) {
    var stage = $('#stage'), s = stage.getBoundingClientRect(), r = node.getBoundingClientRect();
    var d = document.createElement('div');
    d.className = 'pop';
    d.textContent = txt || '✨';
    d.style.left = (r.left - s.left + r.width / 2) + 'px';
    d.style.top = (r.top - s.top + r.height / 2) + 'px';
    stage.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 950);
  }
  var confettiTimer = 0;
  function confetti(n) {
    var box = $('#confetti'), cols = ['#ff6f91', '#ffc533', '#43a047', '#2f9fe0', '#ff8f1f', '#9c5bd1'], i, s;
    for (i = 0; i < (n || 46); i++) {
      s = document.createElement('span');
      s.className = 'cf';
      s.style.left = (Math.random() * 100) + '%';
      s.style.background = cols[i % cols.length];
      s.style.animationDuration = (2.4 + Math.random() * 2) + 's';
      s.style.animationDelay = (Math.random() * 0.8) + 's';
      s.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      box.appendChild(s);
    }
    clearTimeout(confettiTimer);
    confettiTimer = setTimeout(function () { box.innerHTML = ''; }, 5200);
  }

  /* ---------- Utilidades de juego ---------- */
  // Coloca un elemento centrado en (x%, y%) del padre, con ancho w (en unidades --u).
  function item(parent, html, x, y, w, cls) {
    var d = document.createElement('div');
    d.className = 'it ' + (cls || '');
    d.style.left = x + '%';
    d.style.top = y + '%';
    d.style.setProperty('--w', w);
    d.innerHTML = '<div class="ob">' + html + '</div>';
    parent.appendChild(d);
    return d;
  }

  // Doble clic propio, más tolerante que el del sistema operativo.
  function dbl(ctx, node, o) {
    var last = 0, lx = 0, ly = 0, tid = 0;
    ctx.on(node, 'click', function (e) {
      var t = Date.now();
      if (last && t - last <= DBL_MS && Math.abs(e.clientX - lx) <= DBL_PX && Math.abs(e.clientY - ly) <= DBL_PX) {
        last = 0; clearTimeout(tid);
        if (o.double) o.double(e);
      } else {
        last = t; lx = e.clientX; ly = e.clientY;
        clearTimeout(tid);
        if (o.first) o.first(e);
        tid = ctx.timeout(function () { last = 0; if (o.expired) o.expired(); }, DBL_MS + 60);
      }
    });
  }

  // Arrastrar y soltar con el puntero. o: { handle, zones(), onDrop(zona,ev), onFail(zona,movido), onStart() }
  // onDrop puede devolver 'keep' para dejar el elemento donde se soltó; si no, vuelve a su sitio.
  function dragify(ctx, node, o) {
    var handle = o.handle || node;
    node._dx = 0; node._dy = 0;
    function setPos(x, y) {
      node.style.setProperty('--dx', x + 'px');
      node.style.setProperty('--dy', y + 'px');
      node._dx = x; node._dy = y;
    }
    function zoneAt(ev) {
      var zs = o.zones ? o.zones() : [], best = null, bd = 1e9, pad = o.pad === undefined ? 26 : o.pad;
      var nr = node.getBoundingClientRect(), cx = nr.left + nr.width / 2, cy = nr.top + nr.height / 2;
      zs.forEach(function (z) {
        var r = z.getBoundingClientRect();
        var l = r.left - pad, rt = r.right + pad, t = r.top - pad, b = r.bottom + pad;
        var inP = ev.clientX >= l && ev.clientX <= rt && ev.clientY >= t && ev.clientY <= b;
        var inC = cx >= l && cx <= rt && cy >= t && cy <= b;
        if (inP || inC) {
          var d = Math.abs(ev.clientX - (r.left + r.width / 2)) + Math.abs(ev.clientY - (r.top + r.height / 2));
          if (d < bd) { bd = d; best = z; }
        }
      });
      return best;
    }
    ctx.on(handle, 'pointerdown', function (e) {
      if (e.button !== 0 || node._lock) return;
      e.preventDefault();
      try { handle.setPointerCapture(e.pointerId); } catch (err) { /* ignorar */ }
      var sx = e.clientX, sy = e.clientY, ox = node._dx, oy = node._dy, moved = false, over = null;
      node.classList.remove('snap');
      node.classList.add('dragging');
      if (o.onStart) o.onStart();
      function move(ev) {
        var dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 6) moved = true;
        setPos(ox + dx, oy + dy);
        var z = zoneAt(ev);
        if (z !== over) {
          if (over) over.classList.remove('over');
          over = z;
          if (over) over.classList.add('over');
        }
      }
      function up(ev) {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        handle.removeEventListener('pointercancel', up);
        node.classList.remove('dragging');
        if (over) over.classList.remove('over');
        var z = zoneAt(ev), res;
        if (z && moved) {
          res = o.onDrop ? o.onDrop(z, ev) : null;
        } else if (o.onFail) {
          o.onFail(null, moved);
        }
        if (res !== 'keep' && node.isConnected) {
          node.classList.add('snap');
          setPos(0, 0);
        }
      }
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
    });
    node.classList.add('grabbable');
    return { setPos: setPos };
  }

  // Menú contextual (clic derecho). items: [{icon,label,fn,disabled,tgt}]
  function menu(ctx, ev, items) {
    var stage = $('#stage');
    closeMenu();
    var m = document.createElement('div');
    m.className = 'cmenu';
    m.setAttribute('role', 'menu');
    items.forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mi' + (it.tgt ? ' tgt' : '');
      b.setAttribute('role', 'menuitem');
      if (it.disabled) b.setAttribute('aria-disabled', 'true');
      b.innerHTML = '<span class="mi-i">' + (it.icon || '') + '</span><span>' + esc(it.label) + '</span>';
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (it.disabled) { if (it.fn) it.fn(true); return; }
        closeMenu();
        if (it.fn) it.fn(false);
      });
      m.appendChild(b);
    });
    stage.appendChild(m);
    var r = stage.getBoundingClientRect();
    var x = ev.clientX - r.left, y = ev.clientY - r.top;
    x = Math.max(6, Math.min(x, r.width - m.offsetWidth - 6));
    y = Math.max(6, Math.min(y, r.height - m.offsetHeight - 6));
    m.style.left = x + 'px';
    m.style.top = y + 'px';
    function off(e) { if (!m.contains(e.target)) closeMenu(); }
    function key(e) { if (e.key === 'Escape') closeMenu(); }
    document.addEventListener('pointerdown', off, true);
    document.addEventListener('keydown', key);
    m._off = function () {
      document.removeEventListener('pointerdown', off, true);
      document.removeEventListener('keydown', key);
    };
    ctx.onDispose(closeMenu);
    return m;
  }
  function closeMenu() {
    $$('.cmenu').forEach(function (m) {
      if (m._off) m._off();
      if (m.parentNode) m.parentNode.removeChild(m);
    });
  }

  CLIC.h = { $: $, $$: $$, esc: esc, item: item, dbl: dbl, dragify: dragify, menu: menu, closeMenu: closeMenu,
    burst: burst, beep: beep, confetti: confetti };

  /* ============================================================
     Estado y flujo de la aplicación
     ============================================================ */
  var state = { name: '', level: 0, max: 0 };   // max = nivel más lejano alcanzado (los anteriores se pueden repetir)
  var current = null;        // contexto del nivel en marcha
  var stage, LEVELS, TOTAL;

  function show(name) {
    ['start', 'game', 'end'].forEach(function (n) { $('#screen-' + n).hidden = (n !== name); });
    document.body.setAttribute('data-screen', name);
    if (name !== 'end') { clearInterval(endTimer); $('#confetti').innerHTML = ''; }
  }

  function activeCtx() { return current && (current.subctx || current); }

  function makeCtx(level, opts) {
    opts = opts || {};
    var cleaners = [], dead = false, done = false, subctx = null;
    var ctx = {
      name: state.name, level: level, mini: !!opts.mini, opts: opts,
      get subctx() { return subctx; },
      on: function (t, type, fn, o) {
        t.addEventListener(type, fn, o || false);
        cleaners.push(function () { t.removeEventListener(type, fn, o || false); });
      },
      timeout: function (fn, ms) {
        var id = setTimeout(function () { if (!dead) fn(); }, ms);
        cleaners.push(function () { clearTimeout(id); });
        return id;
      },
      loop: function (fn) {
        var id, last = performance.now();
        function f(t) {
          if (dead) return;
          var dt = Math.min(0.05, (t - last) / 1000);
          last = t;
          fn(dt);
          id = requestAnimationFrame(f);
        }
        id = requestAnimationFrame(f);
        cleaners.push(function () { cancelAnimationFrame(id); });
      },
      onDispose: function (fn) { cleaners.push(fn); },
      hint: function (msg, kind) {
        var f = $('#feedback');
        f.className = 'feedback' + (kind ? ' ' + kind : '');
        f.textContent = msg;
        void f.offsetWidth;                      // reinicia la animación
        f.classList.add('pulse');
        if (kind === 'ok') beep('pop');
      },
      count: function (n, total, label) {
        var c = $('#counter');
        c.hidden = false;
        c.innerHTML = (opts.prefix ? '<small>' + opts.prefix + '</small>' : '') +
          '<span>' + esc(label || 'Llevas') + '</span> <b>' + n + '</b> de <b>' + total + '</b>';
      },
      win: function () {
        if (done || dead) return;
        done = true;
        if (opts.onWin) { opts.onWin(); return; }
        stage.classList.add('celebrate');
        beep('win');
        ctx.timeout(function () { openWin(ctx); }, 900);
      },
      sub: function (L, onWin) {
        if (subctx) subctx.dispose();
        stage.innerHTML = '';
        applyBg(L.bg);
        $('#counter').hidden = true;
        subctx = makeCtx(L, { mini: true, onWin: onWin, prefix: opts.subPrefix && opts.subPrefix() });
        L.setup(stage, subctx);
        sayLevel(L, subctx);
        return subctx;
      },
      dispose: function () {
        dead = true;
        if (subctx) { subctx.dispose(); subctx = null; }
        cleaners.forEach(function (f) { try { f(); } catch (e) { /* ignorar */ } });
        cleaners = [];
      }
    };
    return ctx;
  }

  function applyBg(bg) {
    bg = bg || 'dia';
    stage.className = 'stage bg-' + bg;
    stage.innerHTML = '';
    if (bg === 'dia') {
      stage.insertAdjacentHTML('afterbegin',
        '<div class="decor sun">' + A.sol() + '</div>' +
        '<div class="decor cloud c1">' + A.nube() + '</div><div class="decor cloud c2">' + A.nube() + '</div>' +
        '<div class="decor fence"></div>');
    } else if (bg === 'noche') {
      stage.insertAdjacentHTML('afterbegin', '<div class="decor moon">' + A.luna() + '</div><div class="decor stars"></div><div class="decor fence dark"></div>');
    }
  }

  function sayLevel(L, ctx) {
    var pre = ctx.opts.prefix ? '<div class="stepchip">' + esc(ctx.opts.prefix) + '</div>' : '';
    $('#bubble').innerHTML = pre + L.help(esc(state.name));
    $('#mouse-box').innerHTML = A.raton(L.mouse) +
      '<div class="mouse-cap">' + (L.mouse && L.mouse.cap ? L.mouse.cap : '') + '</div>';
    $('#feedback').className = 'feedback';
    $('#feedback').textContent = '';
  }

  function startLevel(i) {
    if (current) { current.dispose(); current = null; }
    state.level = i;
    if (i > state.max) state.max = i;
    sset('level', i); sset('max', state.max);
    var L = LEVELS[i];
    $('#modal-win').hidden = true;
    applyBg(L.bg);
    $('#lvl-num').textContent = 'Nivel ' + (i + 1) + ' de ' + TOTAL;
    $('#lvl-title').textContent = L.title;
    $$('.dot').forEach(function (d, k) {
      d.className = 'dot' + (k < i ? ' done' : k === i ? ' now' : '') + (k <= state.max ? ' open' : '');
      d.disabled = k > state.max || k === i;
      d.title = k <= state.max ? (k === i ? 'Estás aquí' : 'Volver al nivel ' + (k + 1)) : 'Aún no has llegado';
      if (k === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
    $('#counter').hidden = true;
    $('#confetti').innerHTML = '';
    $('#sidebar').scrollTop = 0;
    current = makeCtx(L, {});
    L.setup(stage, current);
    if (!L.master) sayLevel(L, current);
  }

  var PRAISE = ['¡Muy bien', '¡Estupendo', '¡Genial', '¡Fantástico', '¡Lo has logrado', '¡Qué bien lo haces', '¡Excelente', '¡Magnífico'];
  function openWin(ctx) {
    var L = ctx.level, last = state.level >= TOTAL - 1;
    $('#win-title').innerHTML = esc(PRAISE[state.level % PRAISE.length]) + ', ' + esc(state.name) + '!';
    $('#win-text').innerHTML = 'Has aprendido a <b>' + L.learned + '</b>.<br>' +
      (last ? '¡Has superado todos los niveles!' : 'Pulsa el botón verde para ir al siguiente nivel.');
    $('#btn-next').innerHTML = last ? 'VER MI DIPLOMA <span aria-hidden="true">🎓</span>' : 'SIGUIENTE NIVEL <span aria-hidden="true">➜</span>';
    $('#modal-win').hidden = false;
    confetti(40);
    $('#btn-next').focus();
  }

  var endTimer = 0;
  function showEnd() {
    if (current) { current.dispose(); current = null; }
    sset('level', 0);
    $('#end-name').textContent = state.name;
    $('#dip-name').textContent = state.name;
    $('#dip-date').textContent = fmtDate(new Date());
    $('#end-count').textContent = TOTAL;
    show('end');
    confetti(70);
    endTimer = setInterval(function () { confetti(30); }, 3500);
  }

  function goHome() {
    if (current) { current.dispose(); current = null; }
    state.name = ''; state.level = 0; state.max = 0;
    sdel('name'); sdel('level'); sdel('max');
    $('#modal-win').hidden = true;
    $('#modal-exit').hidden = true;
    $('#btn-continue').hidden = true;
    $('#in-name').value = '';
    $('#name-error').hidden = true;
    show('start');
    $('#in-name').focus();
  }

  function titleCase(s) {
    return s.replace(/(^|\s)(\S)/g, function (m, a, b) { return a + b.toUpperCase(); });
  }

  function hashLevel() {
    var m = /nivel=(\d+)/i.exec(location.hash || '');
    var n = m ? parseInt(m[1], 10) - 1 : 0;
    return (n >= 0 && n < TOTAL) ? n : 0;
  }

  /* ---------- Cursor grande (accesibilidad) ---------- */
  function arrowCursor(fill) {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><path d="M5 3 L5 33 L13 25 L19 39 L25 36.5 L19 23 L30 23 Z" fill="' + fill +
      '" stroke="#111" stroke-width="3" stroke-linejoin="round"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(s) + '") 5 3, default';
  }
  function setBigCursor(on) {
    var r = document.documentElement.style;
    if (on) {
      r.setProperty('--cur-default', arrowCursor('#ffffff'));
      r.setProperty('--cur-pointer', arrowCursor('#ffd23f'));
      r.setProperty('--cur-grab', arrowCursor('#ff9f43'));
    } else {
      r.removeProperty('--cur-default'); r.removeProperty('--cur-pointer'); r.removeProperty('--cur-grab');
    }
    sset('bigcursor', on ? '1' : '0');
    var b = $('#btn-cursor');
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.querySelector('.st').textContent = on ? 'Grande' : 'Normal';
  }

  function pista() {
    var c = activeCtx();
    if (!c) return;
    $$('.tgt', stage).forEach(function (n) { n.classList.add('pista'); });
    setTimeout(function () { $$('.pista', stage).forEach(function (n) { n.classList.remove('pista'); }); }, 3200);
    c.hint(c.level.tip || 'Lee con calma lo que dice Rosi y prueba otra vez. ¡Sin prisa!', 'tip');
  }

  /* ---------- Arranque ---------- */
  function init() {
    stage = $('#stage');
    LEVELS = CLIC.LEVELS;
    TOTAL = LEVELS.length;

    // pie de página con fecha DD/MM/YY actualizada
    $$('.js-fecha').forEach(function (n) { n.textContent = fmtDate(new Date()); });
    $('#mascot-start').innerHTML = A.regadera(true);
    $('#mascot-help').innerHTML = A.regadera(true);
    $('#mascot-win').innerHTML = A.regadera(true);
    $('#mascot-end').innerHTML = A.regadera(true);
    var dots = '', k;
    for (k = 0; k < TOTAL; k++) dots += '<button type="button" class="dot" aria-label="Ir al nivel ' + (k + 1) + '"><i></i></button>';
    $('#dots').innerHTML = dots;
    $('#dots').addEventListener('click', function (e) {
      var d = e.target.closest ? e.target.closest('.dot') : null;
      if (!d || d.disabled || !$('#modal-win').hidden) return;
      startLevel($$('.dot').indexOf(d));
    });
    $('#fx-start').innerHTML =
      '<div class="decor sun">' + A.sol() + '</div><div class="decor cloud c1">' + A.nube() + '</div><div class="decor cloud c2">' + A.nube() + '</div>';
    $('#veg-row').innerHTML =
      '<span>' + A.maceta(3) + '</span><span>' + A.maceta(4) + '</span><span>' + A.maceta(2) + '</span><span>' + A.maceta(3) + '</span>';

    // formulario de inicio
    var inp = $('#in-name');
    $('#form-start').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = inp.value.replace(/\s+/g, ' ').trim();
      if (!v) {
        $('#name-error').hidden = false;
        inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake');
        inp.focus();
        return;
      }
      state.name = titleCase(v).slice(0, 20);
      sset('name', state.name);
      state.max = 0;
      show('game');
      startLevel(hashLevel());
    });
    inp.addEventListener('input', function () { $('#name-error').hidden = true; });

    // continuar tras recargar la página (misma pestaña)
    var savedName = sget('name'), savedLvl = parseInt(sget('level') || '0', 10);
    if (savedName) inp.value = savedName;
    if (savedName && savedLvl > 0 && savedLvl < TOTAL) {
      $('#btn-continue').hidden = false;
      $('#btn-continue').querySelector('b').textContent = savedLvl + 1;
      $('#btn-continue').addEventListener('click', function () {
        state.name = savedName; state.max = Math.max(savedLvl, parseInt(sget('max') || '0', 10)); show('game'); startLevel(savedLvl);
      });
    }

    $('#btn-next').addEventListener('click', function () {
      $('#modal-win').hidden = true;
      if (state.level >= TOTAL - 1) showEnd(); else startLevel(state.level + 1);
    });
    $('#btn-home').addEventListener('click', function () { $('#modal-exit').hidden = false; $('#btn-stay').focus(); });
    $('#btn-stay').addEventListener('click', function () { $('#modal-exit').hidden = true; });
    $('#btn-leave').addEventListener('click', goHome);
    $('#btn-restart').addEventListener('click', goHome);
    $('#btn-print').addEventListener('click', function () { window.print(); });
    $('#btn-pista').addEventListener('click', pista);
    $('#btn-sound').addEventListener('click', function () {
      snd.on = !snd.on;
      this.setAttribute('aria-pressed', snd.on ? 'true' : 'false');
      this.querySelector('.st').textContent = snd.on ? 'Sí' : 'No';
      if (snd.on) beep('pop');
    });
    $('#btn-cursor').addEventListener('click', function () { setBigCursor(sget('bigcursor') === '0'); });
    setBigCursor(sget('bigcursor') !== '0');

    // El clic derecho solo se permite en los niveles que lo enseñan.
    document.addEventListener('contextmenu', function (e) {
      if (e.target.closest && e.target.closest('input,textarea')) return;
      e.preventDefault();
      var c = activeCtx();
      if (document.body.getAttribute('data-screen') === 'game' && c && !c.level.right) {
        c.hint('Ahora usamos el botón IZQUIERDO del ratón. El derecho lo aprenderemos más adelante.', 'try');
      }
    });
    document.addEventListener('dragstart', function (e) { e.preventDefault(); });

    show('start');
    inp.focus();
  }

  CLIC.start = init;
})();
