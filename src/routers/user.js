const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')

// Creating User or Sign Up Request
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email, user.name)

        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Login or sign in to application
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

// Logout of the application
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

// Logout of all sessions 
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        while (req.user.tokens.length > 0) {
            req.user.tokens.pop()
        }
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

// Reading own user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// Updating User
router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']

    const isValidOperations = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperations) {
        return res.status(400).send({ error: 'Invalid Updates' })
    }

    try {

        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Deleting User
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Avatar Endpoints
// Upload avatar for profile
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload jpg, jpeg or png image'))
        }

        cb(undefined, true)
    }
})

// Endpoint for avatar upload
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ height: 250, width: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ Error: error.message })
})

// Endpoint to delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// Serving up the avatar 
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router