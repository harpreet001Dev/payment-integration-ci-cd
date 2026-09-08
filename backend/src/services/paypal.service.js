
import {
  Client,
  Environment,
  OrdersController,
} from "@paypal/paypal-server-sdk";

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  },
  environment: Environment.Sandbox
});

const orderController = new OrdersController(client);


// Test PayPal connection
const testPayPal = async () => {
  try {
    const result =
      await client.clientCredentialsAuthManager.fetchToken();

    console.log("PAYPAL ACCESS TOKEN:", result);

    return result.accessToken;
  } catch (error) {
    console.log("PAYPAL ERROR:", error);
    throw error;
  }
};


// Create order on PayPal
const createPayPalOrder = async (amount) => {
  const response = await orderController.createOrder({
    body: {
      intent: "CAPTURE",

      applicationContext: {
        returnUrl: "http://localhost:5173/payment/success",
        cancelUrl: "http://localhost:5173/payment/cancel"
      },

      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: Number(amount).toFixed(2)
          }
        }
      ]
    }
  });

  return response.result;
};


// Capture order on PayPal
const capturePayPalOrder = async (orderId) => {
  const response = await orderController.captureOrder({
    id: orderId
  });

  return response.result;
};


// Get order information from PayPal
const getPayPalOrder = async (orderId) => {
  const response = await orderController.getOrder({
    id: orderId
  });

  return response.result;
};

const verifyPayPalWebhook = async (headers, webhookEvent) => {
  console.log(headers,"headers");
  
  const token = await client.clientCredentialsAuthManager.fetchToken();

  const response = await fetch(
    "https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: headers.authAlgo,
        cert_url: headers.certUrl,
        transmission_id: headers.transmissionId,
        transmission_sig: headers.transmissionSig,
        transmission_time: headers.transmissionTime,
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: webhookEvent,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      `PayPal webhook verification failed: ${JSON.stringify(result)}`
    );
  }

  return result.verification_status === "SUCCESS";
};


export default {
  testPayPal,
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
  verifyPayPalWebhook,
};

