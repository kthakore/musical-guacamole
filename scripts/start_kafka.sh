
cd ~/kafka

nohup ~/kafka/bin/zookeeper-server-start.sh ~/kafka/config/zookeeper.properties  > ~/kafka/zookeeper.log 2>&1 &

sleep 10

nohup ~/kafka/bin/kafka-server-start.sh ~/kafka/config/server.properties > ~/kafka/kafka.log 2>&1 &

sleep 10

./bin/kafka-topics.sh  --create --zookeeper localhost:2181 --replication-factor 1 --partition 1 --topic log

