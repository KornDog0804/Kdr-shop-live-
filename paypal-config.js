
export default async ()=>{
  return Response.json({
    clientId: process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_PUBLIC_CLIENT_ID || '',
    currency: process.env.PAYPAL_CURRENCY || 'USD'
  });
}
