var koa = require('koa');
var join = require('path').join;

var config = {
    modelPath: join(__dirname, 'models'),
    db: 'magical_guac',
    username: 'postgres',
    password: 'GH4i9a91m',
    dialect: 'postgres',
    host: 'localhost',
    port: '5432',
    pool: {
        maxConnections: 10,
        minConnections: 0,
        maxIdleTime: 30000
    }
};

var orm = require('koa-orm')(config);

var app = module.exports = koa();

app.use(orm.middleware);



app.use(function *pageNotFound(next){
  yield next;

  if (404 != this.status) return;

  // we need to explicitly set 404 here
  // so that koa doesn't assign 200 on body=
  this.status = 404;

  switch (this.accepts('html', 'json')) {
    case 'html':
      this.type = 'html';
      this.body = '<p>Page Not Found</p>';
      break;
    case 'json':
      this.body = {
        message: 'Page Not Found'
      };
      break;
    default:
      this.type = 'text';
      this.body = 'Page Not Found';
  }
})

if (!module.parent) app.listen(3000);
