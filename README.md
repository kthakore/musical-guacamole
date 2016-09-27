# musical-guacamole
Koa, Kafka, PostgreSQL, Mocha, Should, ESLint, Sequelize Application


![Woohoo](https://raw.githubusercontent.com/kthakore/musical-guacamole/master/test_run.gif)

# Works on
  - MacOSX (OSX El Capitan)
  - Docker for Mac Version 1.12.1-beta26.1 (build: 12100)
  - node v5.5.0


# Start the Server

  - npm start


# Run the tests

  - npm test

* Please note that the test have timeout to check if the app.log file. Sometimes the timing is a bit off
* TODO: Change this to have a redis queue to do async asserts on the app.log file lines

# Start the consumer

  - npm run start-consumer


