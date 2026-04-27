// One-off helper to inspect the Apple Pay status of our payment method domain in Stripe.
// Hit https://hausio.co.uk/api/check-apple-pay to see the JSON status.
const Stripe = require('stripe');

const PMD_ID = 'pmd_1TQo2BBINurifU5hdUXGtCew';

exports.handler = async () => {
  const rawSecret = process.env.STRIPE_SECRET_KEY || '';
  const secret = rawSecret.trim().replace(/[=\s]+$/, '');
  if (!secret) {
    return { statusCode: 500, body: 'STRIPE_SECRET_KEY missing' };
  }

  try {
    const stripe = Stripe(secret, { apiVersion: '2024-12-18.acacia' });
    const domain = await stripe.paymentMethodDomains.retrieve(PMD_ID);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: domain.id,
        domain_name: domain.domain_name,
        enabled: domain.enabled,
        apple_pay: domain.apple_pay,
        google_pay: domain.google_pay,
        link: domain.link,
        paypal: domain.paypal,
      }, null, 2),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || String(err) }),
    };
  }
};
