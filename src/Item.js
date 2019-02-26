import { prop } from './util.js';

// Model
// 블록 한칸의 좌표, 타입, 선택 여부
const Item = class {
  static GET(type, x, y) {
    return new Item(type, x, y);
  }
  constructor(_type, _x, _y) {
    prop(this, { _type, _x, _y, _selected: false, _prev: null });
  }

  // get 함수.
  get type() {
    return this._type;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get selected() {
    return this._selected;
  }
  get prev() {
    return this._prev;
  }
  //

  pos(x, y) {
    this._x = x;
    this._y = y;
  }
  select(prev) {
    this._selected = true;
    this._prev = prev;
  }
  unselect() {
    this._selected = false;
    this._prev = null;
  }
  // 아이템이 이미 선택된 아이템인지 아닌지 검사.
  isSelectedList(item) {
    // 선택된 아이템이 더이상 없다 -> 해당 아이템은 기존에 선택되지 않았다.
    if (!this._prev) return false; 
    // 해당 아이템은 기존에 선택되었다.
    if (this._prev === item) return true;
    // 난 모르겠다. 선택된 아이템들을 따라가봐라.
    else return this._prev.isSelectedList(item); 
  }
  isBorder(item) {
    return Math.abs(this._x - item._x) < 2 && Math.abs(this._y - item._y) < 2;
  }
};

export default Item;
