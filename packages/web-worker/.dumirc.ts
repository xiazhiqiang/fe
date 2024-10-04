import { defineConfig } from 'dumi';

export default defineConfig({
  mfsu: false,
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'web-worker',
  },
  alias: {
    '@/': './src/',
  },
  proxy: {},
});
