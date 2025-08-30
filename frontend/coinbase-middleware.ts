import { paymentMiddleware } from 'x402-next';

export const middleware = paymentMiddleware(
  "0xYourAddress",
  {
    '/protected': {
      price: '$0.01',
      network: "base-sepolia",
      config: {
        description: 'Access to protected content',
        inputSchema: { type: "object", properties: {} },
        outputSchema: { type: "object", properties: { content: { type: "string" } } },
      },
    },
  },
  { url: "https://x402.org/facilitator" }
);

export const config = {
  matcher: ['/protected/:path*'],
};