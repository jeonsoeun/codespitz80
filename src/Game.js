// 컨트롤러의 역할을 한다. 모델과 메세지를 연결해주는 책임.
const Game = class {
  constructor(setting) {
    prop(this, setting, {
      items: new Set(),
      msg2item: new WeakMap(), // 메세지 받아서 모델 바꾸기
      item2msg: new WeakMap(), // 모델이 바꼈으니 메세지 전달.
      prevItem: null // 마지막으로 선택된 블록. 이걸 알아야 선택된 블록들을 추적가능.
    });
    const { renderer, row, column, items, item2msg } = this;
    renderer.setGame(this, row, column); // 렌더러의 구상레이어는 모르니까 이렇게.
    for (let c = 0; c < column; c++) {
      for (let r = 0; r < row; r++) this._add(c, r);
    }
    Promise.all(
      [...items].map(item => {
        // #lecture2 : 안되는 부분 수정. Set에는 array.map()을 쓸 수없다.
        item.pos(item.x, item.y + row);
        return renderer.move(item2msg.get(item).pos(item.x, item.y));
      })
    ).then(renderer.activate());
  }
  // item 추가
  _add(c, r) {
    const { itemType, items, row, column, msg2item, item2msg, renderer } = this;
    const item = new Item(
      itemType[parseInt(Math.random() * itemType.length)],
      c,
      r - row
    );
    const msg = new GameMsg();
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
    items.forEach(i => i.selected && this._delete(i));
    this._dropBlocks();
  }
  //블록 떨구기. 해당블록이 몇칸 떨어져야되는지 세고 움직임, _fillStart 실행
  _dropBlocks() {
    const { items, row, column, renderer, item2msg } = this;
    const allItems = []; //local 2차원 배열 만들어서 빠르게 카운팅
    for (let i = row; i--; ) allItems.push([]);
    items.forEach(item => (allItems[item.y][item.x] = item));
    const coll = [];
    for (let c = 0; c < column; c++) {
      for (let r = row-1; r > -1; r--) {
        if (allItems[r] && allItems[r][c]) {
          let cnt = 0;
          for (let j = r + 1; j < row; j++) {
            if (allItems[j] && !allItems[j][c]) {
              cnt++;
            }
          }
          if (cnt) {
            const item = allItems[r][c];
            item.pos(c, r + cnt);
            coll.push(renderer.move(item2msg.get(item).pos(item.x, item.y))); // promise수집
          }
        }
      }
    }
    if (coll.length) Promise.all(coll).then(this._fillStart());
    else this._fillStart(); // #lecture2 오류 수정: 첫번째 줄 아이템을 포함해서 선택하면 fill이 안되는 문제 해결.
  }
  //블록 채우기. 빈칸이 몇개인지 세서 그만큼 만들고 떨구기.
  _fillStart() {
    const { items, column, row, renderer, item2msg } = this;
    const allItems = [];
    for (let i = row; i--;) allItems.push([]);
    items.forEach(item => (allItems[item.y][item.x] = item));
    const coll = [];
    for (let c = 0; c < column; c++) {
      for (let r = row - 1; r > -1; r--) {
        if (allItems[r] && !allItems[r][c]) {
          coll.push(this._add(c, r));
        }
      }
    }
    if (!coll.length) return;
    Promise.all(coll.map(item => {
      item.pos(item.x, item.y + row);
      return renderer.move(item2msg.get(item).pos(item.x, item.y));
    })).then(renderer.activate())
  }

  //게임 렌더러가 호출할 메소드 (컨트롤러와 뷰의 메세지를 통한 대화)
  getInfo(msg) {
    const item = this.msg2item.get(msg);
    msg.info(item.x, item.y, item.type, item.selected);
    return msg;
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
      if (curr.prev === item) {
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
};

class GameMsg {
  pos(x, y) {
    if (x === undefined) return this._pos;
    this._pos = { x, y };
    return this;
  }

  info(x, y, type, selected) {
    if (x === undefined) {
      return this._info;
    }
    this._info = { x, y, type, selected };
    return this._info;
  }
}
