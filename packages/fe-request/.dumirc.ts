import { defineConfig } from 'dumi';

export default defineConfig({
  mfsu: false,
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'fe-request',
  },
  alias: {
    '@/': './src/',
  },
  mock: {
    include: ['mock/*'],
  },
  proxy: {},
});
