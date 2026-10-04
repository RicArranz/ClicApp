/*
© 2026 Lorena Poza y Ricardo Arranz. Todos los derechos reservados.
Obra protegida por la normativa de propiedad intelectual. Queda prohibida su copia,
modificación, distribución o comunicación pública, total o parcial, sin autorización
expresa y por escrito de sus autores.
*/
/* ============================================================
   clicApp · Gráficos SVG incrustados (sin imágenes externas)
   Todos devuelven una cadena <svg> lista para insertar.
   ============================================================ */
(function () {
  'use strict';
  var CLIC = window.CLIC = window.CLIC || {};
  var A = CLIC.ART = {};

  function svg(vb, inner, cls) {
    return '<svg viewBox="' + vb + '"' + (cls ? ' class="' + cls + '"' : '') +
      ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }
  function leaf(x, y, rot, col) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="9" ry="5" fill="' + (col || '#4caf50') +
      '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
  }
  function hex(cx, cy, r, fill) {
    var p = [], i, a;
    for (i = 0; i < 6; i++) {
      a = Math.PI / 3 * i;
      p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return '<polygon points="' + p.join(' ') + '" fill="' + fill + '" stroke="#c77700" stroke-width="3"/>';
  }

  /* ---------- Rosi, la regadera (mascota) ---------- */
  A.regadera = function (face) {
    var f = face ?
      '<circle cx="51" cy="60" r="4.2" fill="#12394f"/><circle cx="77" cy="60" r="4.2" fill="#12394f"/>' +
      '<circle cx="52.4" cy="58.6" r="1.4" fill="#fff"/><circle cx="78.4" cy="58.6" r="1.4" fill="#fff"/>' +
      '<path d="M54 70q10 10 20 0" stroke="#12394f" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="43" cy="69" rx="5" ry="3.2" fill="#ff8aa1" opacity=".65"/>' +
      '<ellipse cx="85" cy="69" rx="5" ry="3.2" fill="#ff8aa1" opacity=".65"/>' : '';
    return svg('-8 -4 142 106',
      '<path d="M50 38Q66 4 92 38" fill="none" stroke="#1f7fb8" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M96 52Q126 46 120 72Q116 88 96 86" fill="none" stroke="#1f7fb8" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M34 66L10 26" stroke="#1f7fb8" stroke-width="10" stroke-linecap="round"/>' +
      '<ellipse cx="8" cy="22" rx="12" ry="6.5" transform="rotate(-35 8 22)" fill="#8fd3f8" stroke="#1f7fb8" stroke-width="3"/>' +
      '<rect x="30" y="38" width="72" height="56" rx="13" fill="#3aa7e8"/>' +
      '<rect x="30" y="38" width="72" height="15" rx="7" fill="#6cc3f5"/>' +
      '<rect x="37" y="56" width="9" height="30" rx="4.5" fill="#fff" opacity=".25"/>' + f);
  };

  /* ---------- Grifo con gotas ---------- */
  A.grifo = function () {
    return svg('0 0 100 110',
      '<rect x="0" y="22" width="62" height="20" rx="5" fill="#9aa7b0"/>' +
      '<rect x="0" y="22" width="62" height="7" rx="3" fill="#c3ccd2"/>' +
      '<rect x="46" y="22" width="20" height="44" rx="6" fill="#8f9ca5"/>' +
      '<rect x="40" y="60" width="32" height="12" rx="5" fill="#7a8791"/>' +
      '<rect x="52" y="8" width="8" height="16" fill="#9aa7b0"/>' +
      '<rect x="36" y="2" width="40" height="10" rx="5" fill="#e53935"/>' +
      '<g class="drip" fill="#3aa7e8">' +
      '<path class="d1" d="M56 80c-5 8-6 13 0 14s6-6 0-14z"/>' +
      '<path class="d2" d="M56 80c-5 8-6 13 0 14s6-6 0-14z"/>' +
      '<path class="d3" d="M56 80c-5 8-6 13 0 14s6-6 0-14z"/></g>');
  };

  /* ---------- Maceta con planta (st: -1 mustia, 0 vacía, 1,2 crece, 3 flor, 4 tomates) ---------- */
  A.maceta = function (st) {
    var pot =
      '<path d="M24 86h52l-6 36a6 6 0 0 1-6 5H36a6 6 0 0 1-6-5z" fill="#e07a4b"/>' +
      '<rect x="16" y="74" width="68" height="16" rx="6" fill="#c9602f"/>' +
      '<ellipse cx="50" cy="77" rx="30" ry="4.5" fill="#5d3a24"/>';
    var pl = '';
    if (st === 1) {
      pl = '<path d="M50 77V63" stroke="#43a047" stroke-width="4.5" stroke-linecap="round"/>' +
        leaf(42, 62, -35) + leaf(58, 62, 35);
    } else if (st >= 2) {
      var top = st === 2 ? 44 : 32;
      pl = '<path d="M50 77V' + top + '" stroke="#43a047" stroke-width="5" stroke-linecap="round"/>' +
        leaf(40, 66, -30) + leaf(60, 66, 30) + leaf(41, 52, -30) + leaf(59, 52, 30);
      if (st === 3) {
        var pet = '', k, a;
        for (k = 0; k < 6; k++) {
          a = Math.PI / 3 * k;
          pet += '<circle cx="' + (50 + 11 * Math.cos(a)).toFixed(1) + '" cy="' + (22 + 11 * Math.sin(a)).toFixed(1) +
            '" r="8" fill="#ff6f91"/>';
        }
        pl += pet + '<circle cx="50" cy="22" r="7.5" fill="#ffd54f"/>';
      }
      if (st === 4) {
        pl += '<circle cx="36" cy="58" r="10" fill="#e53935"/><circle cx="64" cy="50" r="10" fill="#e53935"/>' +
          '<circle cx="50" cy="40" r="10" fill="#e53935"/>' +
          '<circle cx="33" cy="55" r="2.6" fill="#fff" opacity=".5"/><circle cx="61" cy="47" r="2.6" fill="#fff" opacity=".5"/>' +
          '<circle cx="47" cy="37" r="2.6" fill="#fff" opacity=".5"/>';
      }
    } else if (st === -1) {
      pl = '<path d="M50 77Q50 54 72 48" fill="none" stroke="#8d9e4a" stroke-width="5" stroke-linecap="round"/>' +
        leaf(66, 62, 75, '#a3a35a') + leaf(60, 52, 55, '#a3a35a') + leaf(72, 48, 85, '#b0a85a');
    }
    return svg('0 0 100 130', pot + pl);
  };

  /* ---------- Semilla y montoncito de tierra ---------- */
  A.semilla = function () {
    return svg('0 0 100 100',
      '<ellipse cx="50" cy="52" rx="22" ry="32" fill="#d9a441" stroke="#8a5a1a" stroke-width="4" transform="rotate(25 50 52)"/>' +
      '<ellipse cx="42" cy="40" rx="5" ry="10" fill="#fff" opacity=".4" transform="rotate(25 42 40)"/>' +
      '<path d="M50 30Q54 52 48 74" stroke="#8a5a1a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>');
  };
  A.monton = function (sprout) {
    var top = sprout ?
      '<path d="M50 44V22" stroke="#43a047" stroke-width="5" stroke-linecap="round"/>' +
      leaf(41, 22, -30) + leaf(59, 22, 30) :
      '<ellipse cx="50" cy="38" rx="9" ry="13" fill="#d9a441" stroke="#8a5a1a" stroke-width="2.5" transform="rotate(20 50 38)"/>';
    return svg('0 0 100 76',
      top + '<path d="M4 72Q50 8 96 72z" fill="#7b4a2d"/><path d="M22 60Q50 26 78 60" fill="none" stroke="#9a6540" stroke-width="5" stroke-linecap="round"/>');
  };

  /* ---------- Cofre ---------- */
  A.cofre = function (open) {
    if (open) {
      return svg('0 0 120 110',
        '<path d="M16 46L24 6h72l8 40z" fill="#8a4f22"/>' +
        '<rect x="10" y="46" width="100" height="52" rx="8" fill="#a0612e"/>' +
        '<ellipse cx="60" cy="48" rx="44" ry="8" fill="#ffd54f"/>' +
        '<circle cx="42" cy="44" r="7" fill="#fff59d"/><circle cx="64" cy="40" r="8" fill="#ffe082"/><circle cx="82" cy="45" r="6" fill="#fff59d"/>' +
        '<rect x="52" y="60" width="16" height="22" rx="3" fill="#ffd54f"/>' +
        '<rect x="10" y="46" width="100" height="8" fill="#6d3b17" opacity=".35"/>');
    }
    return svg('0 0 120 110',
      '<rect x="10" y="48" width="100" height="50" rx="8" fill="#a0612e"/>' +
      '<path d="M10 52Q10 14 60 14t50 38z" fill="#b97a3d"/>' +
      '<rect x="22" y="14" width="10" height="84" fill="#ffd54f" opacity=".9"/>' +
      '<rect x="88" y="14" width="10" height="84" fill="#ffd54f" opacity=".9"/>' +
      '<rect x="50" y="46" width="20" height="24" rx="4" fill="#ffd54f" stroke="#c79100" stroke-width="3"/>' +
      '<circle cx="60" cy="57" r="3.5" fill="#8a4f22"/>');
  };
  A.paquete = function (color) {
    return svg('0 0 100 100',
      '<rect x="22" y="6" width="56" height="88" rx="7" fill="#fff8e1" stroke="#c9a66b" stroke-width="3"/>' +
      '<rect x="22" y="6" width="56" height="24" rx="7" fill="' + (color || '#e53935') + '"/>' +
      '<circle cx="50" cy="58" r="15" fill="' + (color || '#e53935') + '" opacity=".9"/>' +
      '<path d="M50 72V50" stroke="#2e7d32" stroke-width="4" stroke-linecap="round"/>' +
      leaf(43, 52, -30, '#2e7d32') + leaf(57, 52, 30, '#2e7d32'));
  };

  /* ---------- Verduras ---------- */
  A.tomate = function () {
    return svg('0 0 100 100',
      '<circle cx="50" cy="58" r="36" fill="#e53935"/>' +
      '<ellipse cx="36" cy="44" rx="9" ry="5" fill="#fff" opacity=".35" transform="rotate(-30 36 44)"/>' +
      '<path d="M50 22l8 10 11-4-5 11-14 2-14-2-5-11 11 4z" fill="#43a047"/>');
  };
  A.berenjena = function () {
    return svg('0 0 100 100',
      '<ellipse cx="50" cy="62" rx="25" ry="36" fill="#7b3f9e" transform="rotate(25 50 62)"/>' +
      '<ellipse cx="40" cy="52" rx="5" ry="12" fill="#fff" opacity=".28" transform="rotate(25 40 52)"/>' +
      '<path d="M56 28q12-10 24 0l-4 9-8-3-8 3z" fill="#43a047"/>');
  };
  A.zanahoria = function () {
    return svg('0 0 100 100',
      '<path d="M50 26C47 12 50 4 50 2c4 6 4 14 0 24z" fill="#43a047"/>' +
      '<path d="M46 28C34 18 26 18 22 16c6-6 16-2 28 10z" fill="#4caf50"/>' +
      '<path d="M54 28C66 18 74 18 78 16c-6-6-16-2-28 10z" fill="#4caf50"/>' +
      '<path d="M36 28Q50 22 64 28L54 94Q50 100 46 94z" fill="#ff8f1f"/>' +
      '<path d="M41 44h9M52 58h7M44 72h8" stroke="#e65100" stroke-width="3" stroke-linecap="round"/>');
  };
  A.zanahoriaAsoma = function () {
    return svg('0 0 100 76',
      '<path d="M50 30C47 14 50 4 50 2c4 6 4 16 0 28z" fill="#43a047"/>' +
      '<path d="M46 32C34 20 26 20 22 18c6-6 16-2 28 12z" fill="#4caf50"/>' +
      '<path d="M54 32C66 20 74 20 78 18c-6-6-16-2-28 12z" fill="#4caf50"/>' +
      '<path d="M37 34Q50 26 63 34L60 58H40z" fill="#ff8f1f"/>' +
      '<path d="M4 74Q50 30 96 74z" fill="#7b4a2d"/><path d="M24 64Q50 38 76 64" fill="none" stroke="#9a6540" stroke-width="5" stroke-linecap="round"/>');
  };
  A.cesta = function () {
    return svg('0 0 120 100',
      '<path d="M18 40Q60 -12 102 40" fill="none" stroke="#a9692f" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M10 42h100l-12 48a8 8 0 0 1-8 6H30a8 8 0 0 1-8-6z" fill="#d9a05b"/>' +
      '<path d="M16 60h88M20 76h80M40 44l4 52M60 44v52M80 44l-4 52" stroke="#b9803c" stroke-width="3"/>' +
      '<rect x="6" y="36" width="108" height="12" rx="6" fill="#e6b26d"/>');
  };

  /* ---------- Bichitos y plantas ---------- */
  A.mariquita = function () {
    return svg('0 0 100 100',
      '<path d="M44 14L36 2M56 14L64 2" stroke="#222" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="50" cy="20" r="12" fill="#222"/>' +
      '<circle cx="50" cy="60" r="34" fill="#e53935"/>' +
      '<path d="M50 26V94" stroke="#222" stroke-width="3.5"/>' +
      '<circle cx="36" cy="48" r="6" fill="#222"/><circle cx="64" cy="48" r="6" fill="#222"/>' +
      '<circle cx="34" cy="70" r="6" fill="#222"/><circle cx="66" cy="70" r="6" fill="#222"/>' +
      '<circle cx="46" cy="18" r="2.6" fill="#fff"/><circle cx="54" cy="18" r="2.6" fill="#fff"/>');
  };
  A.farolillo = function () {
    return svg('0 0 60 100',
      '<circle class="glow" cx="30" cy="58" r="34" fill="#fff59d"/>' +
      '<path d="M30 0V16" stroke="#6d4c41" stroke-width="3"/>' +
      '<rect x="18" y="14" width="24" height="9" rx="4" fill="#6d4c41"/>' +
      '<ellipse class="lamp-body" cx="30" cy="58" rx="22" ry="32" stroke="#6d4c41" stroke-width="3"/>' +
      '<path d="M16 52Q30 62 44 52M17 68Q30 78 43 68" fill="none" stroke="#6d4c41" stroke-width="2.5" opacity=".5"/>' +
      '<rect x="22" y="88" width="16" height="8" rx="3" fill="#6d4c41"/>');
  };
  A.flor = function (col) {
    var pet = '', k, a;
    for (k = 0; k < 6; k++) {
      a = Math.PI / 3 * k;
      pet += '<circle cx="' + (50 + 15 * Math.cos(a)).toFixed(1) + '" cy="' + (34 + 15 * Math.sin(a)).toFixed(1) +
        '" r="12" fill="' + (col || '#ff6f91') + '"/>';
    }
    return svg('0 0 100 130',
      '<path d="M50 126V48" stroke="#43a047" stroke-width="6" stroke-linecap="round"/>' +
      leaf(36, 98, -35) + leaf(64, 84, 35) + pet + '<circle cx="50" cy="34" r="10" fill="#ffd54f"/>');
  };
  A.malaHierba = function () {
    return svg('0 0 100 100',
      '<path d="M50 94C42 60 30 44 20 18c16 14 26 28 30 54C54 48 62 28 76 10c-2 30-12 52-26 84z" fill="#557a28"/>' +
      '<path d="M50 94C48 70 56 56 82 42c-14 10-22 26-32 52z" fill="#7cb342"/>' +
      '<ellipse cx="50" cy="94" rx="30" ry="5" fill="#5d3a24"/>');
  };
  A.piedra = function () {
    return svg('0 0 100 100',
      '<path d="M10 82C6 58 26 30 52 30s44 18 38 52c-2 8-76 10-80 0z" fill="#9e9e9e"/>' +
      '<path d="M28 52c8-10 22-12 32-8" stroke="#d0d0d0" stroke-width="6" fill="none" stroke-linecap="round"/>');
  };
  A.abeja = function () {
    return svg('0 0 100 100',
      '<ellipse cx="38" cy="32" rx="12" ry="18" fill="#e1f5fe" stroke="#90caf9" stroke-width="2" transform="rotate(-20 38 32)"/>' +
      '<ellipse cx="58" cy="30" rx="12" ry="18" fill="#e1f5fe" stroke="#90caf9" stroke-width="2" transform="rotate(20 58 30)"/>' +
      '<ellipse cx="52" cy="60" rx="28" ry="20" fill="#ffca28"/>' +
      '<path d="M46 42v36M60 42v36" stroke="#3e2723" stroke-width="8"/>' +
      '<circle cx="24" cy="62" r="12" fill="#3e2723"/><circle cx="20" cy="58" r="3" fill="#fff"/>' +
      '<path d="M80 60l10 3-10 3z" fill="#3e2723"/>');
  };
  A.panal = function () {
    return svg('0 0 100 100', hex(34, 30, 22, '#ffc93c') + hex(67, 49, 22, '#ffb300') + hex(34, 68, 22, '#ffd966') +
      '<circle cx="34" cy="30" r="8" fill="#ffe9a0"/><circle cx="67" cy="49" r="8" fill="#ffd54f"/><circle cx="34" cy="68" r="8" fill="#ffefb8"/>');
  };
  A.calabaza = function () {
    return svg('0 0 100 100',
      '<ellipse cx="50" cy="62" rx="40" ry="30" fill="#ffb300"/>' +
      '<ellipse cx="32" cy="62" rx="20" ry="30" fill="#ffc933"/><ellipse cx="68" cy="62" rx="20" ry="30" fill="#ffc933"/>' +
      '<ellipse cx="50" cy="62" rx="12" ry="30" fill="#ffd966"/>' +
      '<path d="M50 34q-2-12 8-20" stroke="#558b2f" stroke-width="7" stroke-linecap="round" fill="none"/>' +
      '<path d="M86 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff59d"/><path d="M12 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff59d"/>');
  };

  /* ---------- Decorado ---------- */
  A.sol = function () {
    var r = '', k, a;
    for (k = 0; k < 8; k++) {
      a = Math.PI / 4 * k;
      r += '<line x1="' + (50 + 32 * Math.cos(a)).toFixed(1) + '" y1="' + (50 + 32 * Math.sin(a)).toFixed(1) +
        '" x2="' + (50 + 46 * Math.cos(a)).toFixed(1) + '" y2="' + (50 + 46 * Math.sin(a)).toFixed(1) + '"/>';
    }
    return svg('0 0 100 100', '<g stroke="#ffb300" stroke-width="6" stroke-linecap="round">' + r + '</g>' +
      '<circle cx="50" cy="50" r="23" fill="#ffd54f"/>');
  };
  A.luna = function () {
    return svg('0 0 100 100', '<path d="M62 8a42 42 0 1 0 30 58A36 36 0 0 1 62 8z" fill="#fff9c4"/>');
  };
  A.nube = function () {
    return svg('0 0 120 60', '<ellipse cx="40" cy="38" rx="28" ry="18" fill="#fff"/><ellipse cx="68" cy="30" rx="26" ry="22" fill="#fff"/>' +
      '<ellipse cx="90" cy="40" rx="22" ry="15" fill="#fff"/><rect x="20" y="38" width="86" height="17" rx="8" fill="#fff"/>');
  };
  A.arbol = function () {
    return svg('0 0 100 130',
      '<rect x="43" y="66" width="14" height="60" rx="4" fill="#8d5a2b"/>' +
      '<circle cx="50" cy="42" r="32" fill="#43a047"/><circle cx="28" cy="62" r="22" fill="#4caf50"/><circle cx="72" cy="62" r="22" fill="#4caf50"/>' +
      '<circle cx="40" cy="34" r="9" fill="#66bb6a" opacity=".7"/>');
  };
  A.carpeta = function () {
    return svg('0 0 100 80',
      '<path d="M6 14a6 6 0 0 1 6-6h24l8 10h44a6 6 0 0 1 6 6v8H6z" fill="#f4b400"/>' +
      '<rect x="6" y="26" width="88" height="48" rx="7" fill="#ffd54f"/>' +
      '<rect x="6" y="26" width="88" height="10" rx="5" fill="#fff" opacity=".3"/>');
  };
  A.deposito = function () {
    return svg('0 0 100 130',
      '<rect class="water" x="17" y="115" width="66" height="0" fill="#3aa7e8"/>' +
      '<rect x="12" y="10" width="76" height="110" rx="10" fill="none" stroke="#5a7d91" stroke-width="5"/>' +
      '<path d="M8 33H92" stroke="#43a047" stroke-width="4" stroke-dasharray="8 6"/>');
  };

  /* ---------- Diagrama del ratón ----------
     o: { l, r, w (rueda), twice, hold, move, wheel }                */
  A.raton = function (o) {
    o = o || {};
    var c = ['mouse'];
    if (o.l) c.push('hl-l');
    if (o.r) c.push('hl-r');
    if (o.w) c.push('hl-w');
    if (o.twice) c.push('twice');
    if (o.hold) c.push('hold');
    if (o.move) c.push('move');
    return svg('-14 -6 148 166',
      '<path d="M60 6C32 6 16 24 16 54v48c0 28 18 46 44 46s44-18 44-46V54C104 24 88 6 60 6z" fill="#fafafa" stroke="#455a64" stroke-width="4"/>' +
      '<path class="mb mb-l" d="M58 8C34 9 20 24 18 54h40z"/>' +
      '<path class="mb mb-r" d="M62 8C86 9 100 24 102 54H62z"/>' +
      '<rect class="mb mb-w" x="51" y="18" width="18" height="34" rx="9"/>' +
      '<path class="ar ar-w" d="M60 22l-5 6h10zM60 48l-5-6h10z" fill="#4e342e"/>' +
      '<path class="ar ar-m" d="M-12 80l9-7v14zM132 80l-9-7v14zM60 -4l-7 8h14z" fill="#e65100"/>' +
      '',
      c.join(' '));
  };
})();
