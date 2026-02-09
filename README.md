# Stripe Embedded Checkout Playground

A fully-featured playground for testing Stripe Embedded Checkout customization options.

**Live Demo:** https://stripe-embedded-checkout-opal.vercel.app

## Features

- **Payment Modes** - One-time payments or subscriptions
- **Button Types** - Pay, Book, Donate
- **Data Collection** - Phone, shipping address, billing address, tax ID
- **Shipping Rates** - Define shipping options with delivery estimates
- **Discounts** - Pre-apply coupons, allow promotion codes
- **Custom Fields** - Add up to 3 custom fields (text, dropdown, numeric)
- **Custom Messages** - Submit button message, terms text, shipping info
- **Consent Collection** - Terms acceptance, marketing opt-in
- **Metadata** - Attach custom key/value data
- **Trial Periods** - Free trials for subscriptions
- **Localization** - 12+ languages
- **Payment Methods** - Card, ACH, Link, Affirm, Afterpay, Klarna, Cash App, PayPal
- **Advanced** - Session expiration, recovery, invoice creation

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

## What You Can't Customize

Embedded Checkout appearance (colors, fonts, logo) is controlled via your [Stripe Dashboard Branding Settings](https://dashboard.stripe.com/settings/branding), not the API.

For full styling control, use [Stripe Elements](https://stripe.com/docs/payments/elements) instead.

## License

MIT
