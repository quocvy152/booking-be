"use strict";

module.exports = {
    supportMail: "testvshop@gmail.com",

    email: process.env.MAILER_SENDER || 'booking.dev.sp@gmail.com',
    pass:  process.env.MAILER_PWD    || 'iwhbtprlnjqknikw',
    siteName: 'https://booking-be-app.herokuapp.com/',
    password: process.env.MAILER_PWD || 'iwhbtprlnjqknikw',

    host: process.env.MAILER_HOST || 'smtp.gmail.com',
    port: process.env.MAILER_PORT || '587',
    service: 'Gmail',
};
