var
  express = require('express'),
  path = require('path'),
  http = require('http'),
  app = express(),
  port = 3000,
  server = http.createServer(app);

[
  {url: '/bower_components', path: 'bower_components'},
  {url: '/node_modules', path: 'node_modules'},
  {url: '/src', path: 'src'},
  {url: '/lib', path: 'lib'},
  {url: '/test-data', path: 'test-data'},
  {url: '/test', path: 'test'},
  {url: '/', path: 'html'},
  {url: '/', path: 'dist'}
].forEach(function (mapping) {
  app.use(mapping.url, express.static(path.join(__dirname, mapping.path)));
});

app.set('port', port);
server.listen(port);
console.log('Server started on port ' + port);