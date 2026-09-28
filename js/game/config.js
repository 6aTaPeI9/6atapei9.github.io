/* Данные игры «Собери подарок».
   Координаты заданы в дизайн-единицах доски (360 × 440), а не в пикселях
   экрана — поэтому сцена одинаково выглядит на любом устройстве, а зоны
   приёма деталей всегда совпадают со своими местами в SVG. */
window.BirthdayGame = window.BirthdayGame || {};

(function (App) {
  'use strict';

  App.config = {
    board: { w: 360, h: 440 },

    /* Куда ведёт кнопка «Открыть подарок». */
    route: { gift: '/congratulations' },

    theme: {
      confetti: ['#f7a8c4', '#e9719a', '#c9a7e8', '#8b7bb8', '#f2c94c', '#f4b183', '#d9536f', '#9be2c6']
    },

    /* Порядок в массиве = порядок слоёв: горизонтальная лента уходит под
       вертикальную, бантик ложится поверх лент, сердечко — поверх крышки. */
    items: [
      {
        id: 'lid',
        art: 'lid',
        aria: 'Крышка. Перетащи её на верх коробки.',
        size: { w: 176, h: 34 },
        home: { x: 112, y: 392, rot: -7 },
        target: { x: 180, y: 200 },
        zone: { w: 190, h: 78 }
      },
      {
        id: 'ribbonH',
        art: 'ribbonH',
        aria: 'Вторая лента. Оберни ею коробку поперёк.',
        size: { w: 160, h: 28 },
        home: { x: 180, y: 90, rot: -4 },
        target: { x: 180, y: 262 },
        zone: { w: 176, h: 46 }
      },
      {
        id: 'ribbon',
        art: 'ribbon',
        aria: 'Лента. Перетащи её на коробку.',
        size: { w: 30, h: 136 },
        home: { x: 40, y: 250, rot: 6 },
        target: { x: 180, y: 251 },
        zone: { w: 58, h: 96 }
      },
      {
        id: 'bow',
        art: 'bow',
        aria: 'Бантик. Перетащи его на крышку.',
        size: { w: 64, h: 46 },
        home: { x: 66, y: 84, rot: -10 },
        target: { x: 180, y: 192 },
        zone: { w: 124, h: 92 }
      },
      {
        id: 'heart',
        art: 'heart',
        aria: 'Сердечко. Приклей его на крышку.',
        size: { w: 46, h: 42 },
        home: { x: 296, y: 190, rot: -8 },
        target: { x: 236, y: 200 },
        zone: { w: 72, h: 66 }
      },
      {
        id: 'card',
        art: 'card',
        aria: 'Открытка. Положи её рядом с подарком.',
        size: { w: 64, h: 50 },
        home: { x: 296, y: 118, rot: 9 },
        target: { x: 288, y: 306 },
        zone: { w: 96, h: 84 }
      },
      {
        id: 'tag',
        art: 'tag',
        aria: 'Ярлычок. Прикрепи его к коробке.',
        size: { w: 54, h: 36 },
        home: { x: 44, y: 355, rot: 10 },
        target: { x: 128, y: 300 },
        zone: { w: 78, h: 62 }
      },
      {
        id: 'star',
        art: 'star',
        aria: 'Звёздочка. Добавь её к подарку.',
        size: { w: 60, h: 60 },
        home: { x: 300, y: 372, rot: 12 },
        target: { x: 74, y: 146 },
        zone: { w: 88, h: 84 }
      }
    ]
  };
})(window.BirthdayGame);
