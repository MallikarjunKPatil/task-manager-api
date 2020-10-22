const app = require('./app')
const port = process.env.PORT

// Maintaince mode
// app.use((req,res,next) => {
//     res.status(503).send('Site is currently down. Please check back soon!')
// })

app.listen(port, () => {
    console.log('Server is up on the port ' + port);
})

