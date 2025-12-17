# Webflow to Klaviyo Integration for Sweepstakes 2025

This integration connects the "Sweepstakes 2025" form on your Webflow site to Klaviyo, automatically opting in subscribers with a custom profile property `sweepstakes-2025: true`.

## Overview

**Webflow Site ID**: `678e895adc23a4aae8d5c61c`
**Form Name**: `Sweepstakes 2025`
**Form ID**: `wf-form-Sweepstakes-2025`
**Klaviyo Site ID**: `UX2UHq`

## Integration Methods

You have two options for integrating Webflow with Klaviyo:

### Option 1: Client-Side Integration (Quick Setup)

Use this method if you want a simple, immediate solution without setting up a server.

#### Steps:

1. **Add Klaviyo Snippet to Webflow**
   - Go to your Webflow project dashboard
   - Navigate to Project Settings → Custom Code
   - In the "Footer Code" section, add the Klaviyo tracking script:

   ```html
   <script type="text/javascript">
     !function(){if(!window.klaviyo){window._klaviyoq=[];var e=window.klaviyo=function(e,t,n){_klaviyoq.push([e,t,n])};e.push=function(e){_klaviyoq.push(e)};e.track=function(e,t,n){_klaviyoq.push(["track",e,t,n])};e.identify=function(e){_klaviyoq.push(["identify",e])};var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=UX2UHq";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)}}();
   </script>
   ```

2. **Add the Integration Script**
   - In the same "Footer Code" section (or in the page-specific settings for the sweepstakes page), add the contents of `klaviyo-integration.js`
   - Or, host `klaviyo-integration.js` on a CDN and include it:

   ```html
   <script src="https://your-cdn.com/klaviyo-integration.js"></script>
   ```

3. **Publish Your Site**
   - Publish your Webflow site for the changes to take effect

#### Limitations:
- Requires JavaScript to be enabled in the browser
- Klaviyo's client-side API has rate limits
- Less reliable than server-side integration

---

### Option 2: Server-Side Webhook Integration (Recommended)

This is the more robust and reliable method, recommended for production use.

#### Steps:

1. **Deploy the Webhook Handler**

   You need to deploy `server/klaviyo-webhook.js` to a serverless platform. Here are options:

   **Option A: Vercel (Recommended)**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Create a vercel.json file
   cat > vercel.json << EOF
   {
     "functions": {
       "server/klaviyo-webhook.js": {
         "memory": 1024,
         "maxDuration": 10
       }
     }
   }
   EOF

   # Deploy
   vercel
   ```

   **Option B: Netlify**

   Create a `netlify.toml` file:
   ```toml
   [functions]
     directory = "server"
   ```

   Then deploy via Netlify CLI or connect your Git repository.

   **Option C: AWS Lambda**

   - Create a new Lambda function
   - Upload `server/klaviyo-webhook.js`
   - Create an API Gateway trigger
   - Use the endpoint URL

2. **Get Your Klaviyo Private API Key**

   - Log in to Klaviyo
   - Go to Settings → API Keys
   - Create a new Private API Key with the following scopes:
     - `Profiles: Read`
     - `Profiles: Write`
   - Copy the private key (starts with `pk_`)

3. **Update the Webhook Handler**

   In `server/klaviyo-webhook.js`, replace:
   ```javascript
   const KLAVIYO_PRIVATE_KEY = 'pk_YOUR_PRIVATE_KEY_HERE';
   ```
   with your actual private key.

4. **Configure Webflow Form Webhook**

   - In Webflow, go to your site settings
   - Navigate to Forms tab
   - Find the "Sweepstakes 2025" form
   - Add a webhook URL (the URL of your deployed function)
   - Example: `https://your-vercel-app.vercel.app/api/klaviyo-webhook`

5. **Test the Integration**

   - Submit a test entry through your form
   - Check your Klaviyo dashboard to verify:
     - A new profile was created or updated
     - The email address matches
     - The custom property `sweepstakes-2025` is set to `true`

---

## What Gets Sent to Klaviyo

When someone submits the Sweepstakes 2025 form, the following data is sent to Klaviyo:

- **Email**: Required field
- **First Name**: Extracted from the "Name" field
- **Last Name**: Extracted from the "Name" field
- **Phone Number**: Optional
- **Zip Code**: Optional
- **Custom Property**: `sweepstakes-2025: true`
- **Marketing Consent**: Automatically opted in for email/SMS marketing

## Testing

To test the integration:

1. Fill out the Sweepstakes 2025 form on your live site
2. Check the browser console (F12) for any errors (client-side only)
3. Log in to Klaviyo and search for the email you submitted
4. Verify the profile has `sweepstakes-2025: true` in the custom properties

## Troubleshooting

### Client-Side Issues

- **Form not submitting**: Check browser console for JavaScript errors
- **Data not appearing in Klaviyo**: Verify the Klaviyo snippet is loaded and the Site ID is correct
- **CORS errors**: Client-side API may have restrictions; consider server-side integration

### Server-Side Issues

- **Webhook not receiving data**: Check Webflow's webhook logs
- **Klaviyo API errors**: Verify your Private API Key has the correct scopes
- **Missing data**: Check the webhook handler logs for the exact payload from Webflow

## Connecting to Webflow via CLI

To connect to your Webflow site using the CLI:

```bash
# Install Webflow CLI (if not already installed)
npm install -g @webflow/cli

# Authenticate
webflow login

# Clone your site
webflow site clone 678e895adc23a4aae8d5c61c
```

Note: The Webflow CLI is primarily for Webflow Apps and Designer Extensions. For form integrations, you'll need to use the Custom Code method or webhooks as described above.

## Security Notes

- **Never commit your Klaviyo Private API Key to version control**
- Use environment variables for sensitive data:
  ```javascript
  const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_PRIVATE_KEY;
  ```
- Validate webhook requests to ensure they're from Webflow (check origin, add a secret token, etc.)

## Next Steps

1. Choose your integration method (client-side or server-side)
2. Get your Klaviyo Private API Key (for server-side)
3. Deploy the webhook handler (for server-side) or add the script to Webflow (for client-side)
4. Test the integration
5. Monitor submissions in Klaviyo

## Support

If you encounter any issues:
- Check the browser console for errors (client-side)
- Check your serverless function logs (server-side)
- Verify your Klaviyo API credentials
- Ensure the form name/ID matches exactly
