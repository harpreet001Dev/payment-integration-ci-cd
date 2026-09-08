import Transection from '../models/transections.js';
import stripe from "../config/stripe.js";
import StripeTransaction from "../models/stripeTransaction.js";

const webhook = async (data) => {
    const eventId = data.id;
    const eventType = data.event_type;

    const orderId =
        data.resource?.supplementary_data?.related_ids?.order_id;

    if (!eventId) {
        throw new Error("PayPal webhook event ID missing");
    }

    if (!orderId) {
        throw new Error("PayPal order ID missing from webhook");
    }

    const transaction = await Transection.findOne({
        paypal_order_id: orderId
    });

    if (!transaction) {
        console.log("Transaction not found:", orderId);
        return;
    }

    // Duplicate webhook
    if (transaction.paypal_webhook_event_id === eventId) {
        console.log("Webhook already processed:", eventId);
        return;
    }

    let newStatus;

    switch (eventType) {

        case "PAYMENT.CAPTURE.COMPLETED":
            newStatus = "COMPLETED";
            break;

        case "PAYMENT.CAPTURE.DECLINED":
        case "PAYMENT.CAPTURE.DENIED":
            newStatus = "FAILED";
            break;

        case "PAYMENT.CAPTURE.PENDING":
            newStatus = "PAYMENT_UNKNOWN";
            break;

        default:
            console.log("Ignoring webhook:", eventType);
            return;
    }

    const currentStatus = transaction.status;

    // --------------------------------
    // State-safe status transitions
    // --------------------------------

    if (currentStatus === "COMPLETED") {
        console.log(
            `Ignoring webhook ${eventType}: transaction already COMPLETED`
        );
        return;
    }

    if (currentStatus === "FAILED") {
        console.log(
            `Ignoring webhook ${eventType}: transaction already FAILED`
        );
        return;
    }

    // PAYMENT_UNKNOWN can move to COMPLETED or FAILED
    if (
        currentStatus === "PAYMENT_UNKNOWN" &&
        newStatus === "PAYMENT_UNKNOWN"
    ) {
        console.log("Transaction already PAYMENT_UNKNOWN");
        return;
    }

    // --------------------------------
    // Apply update
    // --------------------------------

    transaction.status = newStatus;
    transaction.paypal_webhook_event_id = eventId;

    await transaction.save();

    console.log(
        `Webhook processed: ${eventType} → ${transaction.status}`
    );
};



const handleStripeWebhook = async (rawBody, signature) => {
    if (!stripe) {
        throw new Error("Stripe is not configured");
    }

    let event;

    // 1. Verify Stripe webhook signature
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        const webhookError = new Error(
            `Invalid Stripe webhook: ${error.message}`
        );

        webhookError.statusCode = 400;

        throw webhookError;
    }

    // 2. Handle event
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;

            const transaction = await StripeTransaction.findOne({
                stripePaymentIntentId: paymentIntent.id,
            });

            if (!transaction) {
                console.log(
                    `Stripe transaction not found: ${paymentIntent.id}`
                );

                break;
            }

            // Duplicate webhook
            if (transaction.lastEventId === event.id) {
                return {
                    message: "Webhook already processed",
                };
            }

            transaction.status = "COMPLETED";
            transaction.lastEventId = event.id;

            await transaction.save();

            break;
        }

        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;

            const transaction = await StripeTransaction.findOne({
                stripePaymentIntentId: paymentIntent.id,
            });

            if (!transaction) {
                console.log(
                    `Stripe transaction not found: ${paymentIntent.id}`
                );

                break;
            }

            if (transaction.lastEventId === event.id) {
                return {
                    message: "Webhook already processed",
                };
            }

            transaction.status = "FAILED";
            transaction.lastEventId = event.id;

            await transaction.save();

            break;
        }

        default:
            console.log(
                `Unhandled Stripe event: ${event.type}`
            );
    }

    return {
        message: "Webhook processed",
    };
};


export default { webhook ,handleStripeWebhook};