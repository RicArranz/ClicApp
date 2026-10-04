/*
© 2026 Lorena Poza y Ricardo Arranz. Todos los derechos reservados.
Obra protegida por la normativa de propiedad intelectual. Queda prohibida su copia,
modificación, distribución o comunicación pública, total o parcial, sin autorización
expresa y por escrito de sus autores.
*/
/* ============================================================
   clicApp · Definición de los 20 niveles
   Para añadir uno: copia un bloque L.push({...}) y ajusta id/título/setup.
   El nivel maestro (último) reutiliza niveles por su id.
   ============================================================ */
(function () {
  'use strict';
  var CLIC = window.CLIC, A = CLIC.ART, H = CLIC.h;
  var item = H.item, dragify = H.dragify, dbl = H.dbl, menu = H.menu, burst = H.burst, beep = H.beep, $$ = H.$$;
  var L = [];

  function ob(it) { return it.querySelector('.ob'); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  // Aviso amable cuando se pulsa en un sitio vacío.
  function missHint(ctx, stage, msg) {
    ctx.on(stage, 'click', function (e) {
      if (!e.target.closest('.it') && !e.target.closest('.cmenu')) ctx.hint(msg, 'try');
    });
  }
  function dropHelp(ctx, what) {
    return function (z, moved) {
      ctx.hint(moved ? 'Casi… suéltalo justo encima de ' + what + '.' :
        'Para arrastrar: pulsa y MANTÉN el botón izquierdo sobre el objeto, mueve el ratón y suelta.', 'try');
    };
  }

  /* ============ 1-3 · Mover el cursor y clic simple ============ */

  L.push({
    title: 'Despierta los farolillos', learned: 'mover la flecha por la pantalla', bg: 'noche',
    mouse: { move: true, cap: 'Solo hay que mover el ratón. No pulses nada.' },
    tip: 'Mueve el ratón despacito: la flecha se mueve igual que tu mano. Pásala por encima de un farolillo.',
    help: function (n) {
      return '¡Hola, <b>' + n + '</b>! Soy <b>Rosi</b>, la regadera. Ha anochecido y los farolillos del huerto están apagados.<br>' +
        'Mueve el <b>ratón</b> sobre la mesa: la <b>flechita</b> se mueve por la pantalla. Pásala por encima de cada farolillo para encenderlo.' +
        '<br><i>No hace falta pulsar nada.</i>';
    },
    setup: function (stage, ctx) {
      var pos = [[12, 32], [32, 16], [52, 36], [76, 18], [90, 40], [22, 70], [50, 74], [78, 68]], lit = 0;
      pos.forEach(function (p) {
        var it = item(stage, A.farolillo(), p[0], p[1], 9, 'lamp tgt');
        ctx.on(it, 'pointerenter', function () {
          if (it.classList.contains('on')) return;
          it.classList.add('on'); it.classList.remove('tgt');
          lit++; beep('pop');
          ctx.count(lit, pos.length, 'Encendidos');
          if (lit === pos.length) ctx.win();
        });
      });
      ctx.count(0, pos.length, 'Encendidos');
    }
  });

  L.push({
    id: 2, title: 'Siembra las semillas', learned: 'hacer clic con el botón izquierdo', mouse: { l: true, cap: 'Botón izquierdo: UNA vez' },
    tip: 'Pon la flecha encima de un montón de tierra y pulsa UNA vez el botón izquierdo (el de la izquierda).',
    help: function (n) {
      return 'Muy bien, <b>' + n + '</b>. Ahora vamos a <b>hacer clic</b>: pon la flecha encima de un montón de tierra y pulsa ' +
        '<b>una sola vez</b> el botón <b>izquierdo</b> del ratón (y suéltalo). ¡Así sembraremos cada semilla!';
    },
    setup: function (stage, ctx) {
      var pos = [[16, 52], [38, 74], [60, 50], [82, 72], [48, 34]].slice(0, ctx.mini ? 3 : 5), got = 0, N = pos.length;
      pos.forEach(function (p) {
        var it = item(stage, A.monton(false), p[0], p[1], 12, 'tgt clickable');
        ctx.on(it, 'click', function () {
          if (it.classList.contains('done')) return;
          it.classList.add('done'); it.classList.remove('tgt', 'clickable');
          ob(it).innerHTML = A.monton(true);
          burst(it, '🌱'); got++;
          ctx.count(got, N, 'Sembradas');
          if (got === N) ctx.win(); else ctx.hint('¡Muy bien! Esa semilla ya está sembrada.', 'ok');
        });
      });
      missHint(ctx, stage, 'Casi… pon la flecha ENCIMA de un montón de tierra y pulsa una vez.');
      ctx.count(0, N, 'Sembradas');
    }
  });

  L.push({
    title: 'Atrapa las mariquitas', learned: 'hacer clic sobre cosas que se mueven', mouse: { l: true, cap: 'Botón izquierdo: UNA vez' },
    tip: 'Si pones la flecha sobre una mariquita, se queda casi quieta. ¡Entonces haz clic!',
    help: function (n) {
      return '¡Cuidado, <b>' + n + '</b>! Las mariquitas pasean por el huerto y hay que <b>hacer clic</b> sobre ellas para atraparlas. ' +
        'Si pones la flecha encima, <b>se paran un momento</b>. Sigue a la mariquita con la flecha y pulsa <b>una vez</b> el botón izquierdo.';
    },
    setup: function (stage, ctx) {
      var N = ctx.mini ? 3 : 5, got = 0, bugs = [], i;
      function spawn() {
        var it = item(stage, A.mariquita(), 0, 0, 9, 'bug tgt clickable');
        var W = stage.clientWidth, Hh = stage.clientHeight;
        var b = { it: it, svg: it.querySelector('svg'), x: rnd(W * 0.12, W * 0.88), y: rnd(Hh * 0.5, Hh * 0.88),
          a: rnd(0, 6.28), v: rnd(38, 62), hover: false, done: false };
        ctx.on(it, 'pointerenter', function () { b.hover = true; });
        ctx.on(it, 'pointerleave', function () { b.hover = false; });
        ctx.on(it, 'click', function () {
          if (b.done) return;
          b.done = true; got++;
          it.classList.add('caught'); it.classList.remove('tgt');
          burst(it, '⭐'); beep('pop');
          ctx.count(got, N, 'Atrapadas');
          ctx.timeout(function () { it.remove(); }, 550);
          if (got === N) ctx.win();
        });
        bugs.push(b);
      }
      for (i = 0; i < N; i++) spawn();
      ctx.loop(function (dt) {
        var W = stage.clientWidth, Hh = stage.clientHeight, m = 56, top = Hh * 0.4;
        bugs.forEach(function (b) {
          if (b.done) return;
          var s = b.hover ? 0.05 : 1;
          b.a += (Math.random() - 0.5) * dt * 2;
          b.x += Math.cos(b.a) * b.v * dt * s;
          b.y += Math.sin(b.a) * b.v * dt * s;
          if (b.x < m) { b.x = m; b.a = Math.PI - b.a; }
          if (b.x > W - m) { b.x = W - m; b.a = Math.PI - b.a; }
          if (b.y < top) { b.y = top; b.a = -b.a; }
          if (b.y > Hh - m) { b.y = Hh - m; b.a = -b.a; }
          b.it.style.setProperty('--dx', b.x + 'px');
          b.it.style.setProperty('--dy', b.y + 'px');
          b.svg.style.transform = 'rotate(' + (b.a * 57.3 + 90) + 'deg)';
        });
      });
      ctx.count(0, N, 'Atrapadas');
    }
  });

  /* ============ 4-6 · Doble clic ============ */

  L.push({
    id: 4, title: 'El cofre del tesoro', learned: 'hacer doble clic', mouse: { l: true, twice: true, cap: 'Botón izquierdo: DOS veces seguidas' },
    tip: 'Pulsa el botón izquierdo dos veces seguidas, rápido, y sin mover el ratón entre un clic y otro.',
    help: function (n) {
      return '¡Mira, <b>' + n + '</b>! ¡Un cofre cerrado! Para abrirlo hay que hacer <b>doble clic</b>: ' +
        'pulsa el botón izquierdo <b>dos veces seguidas, rápido</b> (“clic-clic”) y <b>sin mover el ratón</b>.';
    },
    setup: function (stage, ctx) {
      var pos = ctx.mini ? [[50, 62]] : [[30, 62], [70, 62]], got = 0, N = pos.length;
      pos.forEach(function (p, i) {
        var it = item(stage, A.cofre(false), p[0], p[1], 20, 'tgt clickable chest'), open = false;
        dbl(ctx, it, {
          first: function () { if (!open) { it.classList.add('armed'); ctx.hint('Un clic… ¡ahora otro más, rápido!', ''); } },
          expired: function () {
            it.classList.remove('armed');
            if (!open) ctx.hint('Eso ha sido un solo clic. Para abrir hacen falta DOS clics muy seguidos.', 'try');
          },
          double: function () {
            if (open) return;
            open = true;
            it.classList.remove('armed', 'tgt');
            ob(it).innerHTML = A.cofre(true);
            burst(it, i ? '🌻' : '🍅'); got++;
            ctx.count(got, N, 'Abiertos');
            if (got === N) ctx.win(); else ctx.hint('¡Abierto! Ahora el otro cofre.', 'ok');
          }
        });
      });
      ctx.count(0, N, 'Abiertos');
    }
  });

  L.push({
    title: 'Cosecha de zanahorias', learned: 'abrir cosas con doble clic', mouse: { l: true, twice: true, cap: 'Botón izquierdo: DOS veces seguidas' },
    tip: 'Haz doble clic: dos pulsaciones rápidas seguidas con el botón izquierdo, sin mover el ratón.',
    help: function (n) {
      return '¡Hora de cosechar, <b>' + n + '</b>! Las zanahorias están enterradas. Un clic no basta: haz <b>doble clic</b> ' +
        '(dos pulsaciones <b>muy seguidas</b>) sobre cada una para arrancarla.';
    },
    setup: function (stage, ctx) {
      var pos = [[16, 62], [34, 80], [52, 60], [70, 80], [86, 62]].slice(0, ctx.mini ? 3 : 5), got = 0, N = pos.length;
      pos.forEach(function (p) {
        var it = item(stage, A.zanahoriaAsoma(), p[0], p[1], 11, 'tgt clickable carrot'), out = false;
        dbl(ctx, it, {
          first: function () {
            if (out) return;
            it.classList.remove('wiggle'); void it.offsetWidth; it.classList.add('wiggle');
          },
          expired: function () { if (!out) ctx.hint('La zanahoria se mueve pero no sale. ¡Necesita DOS clics seguidos!', 'try'); },
          double: function () {
            if (out) return;
            out = true; it.classList.remove('tgt', 'clickable'); it.classList.add('pulled');
            burst(it, '🥕'); got++;
            ctx.count(got, N, 'Cosechadas');
            ctx.timeout(function () { it.remove(); }, 650);
            if (got === N) ctx.win();
          }
        });
      });
      ctx.count(0, N, 'Cosechadas');
    }
  });

  L.push({
    title: 'El escritorio del huerto', learned: 'abrir una carpeta y cerrar su ventana', bg: 'escritorio', right: false,
    mouse: { l: true, twice: true, cap: 'Abrir: doble clic · Cerrar: un clic' },
    tip: 'Haz doble clic sobre la carpeta «Semillas». Cuando se abra, cierra la ventana con un clic en la X roja.',
    help: function (n) {
      return '¡Esto es como el escritorio de un ordenador, <b>' + n + '</b>! Con <b>un clic</b> una carpeta se queda <b>seleccionada</b> (en azul). ' +
        'Con <b>doble clic</b> se <b>abre</b>.<br><br>Abre la carpeta <b>«Semillas»</b> y después ciérrala con un clic en la <b>X roja</b>.';
    },
    setup: function (stage, ctx) {
      var names = ['Semillas', 'Herramientas', 'Fotos'], icons = [], win = null;
      function deselect() { icons.forEach(function (i) { i.classList.remove('sel'); }); }
      function closeWin() { if (win) { win.remove(); win = null; } }
      function openFolder(nm) {
        closeWin();
        var body = nm === 'Semillas' ?
          '<div class="packs">' + A.paquete('#e53935') + A.paquete('#ff8f1f') + A.paquete('#7b3f9e') + '</div>' +
          '<p>¡Has abierto la carpeta! Para cerrarla, haz <b>un clic</b> en la <b>X roja</b> de arriba a la derecha.</p>' :
          '<p>Esta carpeta está vacía. Cierra la ventana y abre la de <b>«Semillas»</b>.</p>';
        win = item(stage, '<div class="wtitle"><span>📁 ' + nm + '</span><button type="button" class="wclose tgt" aria-label="Cerrar ventana">✕</button></div><div class="wbody">' + body + '</div>',
          62, 48, 36, 'win');
        win.querySelector('.wclose').addEventListener('click', function () {
          closeWin();
          if (nm === 'Semillas') ctx.win(); else ctx.hint('Esa carpeta estaba vacía. Ahora abre la de «Semillas».', 'try');
        });
        ctx.hint('¡Carpeta abierta! Ahora ciérrala con la X roja.', 'ok');
      }
      names.forEach(function (nm, i) {
        var it = item(stage, '<div class="icon">' + A.carpeta() + '<span class="lbl">' + nm + '</span></div>', 12, 20 + i * 30, 12,
          'clickable folder' + (i === 0 ? ' tgt' : ''));
        icons.push(it);
        dbl(ctx, it, {
          first: function () {
            deselect(); it.classList.add('sel');
            ctx.hint('Con un clic la carpeta se queda seleccionada (azul). Para abrirla: doble clic.', '');
          },
          double: function () { deselect(); it.classList.add('sel'); openFolder(nm); }
        });
      });
      ctx.on(stage, 'click', function (e) { if (!e.target.closest('.it')) deselect(); });
    }
  });

  /* ============ 7-10 · Clic y arrastrar ============ */

  L.push({
    title: 'Planta las semillas', learned: 'arrastrar y soltar con el ratón', mouse: { l: true, hold: true, cap: 'Mantén pulsado el izquierdo mientras mueves' },
    tip: 'Pulsa sobre la semilla, NO sueltes el botón, mueve el ratón hasta una maceta y entonces suelta.',
    help: function (n) {
      return '¡Vamos a <b>arrastrar</b>, <b>' + n + '</b>! Pon la flecha sobre una semilla, <b>pulsa y mantén pulsado</b> el botón izquierdo, ' +
        '<b>mueve el ratón</b> hasta una maceta y ahí <b>suelta</b> el botón. ¡Es como llevar algo en la mano!';
    },
    setup: function (stage, ctx) {
      var pots = [], got = 0;
      [[20, 36], [50, 36], [80, 36]].forEach(function (p) {
        pots.push(item(stage, A.maceta(0), p[0], p[1], 15, 'zone pot tgt'));
      });
      [[28, 84], [50, 86], [72, 84]].forEach(function (p) {
        var s = item(stage, A.semilla(), p[0], p[1], 8, 'seed tgt');
        dragify(ctx, s, {
          zones: function () { return pots.filter(function (z) { return !z._full; }); },
          onDrop: function (z) {
            z._full = true; z.classList.remove('tgt');
            ob(z).innerHTML = A.maceta(1);
            burst(z, '🌱'); s.remove(); got++;
            ctx.count(got, 3, 'Plantadas');
            if (got === 3) ctx.win(); else ctx.hint('¡Perfecto! Sigue con la siguiente.', 'ok');
          },
          onFail: dropHelp(ctx, 'una maceta')
        });
      });
      ctx.count(0, 3, 'Plantadas');
    }
  });

  L.push({
    id: 8, title: 'Rosi tiene sed', learned: 'llevar objetos de un sitio a otro arrastrando', mouse: { l: true, hold: true, cap: 'Mantén pulsado el izquierdo mientras mueves' },
    tip: 'Arrastra primero a Rosi hasta el grifo. Cuando esté llena, arrástrala hasta la planta mustia.',
    help: function (n) {
      return '¡Ay, <b>' + n + '</b>, mi planta tiene sed! <b>Arrástrame</b> (pulsa sobre mí y mantén el botón) hasta el <b>grifo</b> para llenarme. ' +
        'Después <b>llévame a la planta</b> y suéltame encima para regarla.';
    },
    setup: function (stage, ctx) {
      var full = false;
      var tap = item(stage, A.grifo(), 15, 26, 14, 'zone tap tgt');
      var plant = item(stage, A.maceta(-1), 82, 60, 17, 'zone plantz');
      var can = item(stage, A.regadera(true), 46, 78, 17, 'can tgt');
      dragify(ctx, can, {
        zones: function () { return [tap, plant]; },
        onDrop: function (z) {
          if (z === tap) {
            if (full) { ctx.hint('Ya estoy llena. ¡Llévame a la planta!', 'try'); return; }
            full = true; can.classList.add('full'); tap.classList.remove('tgt'); plant.classList.add('tgt');
            burst(tap, '💧'); ctx.count(1, 2, 'Paso');
            ctx.hint('¡Glub, glub! Ya estoy llena. Ahora arrástrame hasta la planta.', 'ok');
          } else {
            if (!full) { ctx.hint('Estoy vacía. Primero llévame al grifo.', 'try'); return; }
            ob(plant).innerHTML = A.maceta(3);
            plant.classList.add('grew');
            burst(plant, '💦'); ctx.count(2, 2, 'Paso');
            ctx.win();
          }
        },
        onFail: dropHelp(ctx, 'el grifo o la planta')
      });
      ctx.count(0, 2, 'Paso');
    }
  });

  L.push({
    title: 'Cestas de la cosecha', learned: 'ordenar cosas arrastrándolas', mouse: { l: true, hold: true, cap: 'Mantén pulsado el izquierdo mientras mueves' },
    tip: 'Fíjate en el color: rojo → tomates, naranja → zanahorias, morado → berenjenas.',
    help: function (n) {
      return '¡Mucha cosecha, <b>' + n + '</b>! Arrastra cada verdura hasta su <b>cesta</b>: ' +
        'los <b>tomates</b> con los tomates, las <b>zanahorias</b> con las zanahorias y las <b>berenjenas</b> con las berenjenas.';
    },
    setup: function (stage, ctx) {
      var kinds = { tomate: A.tomate, zanahoria: A.zanahoria, berenjena: A.berenjena };
      var names = { tomate: 'tomates', zanahoria: 'zanahorias', berenjena: 'berenjenas' };
      var baskets = [], left = 6, got = 0;
      [['tomate', 20], ['zanahoria', 50], ['berenjena', 80]].forEach(function (b) {
        var z = item(stage, A.cesta() + '<div class="blabel">' + names[b[0]] + '</div>', b[1], 80, 19, 'zone basket');
        z.setAttribute('data-k', b[0]);
        baskets.push(z);
      });
      var order = ['tomate', 'berenjena', 'zanahoria', 'tomate', 'zanahoria', 'berenjena'];
      [[18, 20], [40, 34], [62, 18], [84, 32], [28, 48], [72, 50]].forEach(function (p, i) {
        var k = order[i], v = item(stage, kinds[k](), p[0], p[1], 9, 'veg tgt');
        dragify(ctx, v, {
          zones: function () { return baskets; },
          onDrop: function (z) {
            if (z.getAttribute('data-k') !== k) { ctx.hint('Ups, esa cesta es de ' + names[z.getAttribute('data-k')] + '. Prueba con otra.', 'try'); return; }
            v.remove(); burst(z, '✨'); got++;
            ctx.count(got, left, 'Guardadas');
            if (got === left) ctx.win(); else ctx.hint('¡Bien! Cada verdura en su cesta.', 'ok');
          },
          onFail: dropHelp(ctx, 'una cesta')
        });
      });
      ctx.count(0, left, 'Guardadas');
    }
  });

  L.push({
    title: 'Mueve la ventana', learned: 'mover ventanas y deslizadores arrastrando', mouse: { l: true, hold: true, cap: 'Mantén pulsado el izquierdo mientras mueves' },
    tip: 'Paso 1: arrastra la ventana cogiéndola por su barra azul de arriba. Paso 2: arrastra la bolita por la barra.',
    help: function (n) {
      return '¡Dos retos, <b>' + n + '</b>!<br><b>1.</b> Coge la ventana del invernadero por su <b>barra azul</b> (arriba) y arrástrala hasta el <b>recuadro de rayas</b>.<br>' +
        '<b>2.</b> Después arrastra la <b>bolita</b> de la barra para llenar el depósito hasta la <b>raya verde</b>.';
    },
    setup: function (stage, ctx) {
      var target = item(stage, '<div class="outline"><span>Colócala aquí</span></div>', 74, 28, 30, 'zone outl tgt');
      var w = item(stage,
        '<div class="wtitle"><span>🏡 Invernadero</span><span class="grip">⠿</span></div><div class="wbody"><div class="gh">' +
        A.maceta(2) + A.maceta(3) + A.maceta(4) + '</div></div>', 26, 56, 30, 'win movable');
      ctx.count(0, 2, 'Paso');
      dragify(ctx, w, {
        handle: w.querySelector('.wtitle'),
        zones: function () { return [target]; },
        pad: 40,
        onDrop: function (z) {
          var a = w.getBoundingClientRect(), b = z.getBoundingClientRect();
          w.classList.add('snap');
          w.style.setProperty('--dx', (w._dx + (b.left + b.width / 2) - (a.left + a.width / 2)) + 'px');
          w.style.setProperty('--dy', (w._dy + (b.top + b.height / 2) - (a.top + a.height / 2)) + 'px');
          w._lock = true; w.classList.add('placed'); z.classList.remove('tgt'); z.style.visibility = 'hidden';
          burst(w, '👍'); ctx.count(1, 2, 'Paso');
          ctx.hint('¡Muy bien! Ahora el depósito: arrastra la bolita de la barra.', 'ok');
          stepSlider();
          return 'keep';
        },
        onFail: dropHelp(ctx, 'el recuadro de rayas')
      });

      function stepSlider() {
        var tank = item(stage, A.deposito(), 18, 70, 11, 'tank');
        var box = item(stage, '<div class="sl"><div class="sl-bar"><div class="sl-band"></div><div class="sl-fill"></div></div><div class="sl-handle tgt">💧</div></div>', 56, 88, 50, 'sliderbox');
        var track = box.querySelector('.sl'), handle = box.querySelector('.sl-handle'), fill = box.querySelector('.sl-fill'), water = tank.querySelector('.water');
        var val = 0.04, finished = false;
        function setV(v) {
          val = Math.max(0, Math.min(1, v));
          handle.style.left = (val * 100) + '%';
          fill.style.width = (val * 100) + '%';
          water.setAttribute('height', val * 100);
          water.setAttribute('y', 115 - val * 100);
        }
        setV(val);
        function upd(e) { var r = track.getBoundingClientRect(); setV((e.clientX - r.left) / r.width); }
        ctx.on(track, 'pointerdown', function (e) {
          if (e.button !== 0 || finished) return;
          e.preventDefault();
          try { track.setPointerCapture(e.pointerId); } catch (err) { /* ignorar */ }
          handle.classList.add('drag'); upd(e);
          function mv(ev) { upd(ev); }
          function up() {
            track.removeEventListener('pointermove', mv);
            track.removeEventListener('pointerup', up);
            track.removeEventListener('pointercancel', up);
            handle.classList.remove('drag');
            if (val >= 0.68 && val <= 0.9) { finished = true; burst(tank, '💦'); ctx.count(2, 2, 'Paso'); ctx.win(); }
            else ctx.hint(val < 0.68 ? 'Un poco más a la derecha… sin soltar hasta la raya verde.' : 'Te has pasado. Un poco hacia la izquierda.', 'try');
          }
          track.addEventListener('pointermove', mv);
          track.addEventListener('pointerup', up);
          track.addEventListener('pointercancel', up);
        });
      }
    }
  });

  /* ============ 11-13 · Selección ============ */

  L.push({
    title: 'Elige las flores', learned: 'seleccionar varios elementos con un rectángulo', mouse: { l: true, hold: true, cap: 'Mantén pulsado el izquierdo y arrastra' },
    tip: 'Empieza en un hueco vacío arriba a la izquierda, mantén pulsado y estira el rectángulo hasta cubrir todas las flores.',
    help: function (n) {
      return '¡Vamos a <b>seleccionar</b>, <b>' + n + '</b>! Empieza en un <b>hueco vacío</b>, <b>pulsa y mantén</b> el botón izquierdo y ' +
        '<b>arrastra</b>: aparecerá un rectángulo. Cuando cubra <b>todas las flores</b> (¡pero no las piedras!), suelta el botón.';
    },
    setup: function (stage, ctx) {
      var flowers = [], rocks = [], cols = ['#ff6f91', '#ffb300', '#ab47bc', '#ff7043', '#5c9dff', '#ff6f91'];
      [[22, 34], [38, 30], [26, 52], [42, 50], [20, 70], [38, 72]].forEach(function (p, i) {
        flowers.push(item(stage, A.flor(cols[i]), p[0], p[1], 7.5, 'sel-it flowerit'));
      });
      [[68, 36], [82, 62], [64, 76]].forEach(function (p) { rocks.push(item(stage, A.piedra(), p[0], p[1], 8, 'sel-it rockit')); });
      var all = flowers.concat(rocks), band = null, sx = 0, sy = 0;
      function inter(a, b) { return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom); }
      function sync() {
        var br = band.getBoundingClientRect();
        all.forEach(function (n) { n.classList.toggle('sel', inter(n.getBoundingClientRect(), br)); });
      }
      ctx.count(0, flowers.length, 'Seleccionadas');
      ctx.on(stage, 'pointerdown', function (e) {
        if (e.button !== 0) return;
        if (e.target.closest('.it')) { ctx.hint('Empieza en un hueco VACÍO, donde no haya ninguna flor ni piedra.', 'try'); return; }
        e.preventDefault();
        all.forEach(function (n) { n.classList.remove('sel'); });
        var r = stage.getBoundingClientRect();
        sx = e.clientX - r.left; sy = e.clientY - r.top;
        band = document.createElement('div'); band.className = 'band';
        stage.appendChild(band);
        try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignorar */ }
        function mv(ev) {
          var x = ev.clientX - r.left, y = ev.clientY - r.top;
          band.style.left = Math.min(sx, x) + 'px'; band.style.top = Math.min(sy, y) + 'px';
          band.style.width = Math.abs(x - sx) + 'px'; band.style.height = Math.abs(y - sy) + 'px';
          sync();
          var n = flowers.filter(function (f) { return f.classList.contains('sel'); }).length;
          ctx.count(n, flowers.length, 'Seleccionadas');
        }
        function up() {
          stage.removeEventListener('pointermove', mv);
          stage.removeEventListener('pointerup', up);
          stage.removeEventListener('pointercancel', up);
          var nf = flowers.filter(function (f) { return f.classList.contains('sel'); }).length;
          var nr = rocks.filter(function (f) { return f.classList.contains('sel'); }).length;
          if (band) { band.remove(); band = null; }
          if (nf === flowers.length && nr === 0) { burst(flowers[2], '🌸'); ctx.win(); }
          else if (nr > 0) ctx.hint('Se ha colado una piedra. Prueba otra vez con un rectángulo solo sobre las flores.', 'try');
          else if (nf === 0) ctx.hint('No hay nada seleccionado. Mantén pulsado y estira el rectángulo sobre las flores.', 'try');
          else ctx.hint('Faltan flores por seleccionar. Haz el rectángulo más grande.', 'try');
        }
        stage.addEventListener('pointermove', mv);
        stage.addEventListener('pointerup', up);
        stage.addEventListener('pointercancel', up);
      });
    }
  });

  function normalizeWord(s) { return s.replace(/[.,;:!¡¿?\s]/g, '').toLowerCase(); }
  function noteHtml(inner) { return '<div class="paper"><div class="paper-tag">Nota del huerto</div>' + inner + '</div>'; }
  function selection() { var s = window.getSelection ? window.getSelection().toString() : ''; return s; }
  function clearSel() { var s = window.getSelection && window.getSelection(); if (s && s.removeAllRanges) s.removeAllRanges(); }

  L.push({
    id: 12, title: 'Palabras con doble clic', learned: 'seleccionar una palabra con doble clic', bg: 'papel',
    mouse: { l: true, twice: true, cap: 'Doble clic sobre una palabra' },
    tip: 'Haz doble clic justo encima de la palabra pedida. Si se pone amarilla, ¡está seleccionada!',
    help: function (n) {
      return 'Mira esta nota, <b>' + n + '</b>. Para <b>seleccionar una palabra</b> haz <b>doble clic</b> sobre ella: se pintará de <b>amarillo</b>. ' +
        '<br>Primero busca la palabra <b>«agua»</b>.';
    },
    setup: function (stage, ctx) {
      var words = ctx.mini ? ['agua'] : ['agua', 'sol', 'semillas'], idx = 0;
      var box = document.createElement('div');
      box.className = 'center';
      box.innerHTML = '<div class="want"></div>' + noteHtml('<p class="big">El huerto necesita <span class="w" data-w="agua">agua</span>, ' +
        '<span class="w" data-w="sol">sol</span> y buenas <span class="w" data-w="semillas">semillas</span> para dar tomates.</p>');
      stage.appendChild(box);
      var want = box.querySelector('.want');
      function upd() { want.innerHTML = 'Busca la palabra: <b>' + words[idx] + '</b>'; }
      upd(); ctx.count(0, words.length, 'Encontradas');
      ctx.on(document, 'mouseup', function () {
        ctx.timeout(function () {
          var s = normalizeWord(selection());
          if (!s) return;
          if (s === words[idx]) {
            var span = box.querySelector('[data-w="' + words[idx] + '"]');
            span.classList.add('ok'); clearSel(); burst(span, '✅');
            idx++; ctx.count(idx, words.length, 'Encontradas');
            if (idx >= words.length) ctx.win();
            else { upd(); ctx.hint('¡Bien! Ahora busca «' + words[idx] + '».', 'ok'); }
          } else {
            ctx.hint('Esa no es. Busca la palabra «' + words[idx] + '» y haz doble clic encima.', 'try');
          }
        }, 30);
      });
    }
  });

  L.push({
    title: 'Selecciona una frase', learned: 'seleccionar texto arrastrando', bg: 'papel',
    mouse: { l: true, hold: true, cap: 'Pulsa al principio y arrastra hasta el final' },
    tip: 'Pulsa justo antes de la primera letra, mantén y arrastra hasta el punto final. Truco: 3 clics seguidos seleccionan toda la línea.',
    help: function (n) {
      return 'Ahora <b>frases enteras</b>, <b>' + n + '</b>. Pon la flecha <b>antes de la primera letra</b>, <b>pulsa y mantén</b> el botón izquierdo y ' +
        '<b>arrastra</b> hasta el final de la frase. Se pintará de amarillo.<br><i>Truco: tres clics seguidos seleccionan toda la línea.</i>';
    },
    setup: function (stage, ctx) {
      var S = ['Riega las plantas por la mañana.', 'Las zanahorias crecen bajo la tierra.', 'Los tomates se ponen rojos con el sol.'];
      var asks = [1, 2], idx = 0;
      var box = document.createElement('div');
      box.className = 'center';
      box.innerHTML = '<div class="want"></div>' + noteHtml(S.map(function (s, i) { return '<p class="line" data-i="' + i + '">' + s + '</p>'; }).join(''));
      stage.appendChild(box);
      var want = box.querySelector('.want');
      var subj = ['las zanahorias', 'los tomates'];
      function upd() { want.innerHTML = 'Selecciona la frase de <b>' + subj[idx] + '</b>'; }
      upd(); ctx.count(0, asks.length, 'Frases');
      ctx.on(document, 'mouseup', function () {
        ctx.timeout(function () {
          var s = selection().replace(/\s+/g, ' ').trim();
          if (!s) return;
          var tgt = S[asks[idx]];
          var others = S.filter(function (x) { return x !== tgt; });
          if (s.indexOf(tgt) !== -1 && !others.some(function (o) { return s.indexOf(o) !== -1; })) {
            var p = box.querySelector('[data-i="' + asks[idx] + '"]');
            p.classList.add('ok'); clearSel(); burst(p, '✅');
            idx++; ctx.count(idx, asks.length, 'Frases');
            if (idx >= asks.length) ctx.win();
            else { upd(); ctx.hint('¡Muy bien! Ahora la otra frase.', 'ok'); }
          } else if (tgt.indexOf(s) !== -1) {
            ctx.hint('Falta un trozo. Empieza antes de la primera letra y termina después del punto.', 'try');
          } else {
            ctx.hint('Esa no es la frase. Busca la de ' + subj[idx] + ' y arrastra por ella.', 'try');
          }
        }, 30);
      });
    }
  });

  /* ============ 14-16 · Scroll ============ */

  function scroller(stage, kind, w, h) {
    var sc = document.createElement('div'), world = document.createElement('div');
    sc.className = 'scroller ' + kind;
    world.className = 'world';
    world.style.width = w ? w + 'px' : '100%';
    world.style.height = h ? h + 'px' : '100%';
    sc.appendChild(world); stage.appendChild(sc);
    return { sc: sc, world: world };
  }
  function pct(sc, axis) {
    var max = axis === 'y' ? sc.scrollHeight - sc.clientHeight : sc.scrollWidth - sc.clientWidth;
    return max > 0 ? Math.round((axis === 'y' ? sc.scrollTop : sc.scrollLeft) / max * 100) : 0;
  }

  L.push({
    id: 14, title: 'El jardín altísimo', learned: 'moverte hacia arriba y hacia abajo con la rueda', bg: 'plain',
    mouse: { w: true, cap: 'Gira la rueda del ratón' },
    tip: 'Pon la flecha sobre el jardín y gira la ruedecita del centro del ratón hacia ti. También puedes arrastrar la barra verde de la derecha.',
    help: function (n) {
      return '¡Qué jardín tan alto, <b>' + n + '</b>! No cabe todo en la pantalla. Para <b>bajar</b>, gira la <b>ruedecita</b> del medio del ratón <b>hacia ti</b>. ' +
        'También puedes <b>arrastrar la barra verde</b> de la derecha.<br>Baja hasta el fondo y haz clic en la <b>calabaza dorada</b>.';
    },
    setup: function (stage, ctx) {
      var f = ctx.mini ? 2.2 : 3.4, Hh = stage.clientHeight * f;
      var s = scroller(stage, 'v', 0, Hh), world = s.world, sc = s.sc;
      world.classList.add('w-vert');
      [[18, 6, 16], [70, 11, 14], [40, 20, 15]].forEach(function (p) { item(world, A.nube(), p[0], p[1] * 0.8, p[2], 'decor-it'); });
      [[12, 30], [82, 36], [20, 52], [76, 58], [14, 72], [84, 78]].forEach(function (p) { item(world, A.arbol(), p[0], p[1], 11, 'decor-it'); });
      [[48, 26], [58, 44], [40, 62], [56, 82]].forEach(function (p, i) { item(world, A.flor(['#ff6f91', '#ffb300', '#ab47bc', '#5c9dff'][i]), p[0], p[1], 5, 'decor-it'); });
      item(world, '<div class="sign">⬇ Sigue bajando</div>', 50, 12, 18, 'decor-it');
      item(world, '<div class="sign">⬇ ¡Ya queda menos!</div>', 50, 60, 20, 'decor-it');
      item(world, '<div class="sign">⬇ ¡Casi llegas!</div>', 50, 88, 18, 'decor-it');
      var pk = item(world, A.calabaza(), 70, 95, 12, 'tgt clickable gold');
      var hud = document.createElement('div'); hud.className = 'hud'; stage.appendChild(hud);
      var arrow = document.createElement('div'); arrow.className = 'scrollhint'; arrow.textContent = '⬇'; stage.appendChild(arrow);
      function upd() { hud.textContent = 'Has bajado un ' + pct(sc, 'y') + ' %'; if (sc.scrollTop > 30) arrow.style.display = 'none'; }
      upd(); ctx.on(sc, 'scroll', upd);
      ctx.on(pk, 'click', function () { burst(pk, '🎉'); ctx.win(); });
      missHint(ctx, stage, 'Todavía no está aquí. Gira la rueda hacia ti para seguir bajando.');
    }
  });

  L.push({
    title: 'El camino de las abejas', learned: 'moverte de lado a lado con la barra y la rueda', bg: 'plain',
    mouse: { w: true, cap: 'Mayús + rueda, o arrastra la barra de abajo' },
    tip: 'Arrastra la barra verde de abajo hacia la derecha. O mantén pulsada la tecla Mayús (flecha hacia arriba) y gira la rueda.',
    help: function (n) {
      return '¡El camino es larguísimo, <b>' + n + '</b>! Para ir hacia la <b>derecha</b>, <b>arrastra la barra verde</b> de abajo. ' +
        'O mantén pulsada la tecla <b>Mayús</b> (⇧) y gira la <b>rueda</b>.<br>Al final del camino está el <b>panal</b>: ¡haz clic en él!';
    },
    setup: function (stage, ctx) {
      var W = stage.clientWidth * 3.6;
      var s = scroller(stage, 'h', W, 0), world = s.world, sc = s.sc;
      world.classList.add('w-horz');
      var i;
      for (i = 0; i < 12; i++) item(world, A.arbol(), 5 + i * 8, 34 + (i % 2) * 6, 7, 'decor-it');
      for (i = 0; i < 18; i++) item(world, A.flor(['#ff6f91', '#ffb300', '#ab47bc', '#5c9dff', '#ff7043'][i % 5]), 3 + i * 5.4, 78 + (i % 3) * 5, 3.5, 'decor-it');
      [10, 36, 62, 86].forEach(function (x) { item(world, '<div class="sign">Panal ➜</div>', x, 62, 12, 'decor-it'); });
      item(world, A.abeja(), 91, 40, 6, 'decor-it bee');
      var pk = item(world, A.panal(), 96, 60, 11, 'tgt clickable gold');
      var hud = document.createElement('div'); hud.className = 'hud'; stage.appendChild(hud);
      var arrow = document.createElement('div'); arrow.className = 'scrollhint h'; arrow.textContent = '➜'; stage.appendChild(arrow);
      function upd() { hud.textContent = 'Has avanzado un ' + pct(sc, 'x') + ' %'; if (sc.scrollLeft > 30) arrow.style.display = 'none'; }
      upd(); ctx.on(sc, 'scroll', upd);
      ctx.on(pk, 'click', function () { burst(pk, '🍯'); ctx.win(); });
      missHint(ctx, stage, 'Todavía no está aquí. Sigue hacia la derecha con la barra de abajo.');
    }
  });

  L.push({
    title: 'El gran huerto', learned: 'explorar en todas las direcciones', bg: 'plain',
    mouse: { w: true, cap: 'Rueda, barras laterales o Mayús + rueda' },
    tip: 'Usa las dos barras verdes (derecha y abajo) o la rueda. Mira el mapa pequeño de arriba: ¡los puntos son los tesoros!',
    help: function (n) {
      return '¡Un huerto enorme, <b>' + n + '</b>! Hay tres tesoros escondidos en las esquinas: una <b>abeja</b> arriba a la derecha, ' +
        'una <b>calabaza dorada</b> abajo a la izquierda y una <b>mariquita</b> abajo a la derecha.<br>Usa la <b>rueda</b> y las <b>barras verdes</b> para explorar y haz clic en cada uno.';
    },
    setup: function (stage, ctx) {
      var W = stage.clientWidth * 2.5, Hh = stage.clientHeight * 2.6;
      var s = scroller(stage, 'both', W, Hh), world = s.world, sc = s.sc;
      world.classList.add('w-both');
      var i;
      for (i = 0; i < 16; i++) item(world, A.arbol(), rnd(6, 94), rnd(8, 90), 7, 'decor-it');
      for (i = 0; i < 22; i++) item(world, A.flor(['#ff6f91', '#ffb300', '#ab47bc', '#5c9dff', '#ff7043'][i % 5]), rnd(4, 96), rnd(6, 94), 3.5, 'decor-it');
      var T = [[92, 9, A.abeja(), '🐝', 8], [8, 91, A.calabaza(), '🎃', 10], [92, 91, A.mariquita(), '🐞', 8]], got = 0, dots = [];
      var mm = document.createElement('div'); mm.className = 'minimap'; mm.innerHTML = '<div class="mm-view"></div>'; stage.appendChild(mm);
      T.forEach(function (t) {
        var it = item(world, t[2], t[0], t[1], t[4], 'tgt clickable');
        var d = document.createElement('i'); d.style.left = t[0] + '%'; d.style.top = t[1] + '%'; mm.appendChild(d); dots.push(d);
        ctx.on(it, 'click', function () {
          if (it.classList.contains('done')) return;
          it.classList.add('done'); it.classList.remove('tgt'); d.classList.add('got');
          burst(it, t[3]); got++; ctx.count(got, 3, 'Encontrados');
          if (got === 3) ctx.win(); else ctx.hint('¡Encontrado! Sigue buscando.', 'ok');
        });
      });
      var view = mm.querySelector('.mm-view');
      function upd() {
        view.style.left = (sc.scrollLeft / sc.scrollWidth * 100) + '%';
        view.style.top = (sc.scrollTop / sc.scrollHeight * 100) + '%';
        view.style.width = (sc.clientWidth / sc.scrollWidth * 100) + '%';
        view.style.height = (sc.clientHeight / sc.scrollHeight * 100) + '%';
      }
      sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2;
      sc.scrollTop = (sc.scrollHeight - sc.clientHeight) / 2;
      upd(); ctx.on(sc, 'scroll', upd);
      ctx.count(0, 3, 'Encontrados');
    }
  });

  /* ============ 17-19 · Clic derecho ============ */

  L.push({
    id: 17, title: 'El menú mágico', learned: 'abrir un menú con el botón derecho', right: true,
    mouse: { r: true, cap: 'Botón DERECHO: una vez' },
    tip: 'Pon la flecha sobre la planta y pulsa UNA vez el botón de la DERECHA del ratón. Cuando salga la lista, haz clic en «Regar».',
    help: function (n) {
      return '¡Ahora el otro botón, <b>' + n + '</b>! El botón <b>derecho</b> abre un <b>menú</b> con opciones. ' +
        'Haz <b>clic derecho</b> sobre la planta mustia y, cuando salga la lista, haz clic (con el izquierdo) en <b>«Regar»</b>.';
    },
    setup: function (stage, ctx) {
      var plant = item(stage, A.maceta(-1), 50, 54, 22, 'tgt rclick');
      ctx.on(plant, 'click', function () { ctx.hint('Eso ha sido el botón izquierdo. Prueba con el DERECHO (el de la derecha).', 'try'); });
      ctx.on(plant, 'contextmenu', function (e) {
        e.preventDefault();
        function wrong() { ctx.hint('Esa opción también existe, pero la planta tiene sed: elige «Regar».', 'try'); }
        menu(ctx, e, [
          { icon: '💧', label: 'Regar', tgt: true, fn: function () { ob(plant).innerHTML = A.maceta(3); plant.classList.add('grew'); burst(plant, '💦'); ctx.win(); } },
          { icon: '✂️', label: 'Podar', fn: wrong },
          { icon: '🧪', label: 'Abonar', fn: wrong },
          { icon: '🔍', label: 'Mirar de cerca', fn: wrong }
        ]);
      });
      ctx.on(stage, 'contextmenu', function (e) {
        if (!e.target.closest('.it')) ctx.hint('El clic derecho hay que hacerlo ENCIMA de la planta.', 'try');
      });
    }
  });

  L.push({
    title: 'Cada cosa, su menú', learned: 'usar el clic derecho en distintos objetos', right: true,
    mouse: { r: true, cap: 'Botón DERECHO sobre cada objeto' },
    tip: 'Cada objeto tiene un menú distinto. Haz clic derecho sobre uno y elige la opción de la lista de tareas.',
    help: function (n) {
      return 'Cada objeto tiene <b>su propio menú</b>, <b>' + n + '</b>. Haz <b>clic derecho</b> sobre cada cosa y elige la opción que toca:<br>' +
        '🌿 <b>Arrancar</b> la mala hierba<br>🪴 <b>Llenar de tierra</b> la maceta<br>🍅 <b>Recoger</b> los tomates';
    },
    setup: function (stage, ctx) {
      var done = {}, count = 0;
      var weed = item(stage, A.malaHierba(), 18, 62, 12, 'tgt rclick');
      var pot = item(stage, A.maceta(0), 50, 58, 16, 'tgt rclick');
      var tom = item(stage, A.maceta(4), 82, 56, 17, 'tgt rclick');
      var todo = document.createElement('ul'); todo.className = 'todo';
      todo.innerHTML = '<li data-k="weed">Arrancar la mala hierba</li><li data-k="pot">Llenar de tierra la maceta</li><li data-k="tom">Recoger los tomates</li>';
      stage.appendChild(todo);
      function complete(k, after) {
        if (done[k]) return;
        done[k] = true; count++;
        todo.querySelector('[data-k="' + k + '"]').classList.add('ok');
        after(); ctx.count(count, 3, 'Tareas');
        if (count === 3) ctx.win(); else ctx.hint('¡Muy bien! Sigue con la lista.', 'ok');
      }
      function wrong(txt) { return function () { ctx.hint('Esa opción es otra tarea. Ahora toca: ' + txt + '.', 'try'); }; }
      function bind(node, k, build) {
        ctx.on(node, 'click', function () { ctx.hint('Eso ha sido el botón izquierdo. Prueba con el DERECHO.', 'try'); });
        ctx.on(node, 'contextmenu', function (e) {
          e.preventDefault();
          if (done[k]) { ctx.hint('Esa tarea ya está hecha. Mira la lista.', ''); return; }
          menu(ctx, e, build());
        });
      }
      bind(weed, 'weed', function () {
        return [{ icon: '🪓', label: 'Arrancar', tgt: true, fn: function () { complete('weed', function () { weed.classList.remove('tgt'); weed.classList.add('pulled'); ctx.timeout(function () { weed.remove(); }, 650); burst(weed, '💨'); }); } },
          { icon: '💧', label: 'Regar', fn: wrong('arrancar la mala hierba') }, { icon: '🔍', label: 'Mirar de cerca', fn: wrong('arrancar la mala hierba') }];
      });
      bind(pot, 'pot', function () {
        return [{ icon: '🌱', label: 'Llenar de tierra', tgt: true, fn: function () { complete('pot', function () { pot.classList.remove('tgt'); ob(pot).innerHTML = A.maceta(1); burst(pot, '🌱'); }); } },
          { icon: '☀️', label: 'Poner al sol', fn: wrong('llenar de tierra la maceta') }, { icon: '🎨', label: 'Pintar', fn: wrong('llenar de tierra la maceta') }];
      });
      bind(tom, 'tom', function () {
        return [{ icon: '🧺', label: 'Recoger tomates', tgt: true, fn: function () { complete('tom', function () { tom.classList.remove('tgt'); ob(tom).innerHTML = A.maceta(2); burst(tom, '🍅'); }); } },
          { icon: '✂️', label: 'Podar', fn: wrong('recoger los tomates') }, { icon: '💧', label: 'Regar', fn: wrong('recoger los tomates') }];
      });
      ctx.count(0, 3, 'Tareas');
    }
  });

  L.push({
    title: 'Copiar y pegar flores', learned: 'copiar y pegar con el menú del botón derecho', right: true,
    mouse: { r: true, cap: 'Botón DERECHO → Copiar / Pegar' },
    tip: 'Clic derecho en la flor → «Copiar». Después clic derecho en un hueco de tierra → «Pegar». ¡Repítelo tres veces!',
    help: function (n) {
      return '¡Vamos a <b>copiar y pegar</b>, <b>' + n + '</b>! <b>1.</b> Clic derecho sobre la flor y elige <b>«Copiar»</b>.<br>' +
        '<b>2.</b> Clic derecho sobre un <b>hueco de tierra</b> y elige <b>«Pegar»</b>.<br>Rellena los tres huecos.';
    },
    setup: function (stage, ctx) {
      var clip = false, got = 0;
      var model = item(stage, A.flor('#ff5c8a') + '<div class="blabel">Flor modelo</div>', 16, 50, 9, 'tgt rclick');
      var badge = document.createElement('div'); badge.className = 'clipbadge'; stage.appendChild(badge);
      function setBadge() { badge.innerHTML = 'Portapapeles: <b>' + (clip ? '🌸 una flor' : 'vacío') + '</b>'; badge.classList.toggle('full', clip); }
      setBadge();
      ctx.on(model, 'click', function () { ctx.hint('Eso ha sido el botón izquierdo. Prueba con el DERECHO.', 'try'); });
      ctx.on(model, 'contextmenu', function (e) {
        e.preventDefault();
        menu(ctx, e, [
          { icon: '📋', label: 'Copiar', tgt: !clip, fn: function () { clip = true; setBadge(); model.classList.remove('tgt'); patches.forEach(function (p) { if (!p._full) p.classList.add('tgt'); }); ctx.hint('¡Copiada! Ahora clic derecho en un hueco de tierra y elige «Pegar».', 'ok'); } },
          { icon: '📥', label: 'Pegar', disabled: true, fn: function () { ctx.hint('Pegar aquí no se puede: esto es la flor original.', 'try'); } }
        ]);
      });
      var patches = [];
      var cols = ['#ff5c8a', '#ff5c8a', '#ff5c8a'];
      [[52, 36], [74, 62], [46, 76]].forEach(function (p, i) {
        var pt = item(stage, '<div class="patch"></div>', p[0], p[1], 12, 'rclick');
        patches.push(pt);
        ctx.on(pt, 'click', function () { ctx.hint('Eso ha sido el botón izquierdo. Prueba con el DERECHO.', 'try'); });
        ctx.on(pt, 'contextmenu', function (e) {
          e.preventDefault();
          if (pt._full) { ctx.hint('Este hueco ya tiene flor. Prueba con otro.', ''); return; }
          menu(ctx, e, [
            { icon: '📋', label: 'Copiar', disabled: true, fn: function () { ctx.hint('Aquí no hay nada que copiar.', 'try'); } },
            { icon: '📥', label: 'Pegar', disabled: !clip, tgt: clip, fn: function (dis) {
              if (dis) { ctx.hint('«Pegar» está en gris porque aún no has copiado nada. Copia primero la flor.', 'try'); return; }
              pt._full = true; pt.classList.remove('tgt', 'rclick');
              ob(pt).innerHTML = A.flor(cols[i]); burst(pt, '🌸'); got++;
              ctx.count(got, 3, 'Pegadas');
              if (got === 3) ctx.win(); else ctx.hint('¡Pegada! Puedes pegar otra vez en otro hueco.', 'ok');
            } }
          ]);
        });
      });
      ctx.count(0, 3, 'Pegadas');
    }
  });

  /* ============ 20 · Nivel maestro ============ */

  var byId = {};
  L.forEach(function (l) { if (l.id) byId[l.id] = l; });

  L.push({
    title: 'El maestro del ratón', learned: 'dominar todo el ratón: clic, doble clic, arrastrar, seleccionar, rueda y clic derecho', master: true, right: true,
    mouse: {}, help: function () { return ''; },
    setup: function (stage, ctx) {
      var steps = [2, 4, 8, 12, 14, 17].map(function (i) { return byId[i]; }), k = 0;
      ctx.opts.subPrefix = function () { return 'Prueba ' + (k + 1) + ' de ' + steps.length; };
      function run() {
        ctx.sub(steps[k], function () {
          k++;
          if (k >= steps.length) { ctx.win(); return; }
          stage.classList.add('celebrate');
          ctx.hint('¡Prueba superada! Prepárate para la siguiente…', 'ok');
          beep('win');
          ctx.timeout(run, 1100);
        });
      }
      run();
    }
  });

  CLIC.LEVELS = L;
})();
