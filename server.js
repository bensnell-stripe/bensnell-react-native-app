const express = require("express");
const app = express();
// This is your real test secret API key.
const stripe = require("stripe")("sk_test_oyRzn9Ps6A9VOAJQE7zy7OiG");

app.use(express.static("."));
app.use(express.json());

app.post('/payment-sheet-setup-intent', async (req, res) => {
  
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2020-08-27' }
  );

  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ['card', 'us_bank_account'],
  });

  res.json({
    // paymentIntent: paymentIntent.client_secret,
    setupIntent: setupIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  });
});



app.post('/payment-sheet-payment-intent', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2020-08-27' }
  );

  // const subscription = await stripe.subscriptions.create({
  //   customer: customer.id,
  //   items: [
  //     { price: 'price_1L5fy4BpF9kEgTScQvKXxZRG' },
  //   ],
  //   payment_behavior: 'default_incomplete',
  //   expand: ['latest_invoice.payment_intent']
  // });


  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'usd',
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  });
});


app.post('/create-payment-intent', async (req, res) => {
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true
    },
  });
  const clientSecret = paymentIntent.client_secret;
  res.json({ clientSecret: clientSecret });
});


app.post('/create-setup-intent', async (req, res) => {
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2020-08-27' }
  );

  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ['us_bank_account']
  });
  const clientSecret = setupIntent.client_secret;
  res.json({ clientSecret: clientSecret });
});

app.listen(200, () => console.log('Node server listening on port 200!'));
