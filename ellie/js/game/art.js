/* SVG-компоненты игры: сцена с коробкой и отдельные детали подарка.
   Всё рисуется вектором, поэтому сцена одинаково чёткая на любом экране. */
(function (App) {
  'use strict';

  var SPARKLE = 'M0 -1C.14 -.14 .14 -.14 1 0C.14 .14 .14 .14 0 1C-.14 .14 -.14 .14 -1 0C-.14 -.14 -.14 -.14 0 -1Z';
  var HEART = 'M12 20.3l-1.45-1.32C5.4 14.25 2 11.16 2 7.4 2 4.42 4.42 2 7.4 2c1.74 0 3.41.81 4.6 2.09C13.19 2.81 14.86 2 16.6 2 19.58 2 22 4.42 22 7.4c0 3.76-3.4 6.85-8.55 11.59L12 20.3z';

  /* Фоновые блёстки: x, y, размер, задержка мерцания. */
  var GLITTER = [
    { x: 44, y: 58, s: 9, d: 0 },
    { x: 318, y: 40, s: 7, d: 1.2 },
    { x: 306, y: 248, s: 6, d: 2.3 },
    { x: 58, y: 322, s: 8, d: .7 },
    { x: 198, y: 112, s: 6, d: 1.8 },
    { x: 138, y: 398, s: 7, d: 2.7 }
  ];

  function defs() {
    return [
      '<defs>',
      '<radialGradient id="bg-glow" cx="50%" cy="46%" r="58%">',
      '<stop offset="0%" stop-color="#fff7fb"/>',
      '<stop offset="58%" stop-color="#ffedf5" stop-opacity=".7"/>',
      '<stop offset="100%" stop-color="#ffedf5" stop-opacity="0"/>',
      '</radialGradient>',
      '<radialGradient id="bg-ground" cx="50%" cy="50%" r="50%">',
      '<stop offset="0%" stop-color="#d989ab" stop-opacity=".34"/>',
      '<stop offset="100%" stop-color="#d989ab" stop-opacity="0"/>',
      '</radialGradient>',
      '<linearGradient id="box-body" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="#f7adc6"/>',
      '<stop offset="100%" stop-color="#e2819f"/>',
      '</linearGradient>',
      '<linearGradient id="box-inner" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="#b46d8d"/>',
      '<stop offset="100%" stop-color="#d38fab"/>',
      '</linearGradient>',
      '<linearGradient id="deco-gold" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="#ffe191"/>',
      '<stop offset="100%" stop-color="#edb247"/>',
      '</linearGradient>',
      '<radialGradient id="zone-tint" cx="50%" cy="50%" r="62%">',
      '<stop offset="0%" stop-color="#ff7ba6" stop-opacity=".85"/>',
      '<stop offset="60%" stop-color="#f0729e" stop-opacity=".55"/>',
      '<stop offset="100%" stop-color="#e9719a" stop-opacity=".15"/>',
      '</radialGradient>',
      '</defs>'
    ].join('');
  }

  function glitter() {
    var out = '<g class="scene__glitter" aria-hidden="true">';
    GLITTER.forEach(function (s) {
      out += '<g class="scene__sparkle" style="--d:' + s.d + 's" transform="translate(' + s.x + ' ' + s.y +
        ') scale(' + s.s + ')"><path d="' + SPARKLE + '" fill="url(#deco-gold)" opacity=".9"/></g>';
    });
    return out + '</g>';
  }

  /* Коробка — основа композиции, детали игрок кладёт поверх неё. */
  function gift() {
    return [
      '<g class="scene__gift">',
      '<rect class="gift__box" x="102" y="206" width="156" height="112" rx="17" fill="url(#box-body)"/>',
      '<rect class="gift__inner" x="109" y="206" width="142" height="12" rx="6" fill="url(#box-inner)"/>',
      '<rect class="gift__shine" x="120" y="236" width="11" height="62" rx="5.5" fill="#ffffff" opacity=".22"/>',
      '<rect class="gift__edge" x="112" y="299" width="136" height="14" rx="7" fill="#c96f92" opacity=".18"/>',
      '</g>'
    ].join('');
  }

  /* Зоны приёма строятся из того же конфига, что и детали, — они не могут
     разойтись между собой. */
  function zones(items) {
    var out = '<g class="zones" aria-hidden="true">';
    items.forEach(function (item) {
      var x = item.target.x - item.zone.w / 2;
      var y = item.target.y - item.zone.h / 2;
      var rx = Math.round(Math.min(item.zone.w, item.zone.h) * .3);
      out += '<rect class="zone" data-zone="' + item.id + '" x="' + x + '" y="' + y +
        '" width="' + item.zone.w + '" height="' + item.zone.h + '" rx="' + rx + '"/>';
    });
    return out + '</g>';
  }

  function scene(items) {
    var board = App.config.board;
    return '<svg class="scene-svg" viewBox="0 0 ' + board.w + ' ' + board.h +
      '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">' +
      defs() +
      '<rect class="scene__backdrop" x="0" y="0" width="' + board.w + '" height="' + board.h + '" fill="url(#bg-glow)"/>' +
      '<ellipse class="scene__ground" cx="180" cy="331" rx="113" ry="21" fill="url(#bg-ground)"/>' +
      glitter() +
      gift() +
      zones(items) +
      '</svg>';
  }

  var PIECES = {
    /* Крышка коробки: светлее коробки и чуть шире её. */
    lid: [
      '<svg viewBox="0 0 176 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
      '<defs><linearGradient id="lid-fill" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="#ffcddd"/><stop offset="100%" stop-color="#f0a1c1"/>',
      '</linearGradient></defs>',
      '<rect x="0" y="0" width="176" height="34" rx="13" fill="url(#lid-fill)"/>',
      '<rect x="9" y="23" width="158" height="9" rx="4" fill="#d98aac" opacity=".32"/>',
      '<rect x="12" y="5" width="112" height="8" rx="4" fill="#ffffff" opacity=".38"/>',
      '</svg>'
    ].join(''),

    /* Лента: горизонтальный градиент даёт объём. */
    ribbon: [
      '<svg viewBox="0 0 30 136" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
      '<defs><linearGradient id="ribbon-fill" x1="0" y1="0" x2="1" y2="0">',
      '<stop offset="0%" stop-color="#9380c8"/><stop offset="45%" stop-color="#bca7ec"/>',
      '<stop offset="100%" stop-color="#8674b8"/>',
      '</linearGradient></defs>',
      '<rect x="0" y="0" width="30" height="136" rx="4" fill="url(#ribbon-fill)"/>',
      '<rect x="5" y="0" width="6" height="136" fill="#ffffff" opacity=".22"/>',
      '</svg>'
    ].join(''),

    /* Та же лента, но поперёк коробки. */
    ribbonH: [
      '<svg viewBox="0 0 160 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
      '<defs><linearGradient id="ribbonh-fill" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="#9380c8"/><stop offset="45%" stop-color="#bca7ec"/>',
      '<stop offset="100%" stop-color="#8674b8"/>',
      '</linearGradient></defs>',
      '<rect x="0" y="0" width="160" height="28" rx="4" fill="url(#ribbonh-fill)"/>',
      '<rect x="0" y="5" width="160" height="6" fill="#ffffff" opacity=".22"/>',
      '</svg>'
    ].join(''),

    /* Бантик: две петли, узел и короткие хвостики. */
    bow: [
      '<svg viewBox="0 0 64 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
      '<defs><linearGradient id="bow-fill" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="#c6b2f2"/><stop offset="100%" stop-color="#8b78bd"/>',
      '</linearGradient></defs>',
      '<path d="M29 25l-6 11 7-2 4.5-7z" fill="#8b78bd"/>',
      '<path d="M35 25l6 11-7-2-4.5-7z" fill="#8b78bd"/>',
      '<ellipse cx="17" cy="20" rx="14.5" ry="11" fill="url(#bow-fill)" transform="rotate(-12 17 20)"/>',
      '<ellipse cx="47" cy="20" rx="14.5" ry="11" fill="url(#bow-fill)" transform="rotate(12 47 20)"/>',
      '<ellipse cx="15" cy="17.5" rx="7" ry="4.4" fill="#ffffff" opacity=".22" transform="rotate(-12 15 17.5)"/>',
      '<ellipse cx="45" cy="17.5" rx="7" ry="4.4" fill="#ffffff" opacity=".22" transform="rotate(12 45 17.5)"/>',
      '<rect x="25.5" y="13" width="13" height="14.5" rx="6" fill="#7d6ab2"/>',
      '<circle cx="32" cy="18.5" r="2.1" fill="#f6d67a"/>',
      '</svg>'
    ].join(''),

    /* Сердечко-наклейка. */
    heart: [
      '<svg viewBox="0 0 46 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
      '<defs><linearGradient id="heart-fill" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="#ff9db8"/><stop offset="100%" stop-color="#e0406f"/>',
      '</linearGradient></defs>',
      '<path d="' + HEART + '" fill="url(#heart-fill)" transform="translate(2.2 1.4) scale(1.72)"/>',
      '<ellipse cx="15" cy="12" rx="4.6" ry="2.8" fill="#ffffff" opacity=".38" transform="rotate(-24 15 12)"/>',
      '</svg>'
    ].join(''),

    /* Ярлычок с дырочкой. */
    tag: [
      '<svg viewBox="0 0 54 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
      '<defs><linearGradient id="tag-fill" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="#fffdf8"/><stop offset="100%" stop-color="#ffe9dd"/>',
      '</linearGradient></defs>',
      '<g transform="rotate(-6 27 18)">',
      '<rect x="7" y="4" width="44" height="28" rx="7" fill="url(#tag-fill)" stroke="#f0c7d6" stroke-width="1.4"/>',
      '<circle cx="15" cy="18" r="3.4" fill="#ffd6e5"/>',
      '<circle cx="15" cy="18" r="1.4" fill="#e9719a"/>',
      '<path d="M24 14h19M24 20.5h12" stroke="#e9cfd9" stroke-width="2.2" stroke-linecap="round"/>',
      '</g>',
      '</svg>'
    ].join(''),

    /* Открытка: кремовая карточка с записочкой и сердечком. */
    card: [
      '<svg viewBox="0 0 64 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
      '<defs><linearGradient id="card-fill" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="#fffdf9"/><stop offset="100%" stop-color="#ffeee5"/>',
      '</linearGradient></defs>',
      '<g transform="rotate(-3 32 26)">',
      '<rect x="2" y="6" width="60" height="40" rx="8" fill="url(#card-fill)" stroke="#f5cede" stroke-width="1.4"/>',
      '<rect x="17" y="3" width="30" height="9" rx="3" fill="#ffd6e5" opacity=".95" transform="rotate(-5 32 7.5)"/>',
      '<path d="M14 22h18M14 28.5h12" stroke="#f2d3de" stroke-width="2.4" stroke-linecap="round"/>',
      '<path d="' + HEART + '" fill="#e9719a" transform="translate(38 17) scale(.62)"/>',
      '</g>',
      '</svg>'
    ].join(''),

    /* Звёздочка-блик. */
    star: [
      '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
      '<defs>',
      '<radialGradient id="star-halo" cx="50%" cy="50%" r="50%">',
      '<stop offset="0%" stop-color="#ffe6a3" stop-opacity=".7"/>',
      '<stop offset="100%" stop-color="#ffe6a3" stop-opacity="0"/>',
      '</radialGradient>',
      '<linearGradient id="star-fill" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="#ffeaa6"/><stop offset="100%" stop-color="#eeb247"/>',
      '</linearGradient>',
      '</defs>',
      '<circle cx="30" cy="28" r="26" fill="url(#star-halo)"/>',
      '<path d="M30 4Q31.5 25.5 53 27Q31.5 28.5 30 50Q28.5 28.5 7 27Q28.5 25.5 30 4Z" fill="url(#star-fill)"/>',
      '<path d="M44 34Q45 41 52 42Q45 43 44 50Q43 43 36 42Q43 41 44 34Z" fill="#ffe08a"/>',
      '</svg>'
    ].join('')
  };

  App.art = {
    scene: function () {
      return scene(App.config.items);
    },

    piece: function (id) {
      return PIECES[id] || '';
    }
  };
})(window.BirthdayGame);
