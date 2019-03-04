const UTIL = {
  el: el => document.querySelector(el),
  prop: (...arg) => Object.assign(...arg),
  ThrowSet: class extends Set {
    constructor() {
      super();
    }
    some(f) {
      try {
        this.forEach((v, i) => {
          if (f(v, i)) throw v; // #lecture 2 오류 수정: v= f(v,i) 이건 boolean반환. f(v,i) 아이템 반환하려면 이렇게 해야.
        });
        return false;
      } catch (r) {
        return r;
      }
    }
  }
};

const { el, prop, ThrowSet } = UTIL;
