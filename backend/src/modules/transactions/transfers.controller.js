import * as transfersService from './transfers.service.js'

export async function createTransfer(req, res) {
  const transfer = await transfersService.createTransfer(req.user._id, req.body)
  res.status(201).json({ success: true, transfer })
}

export async function getTransfers(req, res) {
  const transfers = await transfersService.getTransfers(req.user._id)
  res.json({ transfers })
}
