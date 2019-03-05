// 긴급사태일때 전용
let debugMode = 'debug'; // throw는 죽여버리니까 개발중일땐 true로 바꾸고 개발끝나면 false로
const error = msg => {
  switch (debugMode) {
    case 'run':
      console.error(msg);
      return false;
    case 'debug':
      console.error(msg);
      throw msg;
    default:
      return false;
  }
};
const Item = class {
  constructor(_game, _type, _x, _y){
    //_game은 객체니까(나머지는 값이라도) validation
    if(!_game) return error(`invalid game: ${_game}`)
    prop(this, { //이것도 트랜잭션이라 같은 도메인 묶어놨다.
      _game, _type, _x, _y,
      _previousSelected : null, _isSelected: false,
      _isActionActivated : false
    });
  }
  //(도메인) 일반기능 -> 근데 사실 어휘가(이름이) 완벽하면 이런 주석을 쓸 필요가 없다.
  //그럼 주석은 어디에 달까: Context. 책임이 발동하는 조건? 등.
  get type() {this._type}
  get x() {this._x}
  get y() {this._y}
  //공백을 사용하는 방법은 책임이나 권한으로 분류한다. 근데 그럼 이때 뭘 우선으로 할까는 원칙을 정해서해.

  get isSelected() {}
  get previousSelected() {}

  get isActionActivated() {}
  // 여기까지는 값을 반환해도된다.. 기준이 뭐더라.

  isBorder(item) {
    // 인자는 더럽다 생각하고 인자는 건들지 않게 바꾸자. 인자를 건들지 않는 부분 white list
    const white = {item};
    if (!white.item) return error(`invalid item: ${item}`);
    // 해체는 여러번 쓰이면 해체.
    const { item:{x: ix, y: iy }} = white, { x: tx, y: ty } = this;
    return this != white.item && Math.abs(this.tx - ix) < 2 && Math.abs(ty - iy) < 2;
  }
  setPos(x, y) {
    (this.x = x), (this.y = y); // 트랜젝션이다. 한번에 처리해야됨을 표현
  }

  hasSelectedItem(item) {
    const { _previousSelected: prev } = this;
    //실드 패턴. null 패치.(+해체) 항상 이렇게 validation을 하고 하는 습관을 기르자
    if (!prev) return false; 
    //삼항식은 누가 코드사이에 끼어넣는거 방지. (트랜젝션을 위해서 )
    return (prev == item) || prev.hasSelectedItem(item);
  }
  select(previousItem){
    this._isSelected = true;
    this._previousSelected = previousItem;
  }
  unSelect(){
    this._isSelected = false;
    this._previousSelected = null;
  }

  action(){return false;}
  //오버라이드를 선택적으로 한다는 의미로 비워둘수도잇고(원칙).
  queAction(){}
  //훅을 걸 수 있다. 
  // queAction(){this._queAction();}
  // _queAction(){return 'overide'}
};
