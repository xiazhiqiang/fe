import { defineConfig } from 'dumi';

export default defineConfig({
  mfsu: false,
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'service-worker',
  },
  alias: {
    '@/': './src/',
  },
  proxy: {},
});
