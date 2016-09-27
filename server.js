/* global require, __dirname, module */
'use strict'
var koa = require('koa'),
  join = require('path').join,
  bodyParser = require('koa-bodyparser'),
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
    this.status = 400
    this.body = 'Invalid Parameter'

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
  var user
  try {
    user = yield this.orm().users.findById(this.params.id)

    if (user == null) {
      throw new Error('Cannot find user')
    }


    if (this.request.body.email) {
      throw new Error('Cannot change email')
    }
    // Check if the name has changed
    // and then set it
    if (this.request.body.name !== user.name) {
      user.set('name', this.request.body.name)
    }

    // Always change password as we don't know what
    // the password is. It is hashed in the DB.
    if (this.request.body.password) {
      user.set('password', this.request.body.password)
    }


    yield user.save()

    yield this.log.sendOnce({ message: {actionId : 'USER_EDIT_PROFILE', data: this.request.body}})
    this.body = user

  } catch (err) {

    this.status = 400
    // TODO: only send error out in debug mode
    this.body = 'Invalid Parameter: ' + err
  }

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
