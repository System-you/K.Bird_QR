const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://203.170.129.88:9078',
      changeOrigin: true,
    })
  );
};