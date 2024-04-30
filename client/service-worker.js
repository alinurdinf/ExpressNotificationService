const axios = require('axios');

async function pollMessages() {
    try {
        const url = 'http://localhost:3010/get-message?queue=4529_notification';

        const response = await axios.get(url);

        if (response.status === 200) {
            const message = response.data;
            console.log("Received message:", message);

            if (message) {
                showNotification(message.title, message.body);
            }
        } else {
            console.error('Failed to retrieve message:', response.statusText);
        }
    } catch (error) {
        console.error('Error retrieving message:', error.message);
    }
}

async function startServiceWorker() {
    const pollingInterval = 5000; 

    setInterval(pollMessages, pollingInterval);

    console.log('Service worker started. Polling for messages...');
}

startServiceWorker();

function showNotification(title, body) {
    if ('Notification' in window) {
        Notification.requestPermission(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: body });
            }
        });
    } else {
        console.error('This browser does not support notifications');
    }
}
