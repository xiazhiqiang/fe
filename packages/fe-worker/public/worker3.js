let ports = [];

function broadcastMessage(msg) {
  if (!msg) {
    return;
  }

  // 向所有连接的端口发送消息
  ports.forEach(function (port) {
    port.postMessage(msg);
  });
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

      broadcastMessage({ message: 'from worker', data: res });
    });
};

function msgHandler(event, data) {}

function closeHandler(event, data, port) {
  port.close();
}

function checkStateHandler(event, data) {
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

const handlersMap = {
  msgHandler,
  closeHandler,
  checkStateHandler,
};

self.onconnect = function (e) {
  console.log('connecting', e);
  let port = e.ports[0];
  ports.push(port);

  port.addEventListener('message', function (event) {
    // 处理来自主线程的消息
    console.log('Received message from main thread:', event.data);
    const { type, data } = event && event.data ? event.data : {};

    // 验证消息type类型
    if (!handlersMap[`${type}Handler`]) {
      return;
    }

    const ret = handlersMap[`${type}Handler`](event, data, port);
    broadcastMessage(ret && ret.sharedMsg);
  });

  port.start(); // Required when using addEventListener
};
