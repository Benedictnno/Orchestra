import * as billsService from './bills.service.js'

export async function createBillPayment(req, res) {
  const payment = await billsService.createBillPayment(req.user._id, req.body)
  res.status(201).json({ success: true, payment })
}

export async function getBillPayments(req, res) {
  const payments = await billsService.getBillPayments(req.user._id)
  res.json({ payments })
}
