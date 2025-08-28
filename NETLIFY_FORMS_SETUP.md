# Netlify Forms Setup Guide

## 🚀 Quick Start

The contact form in the footer is already configured to work with Netlify Forms. Once deployed, Netlify will automatically detect and handle form submissions.

## 📋 Step-by-Step Setup Instructions

### 1. Deploy Your Site

```bash
# Commit your changes
git add .
git commit -m "Add contact form to footer"
git push origin main
```

Netlify will automatically build and deploy your site.

### 2. Verify Form Detection

After deployment:
1. Go to your [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Navigate to **Forms** tab
4. You should see a form named **"contact"** listed
5. If not visible, wait 2-3 minutes and refresh

### 3. Configure Form Notifications

#### Email Notifications (Recommended)
1. In Netlify Dashboard → **Site settings** → **Forms** → **Form notifications**
2. Click **Add notification** → Select **Email notification**
3. Configure:
   - **Email to notify**: Your email address
   - **Form**: Select "contact"
   - **Event to listen for**: New form submission
4. Click **Save**

#### Slack Integration (Optional)
1. Click **Add notification** → Select **Slack integration**
2. Authenticate with Slack
3. Select channel and configure message format

#### Webhook (Advanced)
1. Click **Add notification** → Select **Outgoing webhook**
2. Enter webhook URL and configure payload

### 4. Spam Protection

The form already includes:
- ✅ Honeypot field (`bot-field`)
- ✅ Client-side validation
- ✅ Rate limiting (via form submission throttling)

For additional protection:

#### Enable reCAPTCHA (Optional)
1. **Site settings** → **Forms** → **Spam filters**
2. Enable **reCAPTCHA 2**
3. The reCAPTCHA will be automatically added to your form

#### Enable Akismet (Optional)
1. Get an [Akismet API key](https://akismet.com)
2. **Site settings** → **Forms** → **Spam filters**
3. Add your Akismet API key

### 5. Access Form Submissions

#### Via Netlify Dashboard
1. Go to **Forms** tab
2. Click on **"contact"** form
3. View all submissions with timestamps
4. Export as CSV if needed

#### Via API (Pro Plan)
```javascript
// Netlify API endpoint
fetch('https://api.netlify.com/api/v1/sites/{site_id}/forms/{form_id}/submissions', {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
```

### 6. Environment Variables (Optional)

Add to your `.env.local` for local testing:
```env
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
NEXT_PUBLIC_FORM_ENDPOINT=/
```

## 🎨 Form Features

### Current Implementation
- **Fields**: Email (required) + Message (optional, 200 chars)
- **Size**: Ultra-minimal, 36px height
- **Layout**: Responsive (horizontal desktop, stacked mobile)
- **Feedback**: Inline success/error states
- **Styling**: Dark theme with Bitcoin orange accents

### Form HTML Structure
```html
<form 
  name="contact"
  method="POST"
  data-netlify="true"
  data-netlify-honeypot="bot-field"
>
  <input type="hidden" name="form-name" value="contact" />
  <div hidden>
    <input name="bot-field" />
  </div>
  <!-- Form fields -->
</form>
```

## 🔧 Customization Options

### Change Success Behavior
Edit `/src/components/ContactForm.tsx`:

```javascript
// Option 1: Redirect to success page
if (response.ok) {
  window.location.href = '/contact-success';
}

// Option 2: Show custom message
if (response.ok) {
  setStatus('success');
  setSuccessMessage('Thank you! We'll be in touch soon.');
}
```

### Modify Form Fields
To add more fields, update both:
1. `/src/components/ContactForm.tsx` - Add input fields
2. Form handler - Include new fields in FormData

### Style Adjustments
All styles use Tailwind classes in:
- `/src/components/ContactForm.tsx` - Form component
- `/src/components/ui/textarea.tsx` - Textarea styles
- `/src/components/Footer.tsx` - Integration point

## 🐛 Troubleshooting

### Form Not Detected
1. Ensure `data-netlify="true"` is present
2. Check form has `name` attribute
3. Verify hidden `form-name` input matches form name
4. Clear build cache and redeploy

### Submissions Not Received
1. Check spam folder in Netlify Forms
2. Verify notifications are configured
3. Test without honeypot field temporarily
4. Check browser console for errors

### Styling Issues
1. Run `npm run build` locally to verify
2. Check Tailwind classes are not purged
3. Verify CSS order in production build

### CORS/CSP Issues
Already configured in `netlify.toml`:
- Form submissions allowed to same origin
- CSP allows form-action to 'self'

## 📊 Monitoring

### Form Analytics
View in Netlify Dashboard:
- Submission count
- Spam vs verified ratio
- Time-based trends
- Geographic distribution

### Set Up Alerts
1. **Site settings** → **Forms** → **Form notifications**
2. Configure webhooks to monitoring services
3. Set up email digest for daily summaries

## 🔐 Security Best Practices

1. **Never expose API keys** in client-side code
2. **Rate limit** form submissions (Netlify handles this)
3. **Validate** all inputs client and server-side
4. **Sanitize** data before displaying
5. **Use HTTPS** only (Netlify enforces this)
6. **Regular spam filter** updates

## 📝 Testing Checklist

Before going live:
- [ ] Test form submission locally
- [ ] Deploy to Netlify staging
- [ ] Submit test entry
- [ ] Verify email notification received
- [ ] Check form appears in dashboard
- [ ] Test on mobile devices
- [ ] Verify spam protection works
- [ ] Test error states
- [ ] Confirm success feedback

## 🚨 Important Notes

1. **Form Detection**: Happens during build, not runtime
2. **Localhost Testing**: Won't submit to Netlify, but will work in production
3. **Rate Limits**: Netlify limits to 100 submissions/month on free plan
4. **Data Retention**: Submissions stored for 30 days on free plan
5. **GDPR Compliance**: Add privacy notice if collecting EU data

## 📚 Resources

- [Netlify Forms Documentation](https://docs.netlify.com/forms/setup/)
- [Form Spam Filters](https://docs.netlify.com/forms/spam-filters/)
- [Form Notifications](https://docs.netlify.com/forms/notifications/)
- [Forms API](https://docs.netlify.com/api/get-started/#forms)

## 💡 Pro Tips

1. **Export Regularly**: Download CSV backups monthly
2. **Integrate with CRM**: Use webhooks to sync with your CRM
3. **A/B Testing**: Create multiple forms with different names
4. **Custom Thank You**: Use `/contact-success` page for better UX
5. **Monitor Spam**: Review spam folder weekly for false positives

---

For additional help, check the [Netlify Community Forum](https://answers.netlify.com/) or contact support.