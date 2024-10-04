let timer;

export default {
  // 模拟超过5s后状态改为true
  'GET /queryState': (req, res) => {
    if (!timer || req.query.reset === 'true') {
      timer = +new Date();
    }

    const status = +new Date() - timer >= 5 * 1000;

    // 添加跨域请求头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
      success: true,
      data: {
        status,
      },
      timestamp: +new Date(),
    });
  },
};
