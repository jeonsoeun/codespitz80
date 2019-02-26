import { Game } from './Game.js';
import { SectionRenderer } from './view/SectionRenderer.js';
import { DivRenderer } from './view/DivRenderer.js';
const game = new Game({
  column: 6,
  row: 6,
  itemType: '01234'.split(''),
  renderer: new SectionRenderer({
    stage: '#stage',
    bg: '../img/bg01.gif',
    img: '../img/tower.png',
    w: 400,
    h: 160,
    r: 2,
    c: 5,
    itemFactory: (parent, bw, bh, img) => new DivRenderer(parent, bw, bh, img)
  })
});
