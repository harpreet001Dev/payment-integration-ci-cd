import express from "express"
import validate from "../middlewares/validate.middleware.js";
import authtenticateUser from "../middlewares/auth.middleware.js";
import paymentController from "../controllers/payment.controller.js";
import { createOrderSchema } from "../validations/payment.validations.js";


const router = express();

router.post('/test',authtenticateUser,paymentController.testPayment)
router.post('/create-order',authtenticateUser,validate(createOrderSchema), paymentController.createOrder)
router.post('/capture',authtenticateUser, paymentController.captureOrder)
router.post(
    "/reconcile",
    authtenticateUser,
    paymentController.reconcilePayments
);
router.post('/stripe',authtenticateUser, paymentController.createStripePayment)


export default router;