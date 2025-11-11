import nodemailer from 'nodemailer';
console.log({
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    });
const transporter =nodemailer.createTransport({
    host:'smtp.mailersend.net',
    port: 587,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    }
    

});
export default transporter;