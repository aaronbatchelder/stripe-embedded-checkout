require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.static('public'));
app.use(express.json());

const PORT = process.env.PORT || 4242;

// Serve publishable key to frontend
app.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Create a checkout session for embedded checkout
app.post('/create-checkout-session', async (req, res) => {
  try {
    const {
      mode = 'payment',
      lineItems,
      uiMode = 'embedded',
      customFields = [],
      phoneNumberCollection = false,
      shippingAddressCollection = null,
      allowPromotionCodes = false,
      consentCollection = null,
      customText = null,
      customerEmail = null,
      billingAddressCollection = 'auto',
      taxIdCollection = false,
      adjustableQuantity = false,
      submitType = 'auto',
      locale = 'auto',
      expiresInMinutes = null,
      paymentMethodTypes = null,
      currency = 'usd',
      // New options
      shippingOptions = [],
      automaticTax = false,
      discounts = [],
      metadata = {},
      trialPeriodDays = null,
      invoiceCreation = false,
      customerCreation = 'if_required',
      recoveryEnabled = false,
      savedPaymentMethodOptions = null,
    } = req.body;

    // Default line items if none provided
    const items = lineItems || [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: 'Sample Product',
            description: 'A test product for checkout experimentation',
            images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ];

    // Add adjustable quantity if enabled
    if (adjustableQuantity) {
      items.forEach(item => {
        item.adjustable_quantity = {
          enabled: true,
          minimum: 1,
          maximum: 10,
        };
      });
    }

    const origin = req.headers.origin || 'http://localhost:' + PORT;

    const sessionConfig = {
      ui_mode: uiMode,
      line_items: items,
      mode: mode,
      phone_number_collection: {
        enabled: phoneNumberCollection,
      },
      allow_promotion_codes: allowPromotionCodes,
      billing_address_collection: billingAddressCollection,
      locale: locale,
      customer_creation: customerCreation,
    };

    // Customer email prefill
    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    // Tax ID collection
    if (taxIdCollection) {
      sessionConfig.tax_id_collection = { enabled: true };
    }

    // Automatic tax
    if (automaticTax) {
      sessionConfig.automatic_tax = { enabled: true };
    }

    // Submit button type (only for payment mode)
    if (mode === 'payment' && submitType !== 'auto') {
      sessionConfig.submit_type = submitType;
    }

    // Session expiration
    if (expiresInMinutes) {
      sessionConfig.expires_at = Math.floor(Date.now() / 1000) + (expiresInMinutes * 60);
    }

    // Payment method types
    if (paymentMethodTypes && paymentMethodTypes.length > 0) {
      sessionConfig.payment_method_types = paymentMethodTypes;
    }

    // Shipping address collection
    if (shippingAddressCollection) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: shippingAddressCollection.allowedCountries || ['US', 'CA', 'GB'],
      };
    }

    // Shipping options
    if (shippingOptions && shippingOptions.length > 0) {
      sessionConfig.shipping_options = shippingOptions;
    }

    // Custom fields (up to 3)
    if (customFields.length > 0) {
      sessionConfig.custom_fields = customFields;
    }

    // Consent collection
    if (consentCollection) {
      sessionConfig.consent_collection = consentCollection;
    }

    // Custom text
    if (customText) {
      sessionConfig.custom_text = customText;
    }

    // Discounts (coupons)
    if (discounts && discounts.length > 0) {
      sessionConfig.discounts = discounts;
    }

    // Metadata
    if (metadata && Object.keys(metadata).length > 0) {
      sessionConfig.metadata = metadata;
    }

    // Invoice creation (for payment mode)
    if (invoiceCreation && mode === 'payment') {
      sessionConfig.invoice_creation = {
        enabled: true,
        invoice_data: {
          description: 'Invoice for your purchase',
        },
      };
    }

    // Session recovery after expiration
    if (recoveryEnabled) {
      sessionConfig.after_expiration = {
        recovery: {
          enabled: true,
          allow_promotion_codes: allowPromotionCodes,
        },
      };
    }

    // For subscription mode
    if (mode === 'subscription') {
      sessionConfig.line_items = [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: lineItems?.[0]?.price_data?.product_data?.name || 'Monthly Subscription',
              description: 'A recurring monthly subscription',
            },
            unit_amount: lineItems?.[0]?.price_data?.unit_amount || 999,
            recurring: {
              interval: 'month',
            },
          },
          quantity: lineItems?.[0]?.quantity || 1,
          ...(adjustableQuantity && {
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
              maximum: 10,
            },
          }),
        },
      ];

      // Trial period for subscriptions
      if (trialPeriodDays && trialPeriodDays > 0) {
        sessionConfig.subscription_data = {
          trial_period_days: trialPeriodDays,
        };
      }
    }

    // URL configuration based on UI mode
    if (uiMode === 'hosted') {
      sessionConfig.success_url = `${origin}/return?session_id={CHECKOUT_SESSION_ID}`;
      sessionConfig.cancel_url = `${origin}/hosted.html`;
    } else {
      sessionConfig.return_url = `${origin}/return?session_id={CHECKOUT_SESSION_ID}`;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    const response = { sessionId: session.id };
    if (uiMode === 'embedded') {
      response.clientSecret = session.client_secret;
    } else {
      response.url = session.url;
    }
    res.json(response);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// List available coupons
app.get('/coupons', async (req, res) => {
  try {
    const coupons = await stripe.coupons.list({ limit: 20 });
    res.json(coupons.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a test coupon
app.post('/create-test-coupon', async (req, res) => {
  try {
    const coupon = await stripe.coupons.create({
      percent_off: 20,
      duration: 'once',
      name: '20% Off Test Coupon',
    });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve session status for return page
app.get('/session-status', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id, {
      expand: ['line_items', 'customer', 'payment_intent', 'invoice'],
    });
    res.json({
      status: session.status,
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name,
      customer_phone: session.customer_details?.phone,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      amount_subtotal: session.amount_subtotal,
      total_details: session.total_details,
      currency: session.currency,
      line_items: session.line_items?.data,
      shipping: session.shipping_details,
      shipping_cost: session.shipping_cost,
      custom_fields: session.custom_fields,
      metadata: session.metadata,
      invoice: session.invoice,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a payment intent for custom Elements checkout
app.post('/create-payment-intent', async (req, res) => {
  try {
    const {
      amount = 2000,
      currency = 'usd',
      productName = 'Sample Product',
      metadata = {},
    } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
      description: productName,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Retrieve payment intent status for return page
app.get('/payment-status', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.query.payment_intent);
    res.json({
      status: paymentIntent.status === 'succeeded' ? 'complete' : paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer_email: paymentIntent.receipt_email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for real integrations
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout completed!', session.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Only listen when running locally (not on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to see the checkout`);
  });
}

// Export for Vercel serverless
module.exports = app;
