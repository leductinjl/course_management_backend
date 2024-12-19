const Joi = require('joi');

const paymentDetailsSchemas = {
  bank_transfer: Joi.object({
    bank_name: Joi.string().required(),
    account_number: Joi.string().required(),
    transfer_time: Joi.date().required(),
    reference_number: Joi.string().required()
  }),
  cash: Joi.object({
    receipt_number: Joi.string().required()
  }),
  e_wallet: Joi.object({
    provider: Joi.string().required(),
    transaction_id: Joi.string().required(),
    account_id: Joi.string().required()
  }),
  credit_card: Joi.object({
    card_last_digits: Joi.string().length(4).required(),
    transaction_id: Joi.string().required()
  })
};

const tuitionValidators = {
  createPayment: {
    body: Joi.object({
      tuition_id: Joi.string().uuid().required(),
      payment_method: Joi.string()
        .valid('bank_transfer', 'cash', 'e_wallet', 'credit_card')
        .required(),
      amount: Joi.number().positive().required(),
      payment_details: Joi.alternatives().conditional('payment_method', {
        switch: [
          { is: 'bank_transfer', then: paymentDetailsSchemas.bank_transfer },
          { is: 'cash', then: paymentDetailsSchemas.cash },
          { is: 'e_wallet', then: paymentDetailsSchemas.e_wallet },
          { is: 'credit_card', then: paymentDetailsSchemas.credit_card }
        ]
      }).required(),
      notes: Joi.string().optional()
    })
  }
};

module.exports = tuitionValidators; 