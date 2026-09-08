import asyncHandler from '../utlis/asyncHandler.js';
import paypalService from '../services/paypal.service.js';
import webhookService from '../services/webhook.service.js';

const webhook = asyncHandler(async (req, res) => {
    console.log("Entered in webhook controller")
    const status = await paypalService.verifyPayPalWebhook(
        {
            authAlgo: req.headers["paypal-auth-algo"],
            certUrl: req.headers["paypal-cert-url"],
            transmissionId: req.headers["paypal-transmission-id"],
            transmissionSig: req.headers["paypal-transmission-sig"],
            transmissionTime: req.headers["paypal-transmission-time"],
        },
        req.body
    );

    console.log("Webhook verification:", status);

    if (status !== true) {
        return res.sendStatus(400);
    }
    await webhookService.webhook(req.body)

    console.log("Verified:", req.body.event_type);

    res.status(200).json({
        status: "success",

    })
})


const handleStripeWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const result = await webhookService.handleStripeWebhook(req.body, signature);
    return res.status(200).json({
        success: true,
        ...result,
    });
});

export default { webhook ,handleStripeWebhook};