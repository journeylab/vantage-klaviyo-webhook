// Klaviyo Integration Script for Sweepstakes 2025 Form
// This script captures form submissions and sends data to Klaviyo

(function() {
  'use strict';

  // Configuration
  const KLAVIYO_API_KEY = 'UX2UHq';
  const KLAVIYO_LIST_ID = 'UX2UHq'; // Using Site ID as provided
  const FORM_ID = 'wf-form-Sweepstakes-2025';

  // Wait for DOM to be ready
  function initKlaviyoIntegration() {
    const form = document.getElementById(FORM_ID);

    if (!form) {
      console.error('Sweepstakes 2025 form not found');
      return;
    }

    console.log('Klaviyo integration initialized for Sweepstakes 2025 form');

    // Intercept form submission
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(form);
      const name = formData.get('Name');
      const email = formData.get('Email');
      const phone = formData.get('Phone');
      const zipCode = formData.get('Zip-Code');

      // Validate required fields
      if (!email || !name) {
        console.error('Missing required fields');
        return;
      }

      // Send to Klaviyo
      sendToKlaviyo({
        email: email,
        name: name,
        phone: phone,
        zipCode: zipCode
      }).then(function(success) {
        if (success) {
          // Allow the form to proceed with its normal redirect
          window.location.href = form.getAttribute('redirect') || '/confirmation/sweepstakes-confirmation';
        } else {
          // Show error message
          const errorDiv = form.parentElement.querySelector('.w-form-fail');
          if (errorDiv) {
            errorDiv.style.display = 'block';
          }
        }
      });
    });
  }

  // Send data to Klaviyo API
  function sendToKlaviyo(data) {
    return new Promise(function(resolve) {
      // Split name into first and last
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Prepare Klaviyo profile data
      const profileData = {
        token: KLAVIYO_API_KEY,
        properties: {
          '$email': data.email,
          '$first_name': firstName,
          '$last_name': lastName,
          '$phone_number': data.phone || '',
          '$zip': data.zipCode || '',
          'sweepstakes-2025': true,
          '$consent': ['email', 'sms'] // Opt-in for marketing
        }
      };

      // Using Klaviyo's track API to identify the user and set properties
      const identifyUrl = 'https://a.klaviyo.com/api/identify';

      // Create the request
      const xhr = new XMLHttpRequest();
      xhr.open('GET', identifyUrl + '?data=' + encodeURIComponent(btoa(JSON.stringify(profileData))), true);

      xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 1) {
          console.log('Successfully sent to Klaviyo');
          resolve(true);
        } else {
          console.error('Klaviyo API error:', xhr.status);
          resolve(false);
        }
      };

      xhr.onerror = function() {
        console.error('Network error sending to Klaviyo');
        resolve(false);
      };

      xhr.send();

      // Also try using the newer Klaviyo client-side API if available
      if (window._learnq) {
        window._learnq.push(['identify', {
          '$email': data.email,
          '$first_name': firstName,
          '$last_name': lastName,
          '$phone_number': data.phone || '',
          '$zip': data.zipCode || '',
          'sweepstakes-2025': true
        }]);

        // Track the event
        window._learnq.push(['track', 'Sweepstakes Entry', {
          'sweepstakes_name': 'Sweepstakes 2025',
          'entry_date': new Date().toISOString()
        }]);
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKlaviyoIntegration);
  } else {
    initKlaviyoIntegration();
  }
})();
