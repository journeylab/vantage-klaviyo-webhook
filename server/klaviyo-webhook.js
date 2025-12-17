// Server-side Klaviyo Integration for Webflow Forms
// This handles Webflow form submissions via webhook and sends to Klaviyo
// Deploy this to a serverless function (Vercel, Netlify, AWS Lambda, etc.)

const https = require('https');

// Klaviyo Configuration
const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_PRIVATE_KEY || 'pk_YOUR_PRIVATE_KEY_HERE'; // Replace with your Klaviyo Private API Key
const KLAVIYO_COMPANY_ID = process.env.KLAVIYO_COMPANY_ID || 'UX2UHq';

/**
 * Main handler for webhook requests
 */
async function handleWebhookRequest(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    // Validate that this is from the Sweepstakes 2025 form
    if (formData.name !== 'Sweepstakes 2025' && formData.form !== 'wf-form-Sweepstakes-2025') {
      console.log('Not a Sweepstakes 2025 form submission, skipping');
      return res.status(200).json({ message: 'Form not matched' });
    }

    // Extract form fields
    const email = formData.Email || formData.email;
    const name = formData.Name || formData.name;
    const phone = formData.Phone || formData.phone;
    const zipCode = formData['Zip-Code'] || formData.zipCode;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Split name into first and last
    const nameParts = (name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Send to Klaviyo
    const result = await createOrUpdateKlaviyoProfile({
      email,
      firstName,
      lastName,
      phone,
      zipCode
    });

    console.log('Successfully sent to Klaviyo:', result);

    return res.status(200).json({
      success: true,
      message: 'Profile updated in Klaviyo'
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Create or update a Klaviyo profile with the sweepstakes property
 */
async function createOrUpdateKlaviyoProfile(data) {
  const { email, firstName, lastName, phone, zipCode } = data;

  // Prepare the profile data using Klaviyo API v2023-10-15
  const profileData = {
    data: {
      type: 'profile',
      attributes: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        location: {
          zip: zipCode
        },
        properties: {
          'sweepstakes-2025': true
        }
      }
    }
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(profileData);

    const options = {
      hostname: 'a.klaviyo.com',
      port: 443,
      path: '/api/profiles/',
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'revision': '2024-10-15'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(responseData);
            resolve(parsed);
          } catch (e) {
            resolve({ success: true, raw: responseData });
          }
        } else {
          reject(new Error(`Klaviyo API error: ${res.statusCode} - ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Export for different serverless platforms

// For Vercel
module.exports = async (req, res) => {
  return handleWebhookRequest(req, res);
};

// For AWS Lambda
module.exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');

  const req = {
    method: event.httpMethod,
    body: body
  };

  const res = {
    statusCode: 200,
    body: '',
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.body = JSON.stringify(data);
      return this;
    }
  };

  await handleWebhookRequest(req, res);

  return {
    statusCode: res.statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: res.body
  };
};

// For Express.js
module.exports.expressHandler = handleWebhookRequest;
