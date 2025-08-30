import { paymentMiddleware } from "x402-next";

export const middleware = paymentMiddleware(
  "0xE9eBA25cB5F4C2755950a609860E7718f5307988",
  {
    "/protected": {
      price: "$0.0001",
      network: "base-sepolia",
      config: {
        description: "Access to protected content",
        mimeType: "application/json", 
        maxTimeoutSeconds: 120,
        outputSchema: {
          type: "object",
          properties: { content: { type: "string" } }
        },
        customPaywallHtml: "<h1>⚡ Pay to continue</h1>"
      }
    }
  },
  {
    url: "https://x402.org/facilitator"
  }
);

export const config = {
  matcher: ["/protected/:path*"]
};