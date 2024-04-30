const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');

const app = express();
const PORT = 3010;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Mengaktifkan penguraian data dari x-www-form-urlencoded
app.use(cors()); 

// Fungsi untuk mengirim pesan ke antrian
async function sendMessage(queueName, msg) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    
    const queue = queueName || 'Notification';
    
    await channel.assertQueue(queue, { durable: false });
    await channel.sendToQueue(queue, Buffer.from(msg));

    console.log("Message sent successfully to queue:", queue);
    
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function getMessage(queueName) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    
    const queue = queueName || 'Notification';
    
    await channel.assertQueue(queue, { durable: false });
    const message = await channel.get(queue);
    
    if (message) {
      console.log("Message received:", message.content.toString());
      return message.content.toString();
    } else {
      console.log("No messages in the queue:", queue);
      return null;
    }

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

function authenticateToken(req, res, next) {
  const token = req.query.token;
  if (token === 'mysecrettoken') { 
    next(); 
  } else {
    res.sendStatus(401);
  }
}

app.post('/send-message', authenticateToken, async (req, res) => {
  try {
    const { queue, message } = req.body;
    console.log("Request received:", req.body);
    if (!message || !queue) {
      return res.status(400).json({ success: false, message: 'No message or queue provided', queue: queue, message: message });
    }
    console.log("Message received:", message);
    await sendMessage(queue, message);
    res.json({ success: true, message: 'Message sent successfully to queue', queue: queue, message: message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: 'Failed to send message', queue: queue, message: message });
  }
});

app.get('/get-message', async (req, res) => {
  try {
    const { queue } = req.query;
    console.log("Get message request received for queue:", queue);
    const message = await getMessage(queue);
    if (message) {
      const notification = {
        title: "New Message", 
        body: message 
      };
      res.status(200).json(notification); 
    } else {
      res.status(404).json({ error: 'No messages in the queue' }); 
    }
  } catch (error) {
    console.error("Error getting message:", error);
    res.status(500).json({ error: 'Failed to get message' }); 
  }
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
