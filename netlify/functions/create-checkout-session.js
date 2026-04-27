// Creates a Stripe Checkout Session for the £50 booking deposit.
// The amount is hard-coded server-side so the client cannot lower it.
const Stripe = require('stripe');

const DEPOSIT_PENCE = 5000; // £50.00
const CURRENCY = 'gbp';

function clip(value, max) {
  return String(value == null ? '' : value).slice(0, max);
}

function originFromEvent(event) {
  const headers = event.headers || {};
  const explicit = headers.origin || headers.Origin;
  if (explicit) return explicit.replace(/\/+$/, '');
  const host = headers.host || headers.Host;
  if (host) {
    const proto = headers['x-forwarded-proto'] || 'https';
    return `${proto}://${host}`;
  }
  return 'https://hausio.co.uk';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

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

  const origin = originFromEvent(event);
  const email = clip(body.email, 100);
  const fullName = clip(body.fullName, 100);
  const service = clip(body.service, 40) || 'service';

  const metadata = {
    deposit: 'true',
    service,
    full_name: fullName,
    email,
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
  };

  try {
    const stripe = Stripe(secret, { apiVersion: '2024-12-18.acacia' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: CURRENCY,
      customer_creation: 'always',
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      customer_email: email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: DEPOSIT_PENCE,
            product_data: {
              name: 'Hausio booking deposit',
              description: `Refundable £50 deposit · ${service}${fullName ? ' · ' + fullName : ''}`,
            },
          },
        },
      ],
      payment_intent_data: {
        description: `Hausio booking deposit (${service})`,
        receipt_email: email || undefined,
        metadata,
      },
      metadata,
      success_url: `${origin}/book.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book.html?payment=cancelled`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: session.url,
        sessionId: session.id,
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
