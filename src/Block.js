// 블록 클래스. 블록 한칸을 정함.
const Block = class {
  constructor(type) {
    this._type = type;
  }

  get image() {
    return `url('img/${this._type}.png')`; //이건 베이스레이어에 있으면안됨. (네이티브 코드.)
  }
  get type() {
    return this._type;
  }
};

export default Block;