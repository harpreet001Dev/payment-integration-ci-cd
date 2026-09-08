import Joi from 'joi'

export const createOrderSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .required()
});