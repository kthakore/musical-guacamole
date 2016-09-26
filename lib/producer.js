var Kafka = require('no-kafka'),
  producer = new Kafka.Producer()


class LogProducer {

  constructor(options) {
    this.topic = options.topic
  }

  sendOnce(options) {
    let self = this;
    return producer.init().then(function(){
      return producer.send({
        topic: self.topic,
        partition: options.partition || 0,
        message: {
          value: JSON.stringify(options.message) + "\n"
        }
      })
    })
    .then(function (result) {
      producer.end()
    });
  }

};



module.exports = LogProducer


