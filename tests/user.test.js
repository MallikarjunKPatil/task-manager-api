const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const userOne = {
    name: 'Mike',
    email: 'mike@gmail.com',
    password: '56What112!'
}

beforeEach( async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should signup a new user', async () => {
    await request(app).post('/users').send({
        name: 'MAlli',
        email: 'malli@gmail.com',
        password: 'MyPass888'
    }).expect(201)
})

test('Should login existing user', async () =>{
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
})

test('Should not login to nonexisting user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'asdsadsa'
    }).expect(400)
})
