/* eslint-disable comma-dangle */

/**
 * The import rules object defines elements that can be removed (cleanup) from the source
 * document and elements that should be transformed into blocks.
 */
const importRules = {
  root: 'main',
  cleanup: {
    start: [
      'style',
      'source',
      'script',
      'noscript',
      'iframe',
      'link',
      'nav.navbar',
      'nav > .col-lg-10',
      'nav > .col-lg-2',
      'footer.footer'
    ],
    end: []
  },
  blocks: [
    {
      type: 'metadata',
      insertMode: 'append',
      selectors: [],
      variants: []
    },
    {
      type: 'aiheader-dxxjuf-855297627',
      selectors: [
        'header > nav'
      ],
      variants: []
    },
    {
      type: 'aicolumns-dxxjuf-1413770752',
      selectors: [
        'footer > div > div'
      ],
      variants: []
    },
    {
      type: 'aicards-dxxjuf-1749612991',
      selectors: [
        'main'
      ],
      variants: []
    }
  ],
  transformers: []
};

export default importRules;
