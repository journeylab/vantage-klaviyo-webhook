require('dotenv').config();
const express = require('express');
const cors = require('cors');
const klaviyoWebhook = require('./server/klaviyo-webhook');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Klaviyo webhook server is running');
});

// Klaviyo webhook endpoint
app.post('/webhook/klaviyo', klaviyoWebhook.expressHandler);

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Klaviyo webhook server running on port ${port}`);
});
