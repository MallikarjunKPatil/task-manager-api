const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

// Creating Task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Reading all tasks
// GET /tasks?completed=true
// GET /tasks?limit=3&skip=6
// GET /tasks?sortBy=createdAt:desc

router.get('/tasks', auth, async (req, res) => {
    try {
        const match = {}
        const sort = {}

        // GET /tasks?completed=true
        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }

        // GET /tasks?sortBy=createdAt:desc
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }

        //const tasks = await Task.find({ owner: req.user._id })

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                // GET /tasks?limit=3&skip=6
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Reading task by ID
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Updating Task
router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed', 'description']

    const isValidOperations = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperations) {
        return res.status(400).send({ error: 'Invalid Updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])

        await task.save()


        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Deleting Task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        //const task = await Task.findByIdAndDelete(req.params.id)

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router