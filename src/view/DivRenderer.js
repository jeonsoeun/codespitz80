import { ItemRenderer } from './ItemRenderer.js'
//구상 렌더러.
export const DivRenderer = class extends ItemRenderer{
  constructor(_parent, bw, bh, img) {
    prop(this, { _parent, img, bw, bh, div });
    const div = el('div');
    div.className = 'block';
    div.style.cssText = `width:${bw}px;height:${bh}px;backgroundImage:url(${img})`;
  }
  get object() { return this.div; }
  find(el) { return el == this.div; }
  _remove() {
    const { div, _parent: parent } = this;
    return new Promise((resolve, reject) => {
      div.style.transition = "transform ease-in 350ms";
      div.style.transform = "scale(0,0)";
      parent.delayTask(resolve, 350);
    })
  }
  _move(x, y) {
    const { div, bw, bh, _parent: parent } = this;
    return new Promise((resolve, reject) => {
      const time = (y * bh - parseInt(div.style.top)) / bh * 100;
      div.style.transition = `top ease-in ${time}ms`;
      parent.delayTask(resolve, time);
    });
  }
  _render(x, y, type, selected) {
    const { div, bw, bh, img } = this;
    div.style.left = bw * x + "px";
    div.style.top = bh * y + "px";
    div.style.backgroundPosition = -(bw * type) + "px";
    div.style.backgroundPositionY = (selected ? -bh/2 : 0) + "px";
  }
}