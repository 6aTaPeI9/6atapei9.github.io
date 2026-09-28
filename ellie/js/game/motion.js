/* Единая точка правды про prefers-reduced-motion. */
(function (App) {
  'use strict';

  var query = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  App.motion = {
    isReduced: function () {
      return !!(query && query.matches);
    },

    onChange: function (handler) {
      if (!query) return;
      if (query.addEventListener) query.addEventListener('change', handler);
      else if (query.addListener) query.addListener(handler);
    }
  };
})(window.BirthdayGame);
