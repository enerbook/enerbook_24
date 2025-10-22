import { Platform } from 'react-native';

// This module exports StripeProvider only on native platforms
// On web, it exports null

let StripeProvider = null;

if (Platform.OS !== 'web') {
  try {
    const stripe = require('@stripe/stripe-react-native');
    StripeProvider = stripe.StripeProvider;
  } catch (error) {
    console.warn('Stripe React Native not available:', error);
  }
}

export { StripeProvider };