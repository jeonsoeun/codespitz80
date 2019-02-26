const UTIL = {
  el: el => document.querySelector(el),
  prop: (...arg) => Object.assign(...arg),
  ThrowSet: class extends Set{
    constructor() {
      super();
    }
    some(f) {
      try {
        this.forEach((v, i) => {
          if (v = f(v, i)) throw v;
        });
      } catch (r) {
        return r;
      }
    }
  }
};

export const { el, prop, ThrowSet } = UTIL;