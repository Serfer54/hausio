// Creates a £50 booking-deposit PaymentIntent on Stripe.
// The amount is hard-coded server-side so the client cannot lower it.
const Stripe = require('stripe');

const DEPOSIT_PENCE = 5000; // £50.00
const CURRENCY = 'gbp';

function clip(value, max) {
  return String(value == null ? '' : value).slice(0, max);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Defensively strip whitespace and trailing '=' that frequently gets pasted in by accident.
  // Stripe API keys are alphanumeric, never contain whitespace, and never end in '=', so this is safe.
  const rawSecret = process.env.STRIPE_SECRET_KEY || '';
  const secret = rawSecret.trim().replace(/[=\s]+$/, '');
  if (!secret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in Netlify env.' }),
    };
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  try {
    const stripe = Stripe(secret, { apiVersion: '2024-12-18.acacia' });

    const intent = await stripe.paymentIntents.create({
      amount: DEPOSIT_PENCE,
      currency: CURRENCY,
      automatic_payment_methods: { enabled: true },
      description: `Hausio booking deposit (${clip(body.service, 40) || 'service'})`,
      receipt_email: body.email ? clip(body.email, 100) : undefined,
      metadata: {
        deposit: 'true',
        service: clip(body.service, 40),
        full_name: clip(body.fullName, 100),
        email: clip(body.email, 100),
        phone: clip(body.phone, 30),
        postcode: clip(body.postcode, 12),
        address: clip(body.address, 200),
        date: clip(body.date, 20),
        time: clip(body.time, 10),
        frequency: clip(body.frequency, 20),
        estimated_total: clip(body.estimatedTotal, 20),
        dropoff_postcode: clip(body.dropoffPostcode, 12),
        dropoff_address: clip(body.dropoffAddress, 200),
        pickup_floor: clip(body.pickupFloor, 10),
        pickup_lift: clip(body.pickupLift, 10),
        dropoff_floor: clip(body.dropoffFloor, 10),
        dropoff_lift: clip(body.dropoffLift, 10),
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amount: DEPOSIT_PENCE,
        currency: CURRENCY,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Stripe error' }),
    };
  }
};
