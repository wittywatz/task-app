const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'wittywatz@gmail.com',
    subject: 'Thank you for signing up',
    text: `Welcome ${name}, let us help you manage your tasks`,
  });
};
const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'wittywatz@gmail.com',
    subject: 'We hope to see you soon',
    text: `Goodbye ${name}, let us know what we could have done better to keep you. We hope to see you again soon`,
  });
};
module.exports = { sendWelcomeEmail, sendGoodbyeEmail };
