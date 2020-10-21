const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mallikarjunpatil44@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to app ${name}. Let me know how you get along.`
    })
}

const sendCancellationEmail = (email,name) => {
    sgMail.send({
        to: email,
        from: 'mallikarjunpatil44@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Thank you for choosing use ${name}. Why did you cancelled?`
    })
}

module.exports = {
    sendWelcomeEmail , 
    sendCancellationEmail
} 