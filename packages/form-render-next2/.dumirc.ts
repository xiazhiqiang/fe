import { defineConfig } from 'dumi';
import pkg from './package.json';

const outputPath = 'docs-dist';

export default defineConfig({
  mfsu: false,
  history: {
    type: 'hash',
  },
  outputPath,
  themeConfig: {
    name: 'FormRender',
    footer: false,
  },
  styles: ['.dumi-default-header-content {display: none !important;}'],
  publicPath:
    process.env.NODE_ENV === 'production'
      ? `https://unpkg.com/${pkg.name}@${pkg.version}/${outputPath}/`
      : '/',
});
