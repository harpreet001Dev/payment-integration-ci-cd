
import { useEffect } from "react";
import api from "../api/api";


export default function PaymentSuccess() {
  useEffect(() => {
    const capturePayment = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get("token");

        console.log("PayPal Order ID:", orderId);
        const data={
          orderId
        }

        const res = await api.capturePayment(data);

        console.log("CAPTURE RESPONSE:", res);
       

      } catch (error) {
        console.log("CAPTURE ERROR:", error);
      }
    };

    capturePayment();
  }, []);
  return <h1>Payment Success Page</h1>;
}