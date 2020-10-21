const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

// app.use((req,res,next) => {
//     res.status(503).send('Site is currently down. Please check back soon!')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on the port ' + port);
})
// const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//     const token = jwt.sign({_id: 'abc123!'}, 'thisistoken', {expiresIn: '7 days'})
//     console.log(token);
//     const data = jwt.verify(token,'thisistoken')
//     console.log(data);
// }

// myFunction()
// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//     // const task = await Task.findById('5f7d7283659db73bfcc5915a')
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner);

//     const user = await User.findById('5f7d7125bad1ea3ba09fb40a')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks);

// }

// main()
