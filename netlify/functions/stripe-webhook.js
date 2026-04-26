// Receives Stripe events. Configure in Stripe Dashboard:
//   Endpoint URL: https://hausio.co.uk/api/stripe-webhook
//   Events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
// Then put the signing secret in Netlify env as STRIPE_WEBHOOK_SECRET.
const Stripe = require('stripe');

exports.handler = async (event) => {
  // Same defensive trim as create-payment-intent (strip whitespace + trailing '=' from copy-paste).
  const rawSecret = process.env.STRIPE_SECRET_KEY || '';
  const secret = rawSecret.trim().replace(/[=\s]+$/, '');
  const rawWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const webhookSecret = rawWebhookSecret.trim().replace(/[=\s]+$/, '');

  if (!secret || !webhookSecret) {
    return { statusCode: 500, body: 'Stripe webhook is not configured.' };
  }

  const stripe = Stripe(secret, { apiVersion: '2024-12-18.acacia' });
  const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  if (!signature) return { statusCode: 400, body: 'Missing Stripe signature' };

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, signature, webhookSecret);
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  switch (stripeEvent.type) {
    case 'payment_intent.succeeded': {
      const intent = stripeEvent.data.object;
      console.log('Deposit captured', {
        id: intent.id,
        amount: intent.amount,
        email: intent.metadata && intent.metadata.email,
        service: intent.metadata && intent.metadata.service,
      });
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = stripeEvent.data.object;
      console.log('Deposit failed', { id: intent.id, reason: intent.last_payment_error && intent.last_payment_error.message });
      break;
    }
    case 'charge.refunded': {
      const charge = stripeEvent.data.object;
      console.log('Deposit refunded', { id: charge.id, amount_refunded: charge.amount_refunded });
      break;
    }
    default:
      // Ignore everything else
      break;
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
