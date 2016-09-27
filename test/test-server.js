/*global require, describe, before, after, it, beforeEach*/
'use strict'


var app       = require('../server'),
  request     = require('supertest')
    .agent(app.listen()),
  should      = require('should'),
  fs          = require('fs'),
  Sequelize   = require('sequelize'),
  sequelize   = new Sequelize('magical_guac', 'postgres', 'GH4i9a91m', {'dialect' : 'postgres'}),
  spawn       = require('cross-spawn-with-kill')

const logFile = 'app.log'

/*
 * Utility function to get the Last
 * line of the app.log
 */
function GetLastLogLine() {
  var data  = fs.readFileSync(logFile, 'utf8'),
    lines = data.split('\n')
  // Since a new line character is added at the end of each log item
  // the last line will always be empty so get the line before that
  return lines[lines.length-2]
}



describe('App Server', function() {

  // Varible to hold the Kafka Consumer
  // process reference so it can be
  // started before the tests run
  // and killed after the tests finish
  let childConsumerProcess

  //TODO: Use some more yeild or promises to make
  // this cleaner.
  before(function(done) {
    // Empty the Users table
    sequelize.query('DELETE FROM users')
    .then(() => {

      /* For testing purposes start the file
       * consume that will write to app.log
       * Once started, sleeping for a second
       * to ensure that the consumer is read.
       * TODO: Use a real test to see if the
       * consumer has actually started.
       */
      childConsumerProcess = spawn('npm', ['run', 'start-consumer'], { stdio: 'inherit' })

      setTimeout(done, 1500)
    })
  })

  beforeEach(function(done) {
 // Empty the log file so we have a clear start
    fs.truncate(logFile, 0, done)
  })


  it('should allow POST on /log', function(done) {

    let random_user_id = Math.random(),
      message = {'actionId' : 'LOG', 'user_id': random_user_id, 'data' : {}}
    request.post('/log')
    .send(message)
    .expect(200)
    .end(() => {
      setTimeout(() => {
        var line = GetLastLogLine()
        line.should.match('log ' + '0 ' + JSON.stringify(message))
        should.exist(line)

        done()
      }, 500)
    })
  })


  // Save the random created user in the
  // test below to reuse for integration
  // testing
  var createdUser


  it('should allow POST on /classes/user', function(done) {

    let rand = Math.random()
    let user = {email : 'foo' + rand + '@bar.com', password : 'abc123', name : 'foo' + rand}
    request.post('/classes/user')
    .send(user)
    .expect(200)
    .end(function testPOSTUserCall () {

      // User be in the DB
      sequelize.query('SELECT * FROM users', { type: sequelize.QueryTypes.SELECT})
      .then(function(users) {
        // We don't need spread here, since only the results will be returned for select queries
        should.exist(users)
        should.exist(users[0])
        should.equal(users[0].email, 'foo' + rand + '@bar.com')

        createdUser = users[0]

        // Time out to ensure that the app.log has been updated
        setTimeout(() => {

          let line = GetLastLogLine()
          should.exist(line)
          let message = {actionId: 'USER_SIGNUP', data: user}

          line.should.match('log ' + '0 ' + JSON.stringify(message))
          // Look for app.log to have file

          done()

        }, 700)

      })

    })

  })




  it('should return 400 on invalid user.id PUT to /classes/user/:id', function(done) {
    request.put('/classes/user/123213123')
    .send({name : 'bob', password : 'abc123'})
    .expect(400)
    .end(done)
  })


  it('should not allowed change of email on PUT to /classes/user/:id', function(done) {
    request.put('/classes/user/' + createdUser.id)
    .send({name : 'bob', password : 'abc123', email: 'bob@foo.com'})
    .expect(400)
    .end(done)
  })


  it('should allowed change of name and password on PUT to /classes/user/:id', function(done) {
    let randName = 'boo' + Math.random()
    request.put('/classes/user/' + createdUser.id)
    .send({ password : 'abc123', name: randName})
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      should.equal(res.body.name, randName)
      done()
    })
  })


  it('should allowed log to app.log on PUT to /classes/user/:id', function(done) {
    let randName = 'boo' + Math.random(),
      randChange = { password: 'abc123', name: randName }
    request.put('/classes/user/' + createdUser.id)
    .send(randChange)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      should.equal(res.body.name, randName)

      setTimeout(() => {

        let line = GetLastLogLine()
        should.exist(line)
        let message = {actionId: 'USER_EDIT_PROFILE', data: randChange}

        line.should.match('log ' + '0 ' + JSON.stringify(message))
        // Look for app.log to have file

        done()

      }, 700)


    })
  })


  after(function(done) {
    // Click the consumer we started ealier
    childConsumerProcess.kill()
    // wait for the consumer process to be killed
    setTimeout(done, 1000)
  })

})
