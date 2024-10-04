import React, { useEffect, useRef, useState } from 'react';

const useWorkerHook = (props: any) => {
  const { url, errHandler, msgHandler } = props || {};
  const workerRef = useRef<any>(null);

  useEffect(() => {
    let worker = null;
    try {
      worker = new Worker(url);
      workerRef.current = worker;
    } catch (err) {}

    const _msgHandler = (evt: any) => {
      typeof msgHandler === 'function' && msgHandler(evt);
    };

    const _errHandler = (err: any) => {
      typeof errHandler === 'function' && errHandler(err);
    };

    if (worker) {
      worker.addEventListener('message', _msgHandler, false);
      worker.addEventListener('error', _errHandler);
    }

    return () => {
      if (worker) {
        worker.removeEventListener('error', _errHandler);
        worker.removeEventListener('message', _msgHandler);

        // 主进程中关闭worker进程
        worker.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return { workerRef };
};

export function SimpleDemo() {
  const { workerRef } = useWorkerHook({
    url: '/worker1.js',
    msgHandler: (event: any) => {
      console.log('Received message', event.data);
    },
    errHandler: (error: any) => {
      console.error(error?.message);
    },
  });

  return (
    <>
      <div>
        <button
          onClick={() => {
            workerRef.current.postMessage({
              type: 'msg',
              message: 'from main process',
              data: { a: 1, b: 2 },
            });
          }}
        >
          向worker发送消息，并接收来自worker的消息
        </button>
        <button
          onClick={() => {
            workerRef.current.postMessage({
              message: 'close worker',
              type: 'close',
              data: null,
            });
          }}
        >
          关闭worker进程
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            workerRef.current.postMessage({
              type: 'loadScript',
              message: 'from main process',
              data: null,
            });
          }}
        >
          worker加载脚本运行
        </button>
      </div>
    </>
  );
}

export function Demo2() {
  const [interfaceState, setInterfaceState] = useState(null);
  const { workerRef } = useWorkerHook({
    url: '/worker2.js',
    msgHandler: (event: any) => {
      setInterfaceState(event?.data);
    },
    errHandler: (error: any) => {
      console.error(error);
    },
  });

  return (
    <>
      <div>
        <button
          onClick={() => {
            workerRef.current.postMessage({
              type: 'rotateState',
              message: 'from parent',
              data: {
                interfaceUrl: '/queryState',
              },
            });
          }}
        >
          向 worker 发送消息轮训接口状态
        </button>
        <button
          onClick={() =>
            workerRef.current.postMessage({
              type: 'stopRotateState',
            })
          }
        >
          停止轮训接口状态
        </button>
      </div>
      <pre>{JSON.stringify(interfaceState, null, 2)}</pre>
    </>
  );
}

const useSharedWorkerHooks = (props: any) => {
  const { url, msgErrHandler, msgHandler, msg, opts = {} } = props || {};
  const sharedWorkerRef = useRef<any>(null);

  useEffect(() => {
    let sharedWorker = null;

    const _msgHandler = (event: any) => {
      typeof msgHandler === 'function' && msgHandler(event);
    };
    const _msgErrHandler = (event: any) => {
      typeof msgErrHandler === 'function' && msgErrHandler(event);
    };

    try {
      sharedWorker = new SharedWorker(url, opts);
      sharedWorkerRef.current = sharedWorker;
      // console.log('sharedWorker', sharedWorker);

      sharedWorker.port.addEventListener('message', _msgHandler);
      sharedWorker.port.addEventListener('messageerror', _msgErrHandler);
      sharedWorker.port.start();

      msg && sharedWorker.port.postMessage(msg);
    } catch (err) {
      console.error('err', err);
    }

    return () => {
      if (sharedWorker) {
        sharedWorker.port.removeEventListener('message', _msgHandler);
        sharedWorker.port.removeEventListener('messageerror', _msgErrHandler);

        sharedWorker.port.close();
        sharedWorkerRef.current = null;
      }
    };
  }, []);

  return { sharedWorkerRef };
};

// 打开 chrome://inspect/#workers 调试
export function Demo3() {
  const [msgData, setMsgData] = useState(null);
  const { sharedWorkerRef } = useSharedWorkerHooks({
    url: 'worker3.js',
    msgHandler: (event: any) => {
      // console.log('Received message from shared worker:', event.data);
      setMsgData(event.data);
    },
    msg: { type: 'checkState', data: { interfaceUrl: '/queryState' } },
  });
  return (
    <>
      <h2>page1 共享worker</h2>
      <button
        onClick={() => {
          sharedWorkerRef.current.port.postMessage('from shared page1');
        }}
      >
        发送给共享worker消息
      </button>
      <pre>{JSON.stringify(msgData, null, 2)}</pre>
    </>
  );
}

// 打开 chrome://inspect/#workers 调试
export function Demo4() {
  const [msgData, setMsgData] = useState(null);
  const { sharedWorkerRef } = useSharedWorkerHooks({
    url: 'worker3.js',
    msgHandler: (event: any) => {
      // console.log('Received message from shared worker:', event.data);
      setMsgData(event.data);
    },
  });

  return (
    <>
      <h2>page2 共享worker</h2>
      <button
        onClick={() => {
          sharedWorkerRef.current.port.postMessage('from shared page2');
        }}
      >
        发送给共享worker消息
      </button>
      <button
        onClick={() => {
          sharedWorkerRef.current.port.postMessage({ type: 'close' });
        }}
      >
        关闭单个port通信
      </button>
      <div>
        <pre>{JSON.stringify(msgData, null, 2)}</pre>
      </div>
    </>
  );
}
