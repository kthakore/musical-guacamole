/* global require, it, describe */
'use strict'

var Producer = require('../lib/producer'),
  should   = require('should')


describe('Kafka Producer', function () {

  it('should be constructable', function ProducerConstruct(done) {

    should.exist(Producer)
    let test_producer = new Producer()
    should.exist(test_producer)
    should.exist(test_producer.sendOnce)
    done()
  })




})
