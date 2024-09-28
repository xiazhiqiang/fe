import { defineConfig } from 'father';

export default defineConfig({
  // more father config: https://github.com/umijs/father/blob/master/docs/config.md
  alias: {
    '@/': './src/',
  },
  esm: { output: 'es' },
  cjs: { output: 'lib' },
  umd: {
    name: 'FeRequest',
    chainWebpack: (memo) => {
      const baseExternals = {
        react: 'React',
        'react-dom': 'ReactDOM',
        '@alifd/next': 'Next',
        lodash: '_',
        moment: 'moment',
      };

      if (memo.entryPoints.get('index')) {
        // console.log('jinlaile1');
        memo.externals(baseExternals);
      }
      // console.log('memo', memo.toConfig());

      return memo;
    },
    entry: {
      'src/index': {
        output: {
          filename: 'index.js',
        },
      },
    },
    output: {
      path: 'dist',
    },
  },
});
