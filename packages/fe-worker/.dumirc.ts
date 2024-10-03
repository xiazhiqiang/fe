import { defineConfig } from 'dumi';

export default defineConfig({
  mfsu: false,
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'fe-worker',
  },
  alias: {
    '@/': './src/',
  },
  proxy: {},
});
