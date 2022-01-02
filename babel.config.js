module.exports = api => {
  api.cache(true)
  return {
    plugins: ['@emotion'],
    presets: [
      [
        '@babel/preset-env',
        {
          targets: 'last 1 chrome version',
          useBuiltIns: 'entry',
          corejs: '3.18',
          loose: true,
        },
      ],
      [
        '@babel/preset-react',
        {runtime: 'automatic', importSource: '@emotion/react'},
      ],
    ],
  }
}
