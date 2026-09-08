import stripe from "../config/stripe.js";
import StripeTransaction from "../models/stripeTransaction.js";

const createPaymentIntent = async (userId, data) => {
    const { amount, currency, idempotencyKey } = data
    if (!stripe) {
        throw new Error("Stripe is not configured");
    }
    const existingTransaction = await StripeTransaction.findOne({ idempotencyKey, });
    if (existingTransaction) {
        return { transaction: existingTransaction, duplicate: true, };
    }

    const transaction = await StripeTransaction.create(
        { userId, amount, currency, idempotencyKey, status: "PENDING", }
    );
    const paymentIntent = await stripe.paymentIntents.create(
        { amount, currency, },
        { idempotencyKey, }
    );

    transaction.stripePaymentIntentId = paymentIntent.id;
    await transaction.save();
    return { transaction, paymentIntent, duplicate: false, };
}

export default {
    createPaymentIntent
}