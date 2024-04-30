const amqp = require('amqplib');

async function consumeMessages(key) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    
    await channel.assertQueue(key, { durable: false });

    channel.consume(key, (msg) => {
      console.log("Message received: " + msg.content.toString());
    }, { noAck: true });

    console.log("Waiting for messages...");
  } catch (error) {
    console.error("Error:", error);
  }
}

consumeMessages('4529_notification');
