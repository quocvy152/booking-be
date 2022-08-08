"use strict";

const hostProduct 				= require('./cf_mode').host_product;
const HOST 						= require('./cf_host');

module.exports = {
    facebookAuth: {
        clientID: '', // your App ID
        clientSecret: '', // your App Secret
        callbackURL: hostProduct ? 'https://kof.com.vn' :
            'http://' + HOST.host + ':' + HOST.port + '/auth/login-fb/callback'
    },

    twitterAuth: {
        consumerKey: 'your-consumer-key-here',
        consumerSecret: 'your-client-secret-here',
        callbackURL: 'http://localhost:8080/auth/twitter/callback'
    },

    googleAuth: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: hostProduct ? 
					'https://nandio.com' :
					`http://${HOST.host}:${HOST.port}/auth/google/callback`
    }
};
