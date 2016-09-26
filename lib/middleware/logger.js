'use strict'

const LogProducer = require('../producer')

module.exports = (config) => {

  const logProducer = new LogProducer(config);

  function* loggingMiddleWare(next) {
    if (this.log) {
      return yield next
    }

    Object.assign(this, {
      log: logProducer
    })


    yield next;
  }

  return {
    log: LogProducer,
    middleware: loggingMiddleWare
  }

}



