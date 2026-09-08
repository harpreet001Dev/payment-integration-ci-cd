import express from 'express'
import authRouter from './auth.routes.js'
const router = express.Router();
import paymentRouter from './payment.route.js'
import webhooksRouter from './webhooks.route.js'

router.use('/auth',authRouter)
router.use('/payment',paymentRouter)
router.use('/webhooks',webhooksRouter)


export default router