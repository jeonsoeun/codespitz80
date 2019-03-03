//서브렌더러
const ItemRenderer = class {
  get Object() {
    throw 'override';
  } // 네이티브 객체 반환
  find(v) {
    throw 'override';
  } // 네이티브 객체 찾기.
  remove() {
    return this._remove();
  }
  move() {
    return this._move();
  }
  render(x, y, type, selected) {
    this._render(x, y, type, selected);
  }
  _remove() {
    throw 'override';
  }
  _move() {
    throw 'override';
  }
  _render(x, y, type, selected) {
    throw 'override';
  }
};

//렌더러
const Renderer = class extends ThrowSet {
  constructor(itemFactory) {
    super();
    prop(this, {
      _itemFactory: itemFactory,
      msg2item: new WeakMap(),
      item2msg: new WeakMap()
    });
  }
  setGame(_game, _row, _col) {
    prop(this,{ _game, _row, _col});
  }
  activate() {
    throw 'override';
  }
  deactivate() {
    throw 'override';
  }
  add(msg) {
    const { msg2item, item2msg, _itemFactory } = this;
    const item = _itemFactory(this, this.bw, this.bh, this.img);
    super.add(item);
    msg2item.set(msg, item);
    item2msg.set(item, msg);
    this._add(item);
  }
  _add(v) {
    throw 'override';
  }
  remove(msgs) {
    if (!msgs.length) return;
    const { msg2item } = this;
    return Promise.all(
      msgs.map(msg => {
        const item = msg2item.get(msg);
        msg2item.delete(msg);
        this._delete(item);
        return item.remove();
      })
    );
  }
  _delete(item) {
    this.item2msg.delete(item);
    super.delete(item);
    this._remove(item);
  }
  _remove(item) {
    throw 'override!';
  }
  move(msg) {
    const { x, y } = msg.pos();
    return this.msg2item.get(msg).move(x, y);
  }
  itemStart(item) {
    this._gameRequest(this._game.selectStart, item);
  }
  itemNext(item) {
    this._gameRequest(this._game.selectNext, item);
  }
  itemEnd() {
    this._gameRequest(this._game.selectEnd);
  }
  _gameRequest(f, item) {
    const { _game: game, item2msg } = this;
    console.log(item)
    if (item) f.call(game, item2msg.get(item));
    else f.call(game);
  }
  _renderLoop() {
    const { _game: game, item2msg } = this;
    this.forEach(item => {
      const { x, y, type, selected } = game.getInfo(item2msg.get(item)).info(); // #lecture 2 : 오류 수정. get(v) -> get(item)
      item.render(x, y, type, selected);
    });
    this._render();
  }
  _render() {
    throw 'override';
  }
};
