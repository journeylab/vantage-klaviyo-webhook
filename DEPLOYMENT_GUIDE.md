# Klaviyo Webhook Deployment Guide

## Project Overview

This is a server-side webhook handler that receives Webflow form submissions and creates/updates Klaviyo profiles for the Sweepstakes 2025 campaign.

---

## Quick Start (Local Testing)

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your Klaviyo Private API Key
# Get it from: https://www.klaviyo.com/settings/account/api-keys

# Start the server
npm start
```

Server runs on http://localhost:3002

---

## Deploy to Render

### Step 1: Create GitHub Repository

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit - Klaviyo webhook integration"

# Create repo on GitHub (via CLI)
gh repo create vantage-klaviyo-webhook --public --source=. --remote=origin
git push -u origin main
```

### Step 2: Deploy to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account (if not already)
4. Select the `vantage-klaviyo-webhook` repository
5. Configure:
   - **Name**: `vantage-klaviyo-webhook`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter

6. **Add Environment Variables**:
   - `KLAVIYO_PRIVATE_KEY` = `pk_your_private_key_here`
   - `KLAVIYO_COMPANY_ID` = `UX2UHq`
   - `PORT` = `3002` (Render will override this)

7. Click "Create Web Service"

### Step 3: Get Your Webhook URL

After deployment, your webhook URL will be:
```
https://vantage-klaviyo-webhook.onrender.com/webhook/klaviyo
```

---

## Configure Webflow

### Option 1: Form Webhook (Server-Side - Recommended)

1. Go to Webflow → Site Settings → Forms
2. Find "Sweepstakes 2025" form
3. Click "Add Webhook"
4. Enter URL: `https://vantage-klaviyo-webhook.onrender.com/webhook/klaviyo`
5. Save

### Option 2: Client-Side Integration

Add `klaviyo-integration.js` to Webflow Custom Code:

1. Go to Webflow → Project Settings → Custom Code
2. Add to Footer Code (or page-specific code):
```html
<script src="https://your-cdn.com/klaviyo-integration.js"></script>
```

Or paste the contents directly into the footer code section.

---

## Get Klaviyo Private API Key

1. Log in to Klaviyo
2. Go to **Settings** → **API Keys**
3. Click **Create Private API Key**
4. Name it: "Webflow Sweepstakes Integration"
5. Select scopes:
   - ✅ Profiles: Read
   - ✅ Profiles: Write
6. Click **Create**
7. Copy the key (starts with `pk_`)
8. Add to Render environment variables

---

## Testing

### Test the Webhook Endpoint

```bash
curl -X POST https://vantage-klaviyo-webhook.onrender.com/webhook/klaviyo \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sweepstakes 2025",
    "Email": "test@example.com",
    "Name": "John Doe",
    "Phone": "555-1234",
    "Zip-Code": "12345"
  }'
```

Should return:
```json
{
  "success": true,
  "message": "Profile updated in Klaviyo"
}
```

### Test via Webflow

1. Fill out the Sweepstakes 2025 form on your live site
2. Submit the form
3. Check Klaviyo dashboard:
   - Go to Profiles
   - Search for the email you submitted
   - Verify `sweepstakes-2025: true` appears in custom properties

---

## API Endpoints

### Health Check
```
GET /
Response: "Klaviyo webhook server is running"
```

### Webhook Handler
```
POST /webhook/klaviyo
Body: {
  "name": "Sweepstakes 2025",
  "Email": "user@example.com",
  "Name": "First Last",
  "Phone": "555-1234",
  "Zip-Code": "12345"
}
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `KLAVIYO_PRIVATE_KEY` | Your Klaviyo Private API Key (pk_...) | Yes |
| `KLAVIYO_COMPANY_ID` | Your Klaviyo Company ID (default: UX2UHq) | No |
| `PORT` | Server port (Render overrides this) | No |

---

## Monitoring

### Check Render Logs

1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for:
   - "Successfully sent to Klaviyo"
   - Any error messages

### Check Klaviyo

1. Go to Klaviyo Dashboard
2. Click "Profiles"
3. Search for recent submissions
4. Verify custom property `sweepstakes-2025: true`

---

## Troubleshooting

### Webhook not receiving data
- Check Webflow webhook configuration
- Verify webhook URL is correct
- Check Render logs for incoming requests

### Klaviyo API errors
- Verify `KLAVIYO_PRIVATE_KEY` is correct in Render
- Check API key has correct scopes (Profiles: Read/Write)
- Check Render logs for error details

### 500 Errors
- Check Render logs
- Verify all environment variables are set
- Test endpoint with curl command above

---

## Security Notes

- ✅ Private API key stored in environment variables (not in code)
- ✅ API key never committed to git (.gitignore)
- ⚠️ Consider adding webhook signature verification for Webflow
- ⚠️ Consider rate limiting for production use

---

## Next Steps

1. ✅ Deploy to Render
2. ✅ Configure environment variables
3. ✅ Configure Webflow webhook
4. ✅ Test submission
5. ⏳ Monitor for first few days
6. ⏳ Add email notification system (optional)
7. ⏳ Add analytics/tracking (optional)

---

## Support

For issues:
- Check Render logs
- Check Klaviyo API documentation: https://developers.klaviyo.com
- Check Webflow webhook logs
