import express from "express"
import validate from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from '../validations/auth.validations.js'
import authController from "../controllers/auth.controller.js";

const router = express();

router.use('/register', validate(registerSchema), authController.Register)
router.use('/login', validate(loginSchema), authController.login)
router.use('/refresh', authController.refresh)

export default router;