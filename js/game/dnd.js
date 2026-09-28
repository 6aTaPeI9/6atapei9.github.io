/* Перетаскивание через Pointer Events: одинаково работает мышью,
   пальцем и стилусом. Пока указатель нажат — события приходят на саму
   деталь благодаря pointer capture, даже если палец уехал за экран. */
(function (App) {
  'use strict';

  var DRAG_THRESHOLD = 6; /* px: меньше — считаем нажатием, а не перетаскиванием */

  var active = null;

  function schedule(session) {
    if (session.frame) return;
    session.frame = window.requestAnimationFrame(function () {
      session.frame = 0;
      if (active === session && session.moved) session.handlers.onDrag(session);
    });
  }

  function finish(session, cancelled) {
    if (active !== session) return;
    active = null;

    if (session.frame) window.cancelAnimationFrame(session.frame);
    session.frame = 0;

    session.el.removeEventListener('pointermove', session.onMove);
    session.el.removeEventListener('pointerup', session.onUp);
    session.el.removeEventListener('pointercancel', session.onCancel);

    if (session.el.hasPointerCapture && session.el.hasPointerCapture(session.pointerId)) {
      try {
        session.el.releasePointerCapture(session.pointerId);
      } catch (error) {
        /* указатель уже отпущен браузером */
      }
    }

    if (cancelled) session.handlers.onCancel(session);
    else session.handlers.onDrop(session);
  }

  App.dnd = {
    attach: function (el, handlers) {
      el.addEventListener('pointerdown', function (event) {
        if (active) return; /* одну деталь за раз — этого достаточно */
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (el.dataset.placed === 'true') return;

        var session = {
          el: el,
          handlers: handlers,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          x: event.clientX,
          y: event.clientY,
          dx: 0,
          dy: 0,
          base: null,
          moved: false,
          frame: 0
        };

        session.onMove = function (moveEvent) {
          if (moveEvent.pointerId !== session.pointerId) return;
          session.x = moveEvent.clientX;
          session.y = moveEvent.clientY;
          session.dx = moveEvent.clientX - session.startX;
          session.dy = moveEvent.clientY - session.startY;

          if (!session.moved && Math.abs(session.dx) + Math.abs(session.dy) > DRAG_THRESHOLD) {
            session.moved = true;
            handlers.onStart(session);
          }

          if (session.moved) schedule(session);
        };

        session.onUp = function (upEvent) {
          if (upEvent.pointerId !== session.pointerId) return;
          finish(session, false);
        };

        session.onCancel = function (cancelEvent) {
          if (cancelEvent.pointerId !== session.pointerId) return;
          finish(session, true);
        };

        active = session;
        el.addEventListener('pointermove', session.onMove);
        el.addEventListener('pointerup', session.onUp);
        el.addEventListener('pointercancel', session.onCancel);

        try {
          el.setPointerCapture(session.pointerId);
        } catch (error) {
          /* синтетические события в тестах: capture не нужен */
        }
      });
    },

    isDragging: function () {
      return !!active;
    },

    cancel: function () {
      if (active) finish(active, true);
    }
  };
})(window.BirthdayGame);
