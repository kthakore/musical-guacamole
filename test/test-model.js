/*global require, describe, it, after, __dirname*/
'use strict'


var should      = require('should'),
    Sequelize   = require('sequelize'),
    sequelize   = new Sequelize('magical_guac', 'postgres', 'GH4i9a91m', {'dialect' : 'postgres'}),
    join        = require('path').join,
    userModel   = sequelize.import(join(__dirname, '../lib/models/users'))


describe('User Model', function userModelTest() {


  after(function(done) {
    sequelize.query('DELETE FROM users')
    .then(() => {done()})
  })

  it('should exist', function shouldExist(done) {

    should.exist(userModel)
    done()

  })



  it('should require email and password', function createWithoutEmailPasswordTest(done) {

    try {
        userModel.create().then(() => {
        should.fail('User should not have been created')
        done()
      })
    } catch(err) {
      should.equal(err.message.match(/^name cannot be null/), null)
      should.equal(err.message.match(/^email cannot be null/), null)
      should.equal(err.message.match(/^password cannot be null/), null)
      done()
    }


  })


  describe('creating user', () => {
    var created_user

    it('should allow user creation with name, email, password', function createWithEmailPasswordTest(done) {

      try {
        userModel.create({email: 'food@man.com', password: 'bob', name: 'foo'})
        .then((res) => {
          should.exist(res)
          created_user = res
          done()
        })
      } catch(err) {
        should.fail('Shouldn\'t have any errors:' + err.message)
        done()
      }


    })

    it('should not marshal password field', function passwordFieldTest() {

      should.not.exist(created_user.toJSON().password)

    })


    it('should have name, email', function dataSavedTest() {



    })
   })


})

