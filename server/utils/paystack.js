const axios = require('axios');

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

const initializePayment = async ({ email, amount, metadata, callback_url }) => {
  // amount in kobo (Naira * 100)
  const amountInKobo = Math.round(amount * 100);
  
  const response = await paystack.post('/transaction/initialize', {
    email,
    amount: amountInKobo,
    metadata,
    callback_url,
  });
  
  return response.data.data;
};

const verifyPayment = async (reference) => {
  const response = await paystack.get(`/transaction/verify/${reference}`);
  return response.data.data;
};

module.exports = { initializePayment, verifyPayment };