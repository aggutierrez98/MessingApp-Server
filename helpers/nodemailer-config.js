const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_MAIL_USERNAME,
        pass: process.env.NODEMAILER_MAIL_PASSWORD,
    }
});

transporter.verify().then(() => {
    console.log("Listo para enviar emails")
})

module.exports = {
    transporter,
}