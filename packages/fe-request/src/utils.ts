// 简单节流函数
export function throttle(fn, delay = 1000): (...p: any) => any {
  let timer;
  return function () {
    if (!timer) {
      // @ts-ignore
      fn.apply(this, arguments);
      timer = setTimeout(() => {
        clearTimeout(timer);
        timer = null;
      }, delay);
    }
  };
}
