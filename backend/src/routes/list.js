import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { SaveItemSchema } from '../utils/validators.js'


export const list = Router()


list.use(requireAuth)


list.get('/', async (req, res) => {
const user = await User.findById(req.user.id).lean()
res.json({ items: user.myList || [] })
})


list.post('/toggle', async (req, res) => {
const item = SaveItemSchema.parse(req.body)
const user = await User.findById(req.user.id)
const idx = user.myList.findIndex(x => x.id === item.id)
if (idx >= 0) user.myList.splice(idx, 1)
else user.myList.push(item)
await user.save()
res.json({ items: user.myList })
})


list.delete('/:id', async (req, res) => {
const id = req.params.id
const user = await User.findById(req.user.id)
user.myList = user.myList.filter(x => x.id !== id)
await user.save()
res.json({ items: user.myList })
})