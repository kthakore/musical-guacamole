/* global require, __dirname, module */
'use strict'
var koa = require('koa'),
  join = require('path').join,
  bodyParser = require('koa-bodyparser'),
//  _ = require('lodash'),
  boom = require('koa-boom'),
  config = {
    modelPath: join(__dirname, 'lib/models'),
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
  },
  orm = require('koa-orm')(config),
  logger = require('./lib/middleware/logger')({topic: 'log'}),
  router = require('koa-router')(),
  app = module.exports = koa()

app.use(bodyParser())


router.post('/log', function *POSTLog() {

  let logMessage = this.request.body

  if (logMessage === undefined || logMessage.actionId === undefined) {
    boom.badRequest(this, 'Bad JSON Request, actionId is required')
  } else {
    yield this.log.sendOnce({ message : logMessage })
  }

}).


post('/classes/user', function *POSTUser() {

  var out = yield this.orm().users.create(this.request.body)

  // Log is created with actionId = USER_SIGNUP and data = request.body
  yield this.log.sendOnce({ message: {actionId : 'USER_SIGNUP', data: this.request.body}})
  this.body = out

}).


put('/classes/user/:id', function *PUTUser() {

  console.log(this.params.id)

  var user = yield this.orm().users.findById(this.params.id)

  yield this.log.sendOnce({ message: {actionId : 'USER_EDIT_PROFILE', data: this.request.body}})

  console.log(user)

  this.body = user
})


app.use(orm.middleware)
.use(logger.middleware)
.use(router.routes())
.use(function *pageNotFound (next) {
  yield next

  if (404 != this.status) return

  // we need to explicitly set 404 here
  // so that koa doesn't assign 200 on body=
  this.status = 404

  switch (this.accepts('html', 'json')) {
  case 'html':
    this.type = 'html'
    this.body = '<p>Page Not Found</p>'
    break
  case 'json':
    this.body = {
      message: 'Page Not Found'
    }
    break
  default:
    this.type = 'text'
    this.body = 'Page Not Found'
  }
})

if (!module.parent) app.listen(3000)
