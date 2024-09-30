import { defineConfig } from 'father';

export default defineConfig({
  // more father config: https://github.com/umijs/father/blob/master/docs/config.md
  alias: {
    '@/': './src/',
  },
  esm: { output: 'es' },
  cjs: { output: 'lib' },
  umd: {
    name: 'FeUpload',
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      '@alifd/next': 'Next',
      lodash: '_',
      moment: 'moment',
      'fe-request': 'FeRequest',
    },
    output: {
      path: 'dist',
      filename: 'index',
    },
  },
});
