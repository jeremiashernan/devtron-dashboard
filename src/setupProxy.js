const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use("/orchestrator", createProxyMiddleware({
        target: 'http://pro-test.devtron.info:32080',
        changeOrigin: true,
        logLevel: 'info'
    }))
}