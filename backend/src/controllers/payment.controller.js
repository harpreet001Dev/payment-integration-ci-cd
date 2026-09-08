
import paypalService from '../services/paypal.service.js'
import paymentService from '../services/payment.service.js';
import asyncHandler from '../utlis/asyncHandler.js';
import stripeService from '../services/stripeService.js';


const testPayment = asyncHandler(async (req, res) => {

    const result = await paypalService.testPayPal()

    res.status(200).json({
        status: "success",
        data: result

    })
})

const createOrder = asyncHandler(async (req, res) => {

    const userId = req.user._id
    console.log("Idempotency Key:", req.body.idempotencyKey);
    const result = await paymentService.createOrder(userId, req.body)
    console.log("Payment created:", result);
    return;
    // res.status(200).json({
    //     status: "success",
    //     data: result

    // })
})

const captureOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { orderId } = req.body;
    const result = await paymentService.captureOrder(userId, orderId)

    res.status(200).json({
        status: "success",
        data: result

    })
})

const reconcilePayments = asyncHandler(async (req, res) => {

    await paymentService.reconcileUnknownPayments();

    res.status(200).json({
        status: "success",
        message: "Reconciliation completed"
    });
});


const createStripePayment = asyncHandler(async (req, re) => {
    const userId = req.user._id;

    const paymentIntent = await stripeService.createPaymentIntent(userId, req.body);

    return res.status(201).json({
        success: true,
        paymentIntent,
    });
    //frontend recieve 
    //     {
    //     success: true,
    //     paymentIntent: {
    //         id: "pi_...",
    //         client_secret: "pi_..._secret_...",
    //         status: "requires_payment_method",
    //         ...
    //     }
    // }
})


export default {
    testPayment,
    createOrder,
    captureOrder,
    reconcilePayments,
    createStripePayment,
}