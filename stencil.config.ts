import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'acme_web_ui_components',
  testing: {
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
    timers: 'fake'
  },
  bundles: [
    { components: ['acme-select', 'acme-select-header',  'acme-select-option'] },
  ],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [
        {
          src: 'assets',
          dest: '../assets'
        },
        {
          src: 'scss',
          dest: '../scss'
        }
      ]
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'docs-json',
      file: 'docs/docs.json'
    },
    {
      type: 'www',
      copy: [
        {
          src: 'assets',
          dest: 'assets'
        }
      ],
      serviceWorker: null
    }
  ],
  plugins: [
    sass()
  ],
  devServer: {
    reloadStrategy: 'pageReload'
  }
};

