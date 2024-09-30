import { defineConfig } from 'dumi';

export default defineConfig({
  mfsu: false,
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'fe-upload',
  },
  alias: {
    '@/': './src/',
  },
  mock: {
    include: ['mock/*'],
  },
  proxy: {},
});
