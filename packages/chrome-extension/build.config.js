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
    '@alifd/next': 'Next',
    moment: 'moment',
    lodash: '_',
  },
  plugins: [
    [
      'build-plugin-fusion',
      {
        themePackage: '@alifd/theme-design-pro',
        externalNext: true,
      },
    ],
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
    ['build-plugin-css-assets-local'],
    [
      'build-plugin-js-assets-local',
      {
        removeManifest: false, // 是否删除manifest文件，可不配
        manifestFilePath: 'assets/assets-manifest.json', // manifest文件路径，可不配
      },
    ],
  ],
};
