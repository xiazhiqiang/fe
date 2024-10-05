const entry = {
  'service-worker': 'src/background/service-worker',
  content: 'src/content/index',
  popup: 'src/popup',
  sidePanel: 'src/sidePanel',
};

module.exports = {
  publicPath: './',
  vite: false,
  vendor: false,
  entry: process.env.NODE_ENV === 'production' ? entry : { ...entry, index: 'src/app' },
  polyfill: 'usage',
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  plugins: [
    [
      'build-plugin-moment-locales',
      {
        locales: ['zh-cn'],
      },
    ],
    [
      'build-plugin-ignore-style',
      {
        libraryName: '@alifd/next',
      },
    ],
  ],
};
