import mongoose, { Schema } from 'mongoose'

const transectionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: "USD",
        uppercase: true
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED", "PAYMENT_UNKNOWN"],
        default: "PENDING",
        required: true,
    },
    paypal_order_id: {
        type: String,
        unique: true,
        sparse: true,
    },
    paypal_webhook_event_id: {
        type: String,
        unique: true,
        sparse: true,
    },
    idempotency_key: {
        type: String,
        required: true,
        unique: true,
    },

}, { timestamps: true })

export default mongoose.model("Transaction", transectionSchema)