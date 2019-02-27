import { Renderer } from './Renderer.js';
import { el, prop } from '../util.js';
export const SectionRenderer = class extends Renderer {
  constructor({ stage, bg, w, h, c, r, img, itemFactory }) {
    super(itemFactory);
    stage = el(stage);
    const bw = parseInt(w / c),
      bh = parseInt(h / r),
      _q = [];
    // prettier-ignore
    prop(this, { stage, bw, bh, w, h, c, r, img, isdown: false, _q, isAct: null, curr: 0 });
    stage.style.cssText = `width:${w}px;height:${h}px;
      background-image:url('${bg}');
      background-size:${bw}px ${bh}px`;
    stage.setAttribute('unselectable', 'on');
    stage.setAttribute('onselectstart', 'return false');
    const f = t => {
      this.curr = t;
      for (let i = _q.length; i--; ) {
        const task = _q[i];
        if (task.t <= t) {
          _q.splice(i, 1);
          task.f();
        }
      }
      this._renderLoop();
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  delayTask(f, time) {
    this._q.push({ f, t: this.curr + time });
  }
  activate() {
    const { stage } = this;
    if (this.isAct === null) {
      stage.addEventListener('mousedown', e => this.isAct && this.dragDown(e));
      stage.addEventListener('mouseup', e => this.isAct && this.dragUp(e));
      stage.addEventListener('mouseleave', e => this.isAct && this.dragUp(e));
      stage.addEventListener('mousemove', e => this.isAct && this.dragMove(e));
    }
    this.isAct = true;
  }
  deactivate() {
    this.isAct = false;
  }
  _add(item) {
    this.stage.appendChild(item.object);
  }
  _remove(item) {
    this.stage.removeChild(item.object);
  }
  _render() {}
  _getItem(x, y) {
    const el = document.elementFromPoint(x, y);
    return this.some(v => v.find(el));
  }
  dragDown({ pageX: x, pageY: y }) {
    const item = this._getItem(x, y);
    if (!item) return;
    this.isdown = true;
    this.itemStart(item);
  }
  dragMove({ pageX: x, pageY: y }) {
    const { isdown } = this;
    if (!isdown) return;
    const item = this._getItem(x, y);
    if (item) this.itemNext(item);
  }
  dragUp({ pageX: x, pageY: y }) {
    const { isdown } = this;
    if (!isdown) return;
    this.isdown = false;
    this.itemEnd();
  }
};
