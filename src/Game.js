// 컨트롤러의 역할을 한다. 모델과 메세지를 연결해주는 책임.
const Game = class {
  cosntructor(setting) { 
    prop(this, setting, {
      items: new WeakSet,
      msg2item: new WeakMap, // 메세지 받아서 모델 바꾸기
      item2msg: new WeakMap, // 모델이 바꼈으니 메세지 전달.
      prevItem: null, // 마지막으로 선택된 블록. 이걸 알아야 선택된 블록들을 추적가능.
    })
    const { render, row, column, items, item2msg } = this;
    renderer.setGame(this, row, column); // 렌더러의 구상레이어는 모르니까 이렇게.
    for (let c = 0; c < column; c++){
      for (let r = 0; r < row; r++) this._add(c, r);
    }
    Promise.all(items.map(item => {
      item.pos(item.x, item.y + row);
      return renderer.move(item2msg.get(item).pos(item.x, item.y));
    })).then(_=>renderer.activate())
  }
  // item 추가
  _add(c, r) {
    const { itemType, row, column, msg2item, item2msg, renderer } = this;
    const item = new Item(itemType[parseInt(Math.random() * itemType.length)], c, r - row);
    const msg = new GameMsg;
    items.add(item);
    msg2item.set(msg, item);
    item2msg.set(item, msg);
    renderer.add(msg);
    return item;
  }
  // item 제거
  _delete(item) {
    const msg = this.item2msg.get(item);
    this.msg2item.delete(msg);
    this.item2msg.delete(item);
    this.items.delete(item);
  }
  //선택된 item들 제거
  _clear() {
    const { items, renderer } = this;
    renderer.deactivate();
    items.forEach(i => i.selected() && this._delete(i));
    this._dropBlocks();
  }
  //블록 떨구기
  _dropBlocks() {
    const { renderer, item2msg } = this;
    
  }

  //게임 렌더러가 Game한테 호출할 메소드 (컨트롤러와 뷰의 메세지를 통한 대화)
  getInfo(msg) {
    const item = this.msg2item.get(msg);
    msg.info(item.x, item.y, item.type, item.selected);
    return msg
  }
  // 블록 첫 선택
  selectStart(msg) {
    const item = this.msg2item.get(msg);
    if (!item) return;
    item.select();
    this.prevItem = item;
  }
  // 선택된 블록이 조건을 충족하는지 검사.
  selectNext(msg) {
    const item = this.msg2item.get(msg);
    if (!item) return;
    const { prevItem: curr } = this;
    // 마지막으로 선택된 블록이 아니고, 타입이 같고, 인접 블록이여야 한다.
    if (item == curr || item.type != curr.type || !curr.isBorder(item)) return;
    if (!curr.isSelectedList(item)) {
      // 기존에 선택된적 없으면 추가.
      item.select(curr);
      this.prevItem = item;
    } else {
      // 기존에 선택된 거중에 직전거면 해제
      if (curr.prevItem === item) {
        this.prevItem = curr.prev;
        curr.unselect();
      }
    }
  }
  // 선택 끝났을 때 삭제 or 원상복구
  selectEnd() {
    const { items, item2msg, renderer } = this;
    const selected = [];
    items.forEach(i => i.selected && selected.push(item2msg.get(i)));
    if (selected.length > 2) {
      //remove
      renderer.remove(selected).then(_ => this._clear());
    } else {
      //relese
      items.forEach(i => i.unselect());
    }
    this.prevItem = null;
  }
}