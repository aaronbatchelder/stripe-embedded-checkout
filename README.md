# Stripe Checkout Playground

An interactive playground for comparing and testing the 3 flavors of Stripe Checkout — built to help designers and non-technical stakeholders understand what can and can't be customized.

**Live Demo:** https://stripe-embedded-checkout-opal.vercel.app

## Checkout Flavors

### 1. Embedded Checkout (`/embedded.html`)
Stripe's pre-built checkout form rendered in an iframe on your page. Minimal dev effort, but styling is limited to Stripe Dashboard branding settings.

- Payment modes (one-time, subscription)
- Button types (Pay, Book, Donate)
- Data collection (phone, shipping, billing, tax ID)
- Shipping rates with delivery estimates
- Discounts and promotion codes
- Custom fields (text, dropdown, numeric)
- Custom messages and consent collection
- Trial periods, session expiration, invoice creation
- 12+ languages, multiple payment methods

### 2. Stripe-Hosted Checkout (`/hosted.html`)
Redirects to a Stripe-hosted page at `checkout.stripe.com`. Same features as embedded, but the customer leaves your site entirely.

### 3. Custom Elements (`/custom.html`)
Full UI control using Stripe's PaymentElement. Supports the Appearance API for complete visual customization — theme presets, custom colors, fonts, border radius, and more.

### 4. Branded Checkout Demo (`/branded.html`)
Shows how to wrap Embedded Checkout with school/company branding — custom header, colors, logo, marketing copy, and trust badges. Includes quick presets (Dark Tech, Blue Academy, Warm/Creative) and a live branding configurator.

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/aaronbatchelder/stripe-embedded-checkout.git
cd stripe-embedded-checkout
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get your Stripe keys

Go to https://dashboard.stripe.com/test/apikeys and copy:
- **Publishable key** (starts with `pk_test_`)
- **Secret key** (starts with `sk_test_`)

### 4. Create `.env` file

```bash
cp .env.example .env
```

Edit `.env`:
```
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
```

### 5. Run locally

```bash
npm start
```

Open http://localhost:4242

## Deploy to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 2. Deploy

```bash
vercel --prod
```

### 3. Set environment variables

```bash
echo -n "sk_test_YOUR_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY production
echo -n "pk_test_YOUR_PUBLISHABLE_KEY" | vercel env add STRIPE_PUBLISHABLE_KEY production
vercel --prod
```

## Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0027 6000 3184 | 3D Secure |

Use any future expiration date and any 3-digit CVC.

## Customization Trade-offs

| | Embedded Checkout | Hosted Checkout | Custom Elements |
|---|---|---|---|
| **UI Control** | Low | None | Full |
| **Dev Effort** | Low | Minimal | High |
| **Styling** | Dashboard branding only | Dashboard branding only | Appearance API (colors, fonts, borders, themes) |
| **Layout** | Fixed | Fixed | Your own HTML/CSS |
| **PCI Scope** | SAQ-A | SAQ-A | SAQ-A (with Elements) |

Embedded and Hosted Checkout appearance (colors, fonts, logo) is controlled via [Stripe Dashboard Branding Settings](https://dashboard.stripe.com/settings/branding), not the API. For full styling control, use Custom Elements with the [Appearance API](https://stripe.com/docs/elements/appearance-api).

## License

MIT
