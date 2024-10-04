console.log('worker2 loaded~');

function msgHandler(event) {
  console.log('data', event.data);
  self.postMessage({ message: 'from worker', data: { x: 1, y: 2 } });
}
function closeHandler(event) {
  // worker进程中关闭进程
  self.close();
}

let rotateStateTimer = null;
const rotateFn = (url, params = {}) => {
  if (!url) {
    return;
  }

  fetch(`${url}?${new URLSearchParams(params)}`)
    .then((res) => res.json())
    .then((res) => {
      // console.log(res);
      if (res.success && res.data && res.data.status === true) {
        clearInterval(rotateStateTimer);
        rotateStateTimer = null;
      }
      self.postMessage({ message: 'from worker', data: res });
    });
};
function rotateStateHandler(event, data) {
  const { interfaceUrl } = data || {};
  if (!interfaceUrl) {
    return;
  }

  // 定时轮训接口状态
  if (rotateStateTimer) {
    clearInterval(rotateStateTimer);
    rotateStateTimer = null;
  }

  let reset = true;
  rotateStateTimer = setInterval(() => {
    rotateFn(interfaceUrl, { reset });
    reset = false;
  }, 1000);
}
function stopRotateStateHandler(event, data) {
  if (rotateStateTimer) {
    clearInterval(rotateStateTimer);
  }
  rotateStateTimer = null;
}

const handlersMap = {
  msgHandler,
  closeHandler,
  rotateStateHandler,
  stopRotateStateHandler,
};

self.addEventListener('message', function (event) {
  const { type, data } = event && event.data ? event.data : {};

  // 验证消息type类型
  if (!handlersMap[`${type}Handler`]) {
    return;
  }

  handlersMap[`${type}Handler`](event, data);
});
