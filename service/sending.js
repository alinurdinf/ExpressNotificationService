const axios = require('axios');

async function sendNotification(queue, message) {
  axios.post('http://localhost:3010/send-message', {
    queue: queue,
    message: message, 
  }, {
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

sendNotification('4529_notification', 'Heloo from the other side!'); 