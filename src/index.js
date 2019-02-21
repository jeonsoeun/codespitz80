// import { isContext } from 'vm';

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
// 블록 한 칸의 타입은 블록 클래스안에 넣어도되지만 그러지말자. 의존성을 낮추자.
Block.GET = (type = parseInt(Math.random() * 5)) => new Block(type);

// Game은 초기화, 렌더, 이벤트처리가 필요.
const Game = (() => {
  const column = 8, row = 8, blockSize = 80;
  const data = []; //data가 모든 정보를 알고있다. 그래서 다른걸 위임을 못해. -> 연산줄고 메모리적게들지만.. 복잡성을 감당해야됨.
  let table;
  let startBlock, currBlock, isDown;
  const selected = []; //selected와 data는 Block의 권한을 뺏은 셈.

  //선택한 블록과 인접한지 검사
  const isNext = curr => {
    let r0, c0, r1, c1, cnt = 0;
    data.some((row, i) => {
      let j;
      if ((j = row.indexOf(currBlock)) != -1) {
        (r0 = i), (c0 = j), cnt++;
      }
      if ((j = row.indexOf(curr)) != -1) {
        (r1 = i), (c1 = j), cnt++;
      }
      return cnt == 2;
    });
    return (curr != currBlock && (Math.abs(r0 - r1) == 1 || Math.abs(c0 - c1) == 1));
  };

  const getBlock = (x, y) => {
    const { top: T, left: L } = table.getBoundingClientRect();
    if (x < L || x > (L + blockSize * row) || y < T || y > (T + blockSize * column)) return null;
    return data[parseInt((y - T) / blockSize)][parseInt((x - L) / blockSize)];
  };

  // 마우스 이벤트 함수들 down,move, up
  const down = ({ pageX: x, pageY: y }) => {
    if (isDown) return;
    const curr = getBlock(x, y);
    if (!curr) return;
    isDown = true;
    selected.length = 0;
    selected[0] = startBlock = currBlock = curr;
    render();
  };

  const move = ({ pageX: x, pageY: y }) => {
    if (!isDown) return;
    const curr = getBlock(x, y);
    if (!curr || curr.type != startBlock.type || !isNext(curr)) return;
    if (selected.indexOf(curr) == -1) selected.push(curr);
    else if (selected[selected.length - 2] == curr) selected.pop();
    currBlock = curr;
    render();
  };

  const up = _ => {
    selected.length > 2 ? remove() : reset();
  };

  const reset = _ => {
    startBlock = currBlock = null;
    selected.length = 0;
    isDown = false;
    render();
  };

  const remove = _ => {
    //데이터 삭제
    data.forEach(r => {
      selected.forEach(v => {
        let i;
        if ((i = r.indexOf(v)) != -1) {
          r[i] = null;
        }
      });
    });
    render();
    setTimeout(drop, 300);
  };

  // 블록들 아래로 떨구기
  const drop = _ => {
    console.log('drop')
    let isNext = false;
    for (let j = 0; j < column; j++) {
      for (let i = row - 1; i > -1; i--) {
        if (!data[i][j] && i) {
          let k = i,
            isEmpty = true;
          while (k--)
            if (data[k][j]) {
              isEmpty = false;
              break;
            }
          if (isEmpty) break;
          isNext = true;
          while (i--) {
            data[i + 1][j] = data[i][j];
            data[i][j] = null;
          }
          break;
        }
      }
    }
    render();
    isNext ? setTimeout(drop, 300) : readyToFill();
  };

  //떨어질 블록 미리 만들어 두기
  const fills = [];
  letfillCnt = 0;
  const readyToFill = _ => {
    fills.length = 0;
    data.some(row => {
      if (row.indexOf(null) == -1) return true;
      const r = [...row].fill(null);
      fills.push(r);
      row.forEach((v, i) => !v && (r[i] = Block.GET()));
    });
    fillCnt = 0;
    setTimeout(fill, 300);
  };
  const fill = _ => {
    if (fillCnt > fills.length) {
      isDown = false;
      return;
    }
    for (let i = 0; i < fillCnt; i++) {
      fills[fills.length - i - 1].forEach((v, j) => {
        if (v) data[fillCnt - i - 1][j] = v;
      });
    }
    fillCnt++;
    render();
    setTimeout(fill, 300);
  };

  //렌더링.
  const el = tag => document.createElement(tag);
  const render = _ => {
    //1강 과제 1: render 시점에서 tr, td생성하지 않고 스타일만 바꾸기.
    data.forEach((row, i) => {
      const tr = document.querySelectorAll('tr')[i];
      row.forEach((block, j) => {
        let cssText = `${block ? `background:${block.image};` : ''} background-position:center; background-size:90%;width:${blockSize}px;height:${blockSize}px;cursor:pointer;background-repeat: no-repeat;`;
        //1강 과제 2: 선택한 블록 배경 노란색.
        if (selected.indexOf(block) !== -1) {
          cssText += 'background-color: #FBFEB9'
        }
        tr.querySelectorAll('td')[j].setAttribute('style', cssText)
      })
    })
  };

  // 게임 초기화. 이거만 밖에 노출하면 된다.
  return tid => {
    table = document.querySelector(tid);
    for (let i = 0; i < row; i++) {
      const r = [];
      data.push(r);
      for (let j = 0; j < column; j++) r[j] = Block.GET();
      //1강 과제1(render에서 스타일만 바꾸기)를 위해 게임 초기화 시 빈 테이블 생성
      table.appendChild(r.reduce((tr, block)=>{
        tr.appendChild(el('td'));
        return tr;
      }, el('tr')))
    }
    //테이블에 이벤트를 건다.
    table.addEventListener('mousedown', down);
    table.addEventListener('mouseup', up);
    table.addEventListener('mouseleave', up);
    table.addEventListener('mousemove', move);

    //화면에 뿌린다.
    render();
  };
})();
Game('#stage');
