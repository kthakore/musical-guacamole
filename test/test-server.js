"use strict";

var app       = require("../server"),
  request   = require("supertest")
.agent(app.listen()),
should    = require('should'),
  fs        = require('fs'),
  Sequelize = require('sequelize'),
  sequelize = new Sequelize('magical_guac', 'postgres', 'GH4i9a91m', {'dialect' : 'postgres'})

const logFile = 'app.log'


function GetLastLogLine() {
  var data  = fs.readFileSync(logFile, 'utf8'),
    lines = data.split("\n")
  // Since a new line character is added at the end of each log item
  // the last line will always be empty so get the line before that
  return lines[lines.length-2]
}

describe("App Server", function() {

  before(function(done) {
    // Empty the log file so we have a clear start
    fs.truncate(logFile, 0, () => {
      // Empty the Users table
      sequelize.query('DELETE FROM users')
      .then(() => {done()})
    })
  });
  it("should allow POST on /log", function(done) {

    let random_user_id = Math.random(),
        message = {"actionId" : "LOG", "user_id": random_user_id, "data" : {}}
    request.post("/log")
    .send(message)
    .expect(200)
    .end(() => {
      setTimeout(() => {
      var line = GetLastLogLine()
      // console.log("LINE IS: ", line)
      line.should.match(JSON.stringify(message))
      should.exist(line)
      // Look for app.log to have file

      done()
      }, 500)
    })
  })

  it("should allow POST on /classes/user", function(done) {

    let rand = Math.random()
    request.post("/classes/user")
    .send({"email" : "foo" + rand + "@bar.com", "password" : "abc123", "name" : "foo" + rand})
    .expect(200)
    .end(function testPOSTUserCall () {

      sequelize.query('SELECT * FROM users', { type: sequelize.QueryTypes.SELECT})
        .then(function(users) {
          // We don't need spread here, since only the results will be returned for select queries
          should.exist(users)
          should.exist(users[0])
          should.equal(users[0].email, "foo" + rand + "@bar.com")

          var line = GetLastLogLine()

          should.exist(line)
          // Look for app.log to have file

          done()
      });
    })
  })


  it("should allow POST on /classes/user/:id", function(done) {


    request.post("/classes/user/123213123")
    .send({"name" : "bob", "password" : "abc123"})
    .expect(200)
    .end(() => {
      var line = GetLastLogLine();

      should.exist(line);
      // Look for app.log to have file

      done()
    })
  })

})
