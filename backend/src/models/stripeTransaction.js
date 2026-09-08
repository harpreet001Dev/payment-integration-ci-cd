import mongoose from "mongoose";

const stripeTransactionSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        amount: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            required: true,
        },

        stripePaymentIntentId: {
            type: String,
            unique: true,
            sparse: true,
        },
        idempotencyKey: {
            type: String,
            required: true,
            unique: true,
        },


        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "PENDING",
        },
    },
    {
        timestamps: true,
    }
);

const StripeTransaction = mongoose.model(
    "StripeTransaction",
    stripeTransactionSchema
);

export default StripeTransaction;