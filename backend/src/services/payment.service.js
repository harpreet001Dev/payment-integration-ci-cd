
import Transection from "../models/transections.js";
import paypalService from "./paypal.service.js";


// Create payment
const createOrder = async (userId, data) => {
    try {
        const { amount, idempotencyKey } = data;
        

        // Ask PayPal to create the order
        const paypalOrder = await paypalService.createPayPalOrder(amount);

        // Create our local transaction
        await Transection.create({
            user_id: userId,
            currency: "USD",
            amount: amount,
            status: "PENDING",
            paypal_order_id: paypalOrder.id,
            idempotency_key: idempotencyKey
        });

        return paypalOrder;

    } catch (error) {
        console.log("PAYMENT CREATE ORDER ERROR:", error);
        throw error;
    }
};


// Determine whether PayPal gave us a definite failure
const isDefiniteCaptureFailure = (error) => {
    return (
        error.result?.name === "RESOURCE_NOT_FOUND" ||
        error.result?.name === "INVALID_RESOURCE_ID"
    );
};


// Capture payment
const captureOrder = async (userId, orderId) => {

    // Find our local transaction
    const transaction = await Transection.findOne({
        paypal_order_id: orderId
    });

    if (!transaction) {
        throw new Error("Transaction not found");
    }


    // Duplicate capture protection
    if (transaction.status === "COMPLETED") {
        console.log(
            "Payment already completed. Skipping PayPal capture."
        );

        return transaction;
    }


    try {
        // Ask PayPal to capture the order
        const paypalOrder =
            await paypalService.capturePayPalOrder(orderId);

        // console.log(
        //     "PAYPAL CAPTURE RESPONSE:",
        //     paypalOrder
        // );


        // PayPal says capture completed
        if (paypalOrder?.status === "COMPLETED") {

            // transaction.status = "COMPLETED";

            // await transaction.save();

            return paypalOrder;
        }


        // PayPal responded, but capture was not completed
        transaction.status = "FAILED";

        await transaction.save();

        return paypalOrder;

    } catch (error) {

        // console.log(error, "error in catch");

        // console.log("PAYPAL CAPTURE ERROR:", {
        //     statusCode: error.statusCode,
        //     name: error.result?.name,
        //     message: error.result?.message,
        //     debugId: error.result?.debug_id
        // });


        // Only mark FAILED when we know
        // the capture definitely failed
        if (isDefiniteCaptureFailure(error)) {
            transaction.status = "FAILED";
            await transaction.save();
        } else {
            transaction.status = "PAYMENT_UNKNOWN";
            await transaction.save();
        }

        // // Unknown errors remain PENDING
        // throw error;
    }
};


// Get PayPal order status
const getOrderStatus = async (orderId) => {

    const paypalOrder =
        await paypalService.getPayPalOrder(orderId);

    return paypalOrder;
};


const reconcileUnknownPayments = async () => {

    const transactions = await Transection.find({
        status: "PAYMENT_UNKNOWN"
    });

    console.log(
        "PAYMENT UNKNOWN TRANSACTIONS:",
        transactions.length
    );

    for (const transaction of transactions) {
        try {

            const paypalOrder =
                await paypalService.getPayPalOrder(
                    transaction.paypal_order_id
                );
                // await paypalService.getPayPalOrder(
                //     "FAKE_ORDER_ID"
                // );

            console.log(
                "RECONCILIATION:",
                transaction.paypal_order_id,
                paypalOrder.status
            );


            // PayPal already completed the payment
            if (paypalOrder.status === "COMPLETED") {

                transaction.status = "COMPLETED";

                await transaction.save();

                console.log(
                    "TRANSACTION RECONCILED → COMPLETED"
                );

                continue;
            }


            // Order is approved but capture has not happened
            if (paypalOrder.status === "APPROVED") {

                console.log(
                    "ORDER APPROVED → ATTEMPTING CAPTURE"
                );

                try {

                    const captureResult =
                        await paypalService.capturePayPalOrder(
                            transaction.paypal_order_id
                        );

                    console.log(
                        "RECONCILIATION CAPTURE RESULT:",
                        captureResult
                    );


                    if (captureResult?.status === "COMPLETED") {

                        transaction.status = "COMPLETED";

                        await transaction.save();

                        console.log(
                            "TRANSACTION RECONCILED → COMPLETED"
                        );
                    }

                } catch (captureError) {

                    console.log(
                        "RECONCILIATION CAPTURE ERROR:",
                        captureError.message
                    );

                    // We still don't know the final payment outcome.
                    transaction.status = "PAYMENT_UNKNOWN";

                    await transaction.save();
                }
            }
            if (paypalOrder.status === "VOIDED") {

                transaction.status = "FAILED";

                await transaction.save();

                console.log(
                    "TRANSACTION RECONCILED → FAILED"
                );

                continue;
            }

        } catch (error) {

            console.log(
                "RECONCILIATION STATUS CHECK FAILED:",
                transaction.paypal_order_id,
                error.message
            );

            // Leave it as PAYMENT_UNKNOWN.
        }
    }
};

export default {
    createOrder,
    captureOrder,
    getOrderStatus,
    reconcileUnknownPayments
};

