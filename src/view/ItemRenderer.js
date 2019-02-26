//서브렌더러
export const ItemRenderer = class {
  get Object() { throw 'override'; } // 네이티브 객체 반환
  find(v) { throw 'override'; } // 네이티브 객체 찾기.
  remove() { return this._remove(); }
  move() { return this._move(); }
  render(x, y, type, selected) { this._render(x, y, type, selected); }
  _remove() { throw 'override'; }
  _move() { throw 'override'; }
  _render(x, y, type, selected) { throw 'override'; }
}