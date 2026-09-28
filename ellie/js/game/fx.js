/* Праздничные эффекты: конфетти и парящие сердечки.
   Частицы живут в отдельном слое поверх страницы и убираются сами. */
(function (App) {
  'use strict';

  var layer = null;
  var GLYPHS = ['♥', '✦', '♡', '♥', '✦'];

  function reduced() {
    return App.motion.isReduced();
  }

  function ensureLayer() {
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'fx-layer';
      document.body.appendChild(layer);
    }
    return layer;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function spawnParticle(host, x, y, power) {
    var colors = App.config.theme.confetti;
    var size = rand(5, 11) * power;
    var particle = document.createElement('span');
    particle.className = 'fx-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = size + 'px';
    particle.style.height = size * rand(.7, 1.5) + 'px';
    particle.style.background = pick(colors);
    if (Math.random() < .4) particle.style.borderRadius = '50%';
    host.appendChild(particle);

    var angle = rand(0, Math.PI * 2);
    var distance = rand(46, 150) * power;
    var dx = Math.cos(angle) * distance;
    var lift = -Math.abs(Math.sin(angle)) * distance * .75 - rand(18, 70);
    var spin = rand(-420, 420);

    var animation = particle.animate([
      { transform: 'translate(-50%, -50%) scale(.35) rotate(0deg)', opacity: 1 },
      {
        transform: 'translate(calc(-50% + ' + dx * .6 + 'px), calc(-50% + ' + lift + 'px)) rotate(' +
          spin * .5 + 'deg) scale(1)',
        opacity: 1,
        offset: .45
      },
      {
        transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + (lift + distance) +
          'px)) rotate(' + spin + 'deg) scale(.85)',
        opacity: 0
      }
    ], { duration: rand(900, 1500), easing: 'cubic-bezier(.25,.6,.35,1)', fill: 'forwards' });

    animation.onfinish = function () { particle.remove(); };
  }

  function spawnGlyph(host, x, y, index) {
    var glyph = document.createElement('span');
    glyph.className = 'fx-glyph';
    glyph.textContent = pick(GLYPHS);
    glyph.style.color = pick(App.config.theme.confetti);
    glyph.style.fontSize = rand(14, 26).toFixed(0) + 'px';
    glyph.style.left = (x + rand(-72, 72)).toFixed(0) + 'px';
    glyph.style.top = (y + rand(-16, 44)).toFixed(0) + 'px';
    host.appendChild(glyph);

    var drift = rand(-34, 34);
    var rise = rand(90, 190);

    var animation = glyph.animate([
      { transform: 'translate(-50%, -50%) scale(.55)', opacity: 0 },
      {
        transform: 'translate(calc(-50% + ' + drift * .5 + 'px), calc(-50% - ' + rise * .45 + 'px)) scale(1)',
        opacity: 1,
        offset: .35
      },
      {
        transform: 'translate(calc(-50% + ' + drift + 'px), calc(-50% - ' + rise + 'px)) scale(.9)',
        opacity: 0
      }
    ], { duration: rand(1500, 2200), delay: index * 90, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' });

    animation.onfinish = function () { glyph.remove(); };
  }

  App.fx = {
    /* Салют из конфетти в точке экрана. */
    burst: function (x, y, options) {
      if (reduced()) return;
      var opts = options || {};
      var count = opts.count || 16;
      var power = opts.power || 1;

      var spawn = function () {
        var host = ensureLayer();
        for (var i = 0; i < count; i++) spawnParticle(host, x, y, power);
      };

      if (opts.delay) window.setTimeout(spawn, opts.delay);
      else spawn();
    },

    /* Парящие сердечки и звёздочки. */
    glyphs: function (x, y, options) {
      if (reduced()) return;
      var opts = options || {};
      var count = opts.count || 6;
      var host = ensureLayer();
      for (var i = 0; i < count; i++) spawnGlyph(host, x, y, i);
    }
  };
})(window.BirthdayGame);
