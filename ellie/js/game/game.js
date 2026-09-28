/* Логика игры: сборка сцены, перетаскивание деталей, прогресс и финал.
   Все проверки попадания считаются от реальных прямоугольников элементов
   (getBoundingClientRect), поэтому работают при любом размере экрана. */
(function (App) {
  'use strict';

  var config = App.config;
  var BW = config.board.w;
  var BH = config.board.h;

  var DRAG_SCALE = 1.06;
  var CLAMP_PADDING = 28; /* деталь может чуть выйти за доску, но не улететь */

  var state = {
    placed: [],
    completed: false
  };

  var dom = {};
  var pieces = {};
  var zones = {};
  var boardRect = null;
  var resizeTimer = 0;
  var hintVisible = true;

  /* --- геометрия -------------------------------------------------------- */

  function measure() {
    boardRect = dom.board.getBoundingClientRect();
  }

  function homeCenter(item) {
    return {
      x: boardRect.left + item.home.x / BW * boardRect.width,
      y: boardRect.top + item.home.y / BH * boardRect.height
    };
  }

  function centerFor(item, dx, dy) {
    var home = homeCenter(item);
    return { x: home.x + dx, y: home.y + dy };
  }

  function clampToBoard(center) {
    return {
      x: Math.min(Math.max(center.x, boardRect.left - CLAMP_PADDING), boardRect.right + CLAMP_PADDING),
      y: Math.min(Math.max(center.y, boardRect.top - CLAMP_PADDING), boardRect.bottom + CLAMP_PADDING)
    };
  }

  function offsetsFor(item, center) {
    var home = homeCenter(item);
    return { dx: center.x - home.x, dy: center.y - home.y };
  }

  function pctX(value) {
    return (value / BW * 100) + '%';
  }

  function pctY(value) {
    return (value / BH * 100) + '%';
  }

  function applyTransform(el, dx, dy, rot, scale) {
    el.style.transform = 'translate(-50%, -50%) translate(' + dx + 'px, ' + dy + 'px) rotate(' +
      rot + 'deg) scale(' + scale + ')';
  }

  /* Если деталь ещё доезжает после прошлого броска, «замораживаем» её
     на текущем месте и возвращаем текущее смещение — иначе она прыгнет. */
  function freeze(el) {
    var offsets = { dx: 0, dy: 0 };
    var computed = window.getComputedStyle(el).transform;

    if (computed && computed !== 'none') {
      var parsed = computed.match(/matrix\(([^)]+)\)/);
      if (parsed) {
        var parts = parsed[1].split(',');
        offsets.dx = parseFloat(parts[4]) + el.offsetWidth / 2;
        offsets.dy = parseFloat(parts[5]) + el.offsetHeight / 2;
      }
      el.style.transform = computed;
    }

    return offsets;
  }

  function afterTransform(el, callback, timeout) {
    var done = false;

    function finishOnce() {
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timer);
      callback();
    }

    function onEnd(event) {
      if (event.target === el && event.propertyName === 'transform') finishOnce();
    }

    el.addEventListener('transitionend', onEnd);
    var timer = window.setTimeout(finishOnce, timeout);
  }

  /* --- подсказки и прогресс --------------------------------------------- */

  function buildProgress() {
    dom.dots.innerHTML = '';
    for (var i = 0; i < config.items.length; i++) {
      dom.dots.appendChild(document.createElement('li'));
    }
  }

  function updateProgress() {
    var total = config.items.length;
    var done = state.placed.length;
    var dots = dom.dots.children;

    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('is-on', i < done);
    }

    dom.count.textContent = done + '/' + total;
    dom.status.textContent = 'Собрано ' + done + ' из ' + total;
  }

  function hideHint() {
    if (!hintVisible || !dom.hint) return;
    hintVisible = false;
    dom.hint.classList.add('is-hidden');
    dom.hint.setAttribute('aria-hidden', 'true');
  }

  /* --- обратная связь --------------------------------------------------- */

  function setZoneActive(item, active) {
    var zone = zones[item.id];
    if (zone) zone.classList.toggle('is-active', active);
  }

  function clearZoneFeedback() {
    for (var id in zones) {
      if (Object.prototype.hasOwnProperty.call(zones, id) && zones[id]) {
        zones[id].classList.remove('is-active');
      }
    }
  }

  /* Мягкая подсказка, если деталь просто тронули пальцем. */
  function pulseZone(item) {
    var zone = zones[item.id];
    if (!zone || state.placed.indexOf(item.id) !== -1) return;

    zone.classList.remove('is-pulsing');
    zone.getBoundingClientRect();
    zone.classList.add('is-pulsing');
    window.setTimeout(function () { zone.classList.remove('is-pulsing'); }, 1500);
  }

  function isOver(item, center) {
    var zone = zones[item.id];
    if (!zone) return false;

    var rect = zone.getBoundingClientRect();
    var pad = Math.max(4, Math.min(rect.width, rect.height) * .08);

    return center.x >= rect.left - pad && center.x <= rect.right + pad &&
      center.y >= rect.top - pad && center.y <= rect.bottom + pad;
  }

  /* --- установка детали ------------------------------------------------- */

  function place(item, el) {
    var dx = (item.target.x - item.home.x) / BW * boardRect.width;
    var dy = (item.target.y - item.home.y) / BH * boardRect.height;

    el.classList.add('is-snapping');
    el.getBoundingClientRect(); /* фиксируем стартовую точку анимации */
    applyTransform(el, dx, dy, 0, 1);

    var settle = function () { settlePlaced(item, el); };
    if (App.motion.isReduced()) settle();
    else afterTransform(el, settle, 460);
  }

  function settlePlaced(item, el) {
    /* Переносим деталь в её место в разметке — так она остаётся на месте
       после изменения размера окна, а картинка не «прыгает». */
    el.classList.remove('is-snapping');
    el.style.left = pctX(item.target.x);
    el.style.top = pctY(item.target.y);
    applyTransform(el, 0, 0, 0, 1);

    el.classList.add('is-placed');
    el.dataset.placed = 'true';
    el.setAttribute('aria-disabled', 'true');
    el.tabIndex = -1;

    state.placed.push(item.id);

    clearZoneFeedback();
    hideHint();
    updateProgress();
    burstAt(item);

    if (state.placed.length === config.items.length) complete();
  }

  function returnHome(item, el) {
    clearZoneFeedback();
    el.classList.add('is-snapping');
    el.getBoundingClientRect();
    applyTransform(el, 0, 0, item.home.rot, 1);
    afterTransform(el, function () { el.classList.remove('is-snapping'); }, 460);
  }

  function burstAt(item) {
    var zone = zones[item.id];
    if (!zone) return;

    var rect = zone.getBoundingClientRect();
    App.fx.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, { count: 14, power: .8 });
  }

  /* --- финал ------------------------------------------------------------ */

  function complete() {
    if (state.completed) return;
    state.completed = true;

    window.setTimeout(function () {
      dom.board.classList.add('is-celebrating');
      celebrate();
      window.setTimeout(showCompletion, 620);
    }, 420);
  }

  function celebrate() {
    var rect = dom.board.getBoundingClientRect();

    App.fx.burst(rect.left + rect.width * .5, rect.top + rect.height * .44, { count: 26, power: 1.15 });
    App.fx.burst(rect.left + rect.width * .26, rect.top + rect.height * .30, { count: 14, power: .95, delay: 110 });
    App.fx.burst(rect.left + rect.width * .76, rect.top + rect.height * .32, { count: 14, power: .95, delay: 210 });
    App.fx.glyphs(rect.left + rect.width * .5, rect.top + rect.height * .52, { count: 7 });
  }

  function showCompletion() {
    dom.completion.classList.add('is-visible');
    dom.completion.setAttribute('aria-hidden', 'false');

    var cta = dom.completion.querySelector('[data-nav]');
    if (cta && cta.focus) {
      try {
        cta.focus({ preventScroll: true });
      } catch (error) {
        cta.focus();
      }
    }
  }

  /* --- обработчики перетаскивания --------------------------------------- */

  function handleDragStart(item, el, session) {
    measure();
    session.base = freeze(el);
    el.classList.remove('is-snapping');
    el.classList.add('is-dragging');
    dom.board.classList.add('is-dragging');
    clearZoneFeedback();
  }

  function handleDragMove(item, el, session) {
    var base = session.base || { dx: 0, dy: 0 };
    var center = clampToBoard(centerFor(item, base.dx + session.dx, base.dy + session.dy));
    var offsets = offsetsFor(item, center);

    applyTransform(el, offsets.dx, offsets.dy, item.home.rot, DRAG_SCALE);
    setZoneActive(item, isOver(item, center));
  }

  function handleDragDrop(item, el, session) {
    el.classList.remove('is-dragging');
    dom.board.classList.remove('is-dragging');

    /* Жест без движения — это не бросок, а мягкая подсказка:
       подсвечиваем зону, куда деталь должна лечь. */
    if (!session.moved) {
      pulseZone(item);
      return;
    }

    var base = session.base || { dx: 0, dy: 0 };
    var center = clampToBoard(centerFor(item, base.dx + session.dx, base.dy + session.dy));

    if (isOver(item, center)) place(item, el);
    else returnHome(item, el);
  }

  function handleDragCancel(item, el, session) {
    el.classList.remove('is-dragging');
    dom.board.classList.remove('is-dragging');

    if (session.moved) returnHome(item, el);
  }

  function handleKeydown(event, item, el) {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
    if (state.placed.indexOf(item.id) !== -1) return;

    event.preventDefault();
    measure();
    place(item, el);
  }

  function handleResize() {
    if (App.dnd.isDragging()) App.dnd.cancel();

    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(measure, 120);
  }

  /* --- сборка ----------------------------------------------------------- */

  function createPiece(item) {
    var el = document.createElement('button');

    el.type = 'button';
    el.className = 'piece';
    el.dataset.piece = item.id;
    el.setAttribute('aria-label', item.aria);
    el.style.setProperty('--w', item.size.w);
    el.style.setProperty('--ar', item.size.w + ' / ' + item.size.h);
    el.style.setProperty('--delay', (Math.random() * 2.6).toFixed(2) + 's');
    el.style.left = pctX(item.home.x);
    el.style.top = pctY(item.home.y);
    el.innerHTML = '<span class="piece__art">' + App.art.piece(item.art) + '</span>';
    applyTransform(el, 0, 0, item.home.rot, 1);

    el.addEventListener('keydown', function (event) { handleKeydown(event, item, el); });

    App.dnd.attach(el, {
      onStart: function (session) { handleDragStart(item, el, session); },
      onDrag: function (session) { handleDragMove(item, el, session); },
      onDrop: function (session) { handleDragDrop(item, el, session); },
      onCancel: function (session) { handleDragCancel(item, el, session); }
    });

    pieces[item.id] = el;
    dom.pieces.appendChild(el);
  }

  function build() {
    dom.board = document.querySelector('[data-board]');
    if (!dom.board) return;

    dom.scene = dom.board.querySelector('[data-scene]');
    dom.pieces = dom.board.querySelector('[data-pieces]');
    dom.completion = document.getElementById('completion');
    dom.hint = document.getElementById('hint');
    dom.dots = document.getElementById('progressDots');
    dom.count = document.getElementById('progressCount');
    dom.status = document.getElementById('progressStatus');

    dom.scene.innerHTML = App.art.scene();

    config.items.forEach(function (item) {
      zones[item.id] = dom.scene.querySelector('[data-zone="' + item.id + '"]');
    });

    config.items.forEach(createPiece);

    buildProgress();
    measure();
    updateProgress();

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
  }

  App.game = {
    init: build,
    state: state,
    measure: measure
  };
})(window.BirthdayGame);
