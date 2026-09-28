/* Точка входа: запускаем игру и подключаем переход на страницу поздравления. */
(function (App) {
  'use strict';

  function onReady(handler) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', handler);
    else handler();
  }

  function setupNavigation() {
    var link = document.querySelector('[data-nav]');
    if (!link) return;

    /* При открытии файла напрямую (file://) абсолютный маршрут не работает,
       поэтому ведём на ту же страницу по относительному пути. */
    if (window.location.protocol === 'file:') {
      link.setAttribute('href', App.config.route.gift.replace(/^\/+/, '').replace(/\/?$/, '/') + 'index.html');
    }

    link.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== undefined && event.button !== 0) return;
      if (App.motion.isReduced()) return;

      event.preventDefault();
      document.body.classList.add('is-leaving');
      window.setTimeout(function () {
        window.location.href = link.href;
      }, 340);
    });
  }

  onReady(function () {
    App.game.init();
    setupNavigation();
  });
})(window.BirthdayGame);
