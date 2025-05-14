export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Ecom Store';
export const APP_DESC =
  process.env.NEXT_PUBLIC_APP_DESC ||
  'Mondern Ecommerce store built with NextJS';
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

export const signInDefaultValues = {
  email: 'your@email.com',
  password: 'Welcome123',
};

export const signUpDefaultValues = {
  name: 'Your Name',
  email: 'your@email.com',
  password: 'Welcome123',
};
