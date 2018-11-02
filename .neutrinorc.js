module.exports = {
  use: [
    [
      '@neutrinojs/react',
      {
        html: {
          title: 'FitViewer'
        }
      }
    ],
    '@neutrinojs/jest',
    (neutrino) => neutrino.config
      .output.sourcePrefix('').end()
      .module.set('unknownContextCritical', false).end(),
  ]
};
