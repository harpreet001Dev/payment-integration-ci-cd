import express from "express"
import validate from "../middlewares/validate.middleware.js";
import authtenticateUser from "../middlewares/auth.middleware.js";
import webhooksController from "../controllers/webhooks.controller.js";


const router = express();

router.post('/paypal', webhooksController.webhook)

export default router;