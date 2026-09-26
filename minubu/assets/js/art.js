/* =============================================================
   Minubu : illustrations et icônes (SVG au trait, style carte)
   ============================================================= */
(function (racine) {
  'use strict';

  var T = '#641D30'; // trait bordeaux
  var attr = 'fill="none" stroke="' + T + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';

  function svg(vb, contenu, extra) {
    return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"' + (extra || '') + '>' + contenu + '</svg>';
  }

  var ART = {
    toast: function () {
      return svg('0 0 100 100',
        '<path d="M22 44c-8-2-10-16 0-22 8-5 20-2 24 2 6-6 22-8 30 0 8 8 4 20-4 22v32c0 3-2 5-5 5H27c-3 0-5-2-5-5z" fill="#F4C9A0" ' + attr + '/>' +
        '<path d="M28 46v28M72 46v26" ' + attr + ' opacity=".35"/>' +
        '<ellipse cx="50" cy="56" rx="17" ry="12" fill="#fff" ' + attr + '/>' +
        '<circle cx="51" cy="56" r="7" fill="#F2B544" ' + attr + '/>' +
        '<path d="M34 40c2-3 6-3 8 0M60 38c2-2 5-2 7 0" ' + attr + ' opacity=".6"/>' +
        '<path d="M38 70c2 1 4 1 6 0M58 72c2 1 4 1 6 0" stroke="#3F7D4E" stroke-width="2.4" stroke-linecap="round"/>');
    },
    bagel: function () {
      return svg('0 0 100 100',
        '<path d="M14 52c0-16 16-26 36-26s36 10 36 26" fill="#E8B07A" ' + attr + '/>' +
        '<path d="M12 58c6 4 10-2 16 2s10-2 16 2 10-3 16 1 10-3 16 1 8-2 12-2" stroke="#E86F5A" stroke-width="5" stroke-linecap="round" fill="none"/>' +
        '<path d="M14 54c4-3 9 2 14-1s9 2 14-1 9 2 14-1 9 2 14-1 9 2 14-1" stroke="#8DB36B" stroke-width="4" stroke-linecap="round" fill="none"/>' +
        '<path d="M14 64c0 10 16 16 36 16s36-6 36-16z" fill="#E8B07A" ' + attr + '/>' +
        '<path d="M34 34l2 2M48 31l1 2M62 34l2 2M40 42l1 2M56 40l2 1" ' + attr + '/>');
    },
    pancake: function () {
      return svg('0 0 100 100',
        '<ellipse cx="50" cy="80" rx="38" ry="8" fill="#fff" ' + attr + '/>' +
        '<path d="M18 68c0 5 14 9 32 9s32-4 32-9v-8H18z" fill="#E8B07A" ' + attr + '/>' +
        '<path d="M18 56c0 5 14 9 32 9s32-4 32-9v-8H18z" fill="#EDBE8C" ' + attr + '/>' +
        '<ellipse cx="50" cy="48" rx="32" ry="9" fill="#F4CFA2" ' + attr + '/>' +
        '<path d="M30 46c4-10 36-10 40 0-4 4-36 4-40 0z" fill="#C9DA93" ' + attr + '/>' +
        '<path d="M40 36c4-6 16-6 20 0" fill="#DDE8B6" ' + attr + '/>' +
        '<path d="M36 44l2-1M46 40l2 1M58 42l1-2M64 45l-2 1" stroke="#5F7F2A" stroke-width="2.4" stroke-linecap="round"/>');
    },
    plate: function () {
      return svg('0 0 100 100',
        '<ellipse cx="50" cy="62" rx="40" ry="18" fill="#fff" ' + attr + '/>' +
        '<ellipse cx="50" cy="60" rx="26" ry="10" fill="none" ' + attr + ' opacity=".4"/>' +
        '<ellipse cx="40" cy="56" rx="10" ry="6" fill="#8DB36B" ' + attr + '/>' +
        '<ellipse cx="60" cy="58" rx="9" ry="5" fill="#F2B544" ' + attr + '/>' +
        '<circle cx="52" cy="50" r="5" fill="#E86F5A" ' + attr + '/>');
    },
    latte: function (couleur) {
      var c = couleur || '#C49A74';
      return svg('0 0 100 100',
        '<path d="M30 22h40l-6 64c0 3-3 5-6 5H42c-3 0-6-2-6-5z" fill="#fff" ' + attr + '/>' +
        '<path d="M32 44h36l-4 42c0 2-2 4-5 4H41c-3 0-5-2-5-4z" fill="' + c + '"/>' +
        '<path d="M33 36h34l-1 10H34z" fill="#FBF1E6"/>' +
        '<path d="M30 22h40l-6 64c0 3-3 5-6 5H42c-3 0-6-2-6-5z" ' + attr + '/>' +
        '<path d="M56 22l8-14h8" ' + attr + '/>');
    },
    cup: function (couleur) {
      var c = couleur || '#8C5A3A';
      return svg('0 0 100 100',
        '<ellipse cx="46" cy="80" rx="36" ry="7" fill="#fff" ' + attr + '/>' +
        '<path d="M20 44h52c0 20-8 32-26 32S20 64 20 44z" fill="#fff" ' + attr + '/>' +
        '<ellipse cx="46" cy="44" rx="26" ry="5" fill="' + c + '" ' + attr + '/>' +
        '<path d="M72 50c10-2 14 6 8 12-3 3-8 4-11 3" ' + attr + '/>' +
        '<path d="M38 34c-4-5 4-8 0-14M50 34c-4-5 4-8 0-14" ' + attr + ' opacity=".55"/>');
    },
    glass: function (couleur) {
      var c = couleur || '#F2B544';
      return svg('0 0 100 100',
        '<path d="M28 26h44l-6 60c0 3-2 5-5 5H39c-3 0-5-2-5-5z" fill="#fff"/>' +
        '<path d="M30 40h40l-4 46c0 2-2 4-5 4H39c-3 0-5-2-5-4z" fill="' + c + '"/>' +
        '<rect x="38" y="50" width="10" height="10" rx="2" fill="#fff" opacity=".7" transform="rotate(12 43 55)"/>' +
        '<rect x="52" y="60" width="9" height="9" rx="2" fill="#fff" opacity=".7" transform="rotate(-10 56 64)"/>' +
        '<path d="M28 26h44l-6 60c0 3-2 5-5 5H39c-3 0-5-2-5-5z" ' + attr + '/>' +
        '<path d="M58 30l10-24" ' + attr + '/>' +
        '<circle cx="72" cy="28" r="10" fill="#F7E07A" ' + attr + '/><path d="M72 18v20M62 28h20" ' + attr + ' opacity=".5"/>');
    },
    bottle: function (couleur) {
      var c = couleur || '#D9B45A';
      return svg('0 0 100 100',
        '<path d="M42 8h16v6l-2 2v10c8 4 12 10 12 20v42c0 3-2 5-5 5H37c-3 0-5-2-5-5V46c0-10 4-16 12-20V16l-2-2z" fill="' + c + '" ' + attr + '/>' +
        '<rect x="32" y="52" width="36" height="20" fill="#fff" ' + attr + '/>' +
        '<path d="M40 62h20" ' + attr + '/>');
    },
    gift: function () {
      return svg('0 0 100 100',
        '<rect x="18" y="40" width="64" height="46" rx="4" fill="#F7AE93" ' + attr + '/>' +
        '<rect x="14" y="30" width="72" height="14" rx="3" fill="#FCDCCD" ' + attr + '/>' +
        '<path d="M50 30v56" stroke="#641D30" stroke-width="7"/>' +
        '<path d="M50 30c-10-16-28-12-22-2 3 4 14 3 22 2zM50 30c10-16 28-12 22-2-3 4-14 3-22 2z" fill="#fff" ' + attr + '/>');
    },
    stamp: function () {
      return svg('0 0 40 40',
        '<path d="M8 18h20c0 9-4 14-10 14S8 27 8 18z" fill="currentColor" opacity=".25"/>' +
        '<path d="M8 18h20c0 9-4 14-10 14S8 27 8 18zM28 20c5-1 6 5 1 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M15 13c-2-2 2-4 0-6M21 13c-2-2 2-4 0-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>');
    },

    /* Scène du héro : soleil, mer de la Corniche, tasse géante */
    hero: function () {
      return svg('0 0 560 460',
        '<circle cx="380" cy="150" r="96" fill="#FCDCCD"/>' +
        '<circle cx="380" cy="150" r="96" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="2 10" opacity=".8"/>' +
        '<g stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".9">' +
          '<path d="M250 250c20-8 40 8 60 0s40 8 60 0 40 8 60 0 40 8 60 0"/>' +
          '<path d="M290 280c20-8 40 8 60 0s40 8 60 0 40 8 60 0"/>' +
          '<path d="M330 310c20-8 40 8 60 0s40 8 60 0"/>' +
        '</g>' +
        '<g fill="none" stroke="#641D30" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M120 212c-10-18 12-26 0-46M160 206c-10-18 12-26 0-46M200 212c-10-18 12-26 0-46" opacity=".55"/>' +
        '</g>' +
        '<ellipse cx="170" cy="438" rx="150" ry="18" fill="#BD6446" opacity=".25"/>' +
        '<path d="M50 240h240c0 110-50 190-120 190S50 350 50 240z" fill="#FFFDFB" stroke="#641D30" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<ellipse cx="170" cy="240" rx="120" ry="20" fill="#C49A74" stroke="#641D30" stroke-width="3.5"/>' +
        '<path d="M140 238c10-14 50-14 60 0-10 8-50 8-60 0z" fill="#FBF1E6"/>' +
        '<path d="M170 226c6 6 6 14 0 20-6-6-6-14 0-20z" fill="#C49A74"/>' +
        '<path d="M288 270c46-10 62 30 34 56-14 12-36 16-50 10" fill="none" stroke="#641D30" stroke-width="3.5" stroke-linecap="round"/>' +
        '<path d="M86 300c14 50 40 90 84 100" fill="none" stroke="#F7AE93" stroke-width="10" stroke-linecap="round" opacity=".7"/>' +
        '<text x="112" y="350" font-family="Gochi Hand, cursive" font-size="44" fill="#641D30" transform="rotate(-6 170 340)">minubu</text>' +
        '<g transform="translate(430 330) rotate(12)"><path d="M-34 0c0-22 16-34 34-34S34-22 34 0c0 8-6 14-14 14h-40C-28 14-34 8-34 0z" fill="#E8B07A" stroke="#641D30" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M-16-24c4 10 4 22 0 34M0-34v44M16-24c-4 10-4 22 0 34" fill="none" stroke="#641D30" stroke-width="3" stroke-linecap="round" opacity=".6"/></g>');
    },

    /* Deux tasses qui trinquent : Océane & Sami */
    duo: function () {
      return svg('0 0 400 360',
        '<circle cx="200" cy="130" r="80" fill="#FCDCCD"/>' +
        '<g transform="rotate(-10 130 240)">' +
          '<path d="M60 170h120c0 70-24 120-60 120s-60-50-60-120z" fill="#FFFDFB" stroke="#641D30" stroke-width="3.5" stroke-linejoin="round"/>' +
          '<ellipse cx="120" cy="170" rx="60" ry="11" fill="#8DB36B" stroke="#641D30" stroke-width="3.5"/>' +
          '<path d="M178 190c26-4 32 24 12 34-8 4-18 4-24 1" fill="none" stroke="#641D30" stroke-width="3.5" stroke-linecap="round"/>' +
          '<text x="86" y="252" font-family="Gochi Hand, cursive" font-size="30" fill="#BD6446">Océane</text>' +
        '</g>' +
        '<g transform="rotate(10 270 240)">' +
          '<path d="M220 170h120c0 70-24 120-60 120s-60-50-60-120z" fill="#FFFDFB" stroke="#641D30" stroke-width="3.5" stroke-linejoin="round"/>' +
          '<ellipse cx="280" cy="170" rx="60" ry="11" fill="#C49A74" stroke="#641D30" stroke-width="3.5"/>' +
          '<path d="M222 190c-26-4-32 24-12 34 8 4 18 4 24 1" fill="none" stroke="#641D30" stroke-width="3.5" stroke-linecap="round"/>' +
          '<text x="254" y="252" font-family="Gochi Hand, cursive" font-size="30" fill="#BD6446">Sami</text>' +
        '</g>' +
        '<g stroke="#641D30" stroke-width="3" stroke-linecap="round"><path d="M200 120v-26M180 128l-12-18M220 128l12-18"/></g>' +
        '<path d="M0 340c40-14 80 14 120 0s80 14 120 0 80 14 120 0 40 6 40 6v20H0z" fill="#8FC1C7" opacity=".7"/>');
    },

    /* Petite carte de repérage stylisée (avant consentement OSM) */
    plan: function () {
      return svg('0 0 400 320',
        '<rect width="400" height="320" fill="#FBF1E6"/>' +
        '<path d="M0 0h140c-20 60 30 110 10 170s40 110 20 150H0z" fill="#8FC1C7"/>' +
        '<path d="M150 0c-20 60 30 110 10 170s40 110 20 150" fill="none" stroke="#FFFDFB" stroke-width="16"/>' +
        '<path d="M150 0c-20 60 30 110 10 170s40 110 20 150" fill="none" stroke="#F7AE93" stroke-width="4" stroke-dasharray="10 8"/>' +
        '<g stroke="#EBDDD5" stroke-width="10" fill="none"><path d="M200 40h200M190 120h210M220 220h180M260 0v320M340 0v320"/></g>' +
        '<g transform="translate(166 150)"><circle r="26" fill="#641D30" opacity=".15"/><path d="M0 12c-12-14-16-20-16-28a16 16 0 0132 0c0 8-4 14-16 28z" fill="#641D30"/><circle cy="-16" r="6" fill="#fff"/></g>' +
        '<text x="30" y="290" font-family="Gochi Hand, cursive" font-size="24" fill="#0F3A44">Mer Méditerranée</text>');
    },

    vagues: function () {
      return '<svg class="vagues" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 20c60 0 60-16 120-16s60 16 120 16 60-16 120-16 60 16 120 16 60-16 120-16 60 16 120 16 60-16 120-16 60 16 120 16 60-16 120-16 60 16 120 16 60-16 120-16 60 16 120 16v20H0z"/></svg>';
    }
  };

  /* Fond par catégorie */
  ART.fonds = {
    oeufs: '#FEEEE6', cassecroute: '#FCE4D6', sucre: '#F9E7DF', extras: '#F3ECE4',
    lattebar: '#F6E6DA', cafes: '#F2E7DF', jus: '#FDF1DC', fraiches: '#EAF3EF', cadeau: '#FCDCCD'
  };

  /* Illustration d'un produit */
  ART.produit = function (produit, categorie) {
    var nom = (categorie && categorie.art) || 'plate';
    if (produit.id === 'carte-cadeau') nom = 'gift';
    var f = ART[nom] || ART.plate;
    return f(produit.couleur);
  };

  /* ---------- Icônes d'interface ---------- */
  var ic = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  function icone(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ' + ic + '>' + d + '</svg>'; }
  ART.icones = {
    plus: icone('<path d="M12 5v14M5 12h14"/>'),
    moins: icone('<path d="M5 12h14"/>'),
    sac: icone('<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 016 0v2"/>'),
    fermer: icone('<path d="M6 6l12 12M18 6L6 18"/>'),
    loupe: icone('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
    coche: icone('<path d="M5 12l5 5L20 7"/>'),
    horloge: icone('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    epingle: icone('<path d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
    fleche: icone('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    retour: icone('<path d="M19 12H5M11 18l-6-6 6-6"/>'),
    cadenas: icone('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
    cadeau: icone('<rect x="4" y="10" width="16" height="10" rx="1"/><path d="M3 7h18v3H3zM12 7v13M12 7c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z"/>'),
    etoile: icone('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
    info: icone('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    wifi: icone('<path d="M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0"/><circle cx="12" cy="19" r="1"/>'),
    prise: icone('<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 01-12 0zM12 18v4"/>'),
    ordi: icone('<rect x="4" y="5" width="16" height="11" rx="1"/><path d="M2 19h20"/>'),
    voiture: icone('<path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3zM7 19v2M17 19v2"/><circle cx="7.5" cy="13" r="1"/><circle cx="16.5" cy="13" r="1"/>'),
    tasse: icone('<path d="M4 9h13v5a6 6 0 01-6 6h-1a6 6 0 01-6-6z"/><path d="M17 11h1a3 3 0 010 6h-1M8 3v3M12 3v3"/>'),
    feu: icone('<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7z"/>'),
    cloche: icone('<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0"/>'),
    sac_pret: icone('<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 016 0v2M9.5 14l2 2 3-4"/>'),
    table: icone('<path d="M3 9h18M5 9v11M19 9v11M8 9V5h8v4"/>'),
    instagram: icone('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>'),
    coeur: icone('<path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/>'),
    poubelle: icone('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    telephone: icone('<path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/>'),
    calendrier: icone('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    pause: icone('<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>'),
    lecture: icone('<path d="M7 5l12 7-12 7z"/>'),
    soleil: icone('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>')
  };

  racine.MINUBU_ART = ART;
})(this);
