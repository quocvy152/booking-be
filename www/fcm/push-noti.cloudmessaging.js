let FCM             = require('fcm-notification');
// let K360_CONFIG_FCM = null, fcm = null;
// let { database_product }      = require('../config/cf_mode');
// if (database_product) {
// 	K360_CONFIG_FCM = require('./config.json'); //prod 
// 	fcm             = new FCM(K360_CONFIG_FCM)
// }
let K360_CONFIG_FCM = require('./k360-50b87-firebase-adminsdk-erii4-51505a5476.json'); //prod 
let fcm             = new FCM(K360_CONFIG_FCM)

// WORKED
exports.sendMessage = function ({ title, descriptionn, arrayRegistrationID, body }) {
	console.log(`run: sendMessage...........`)
	return new Promise(resolve => {
		let tokens 	= Array.isArray(arrayRegistrationID) ? arrayRegistrationID : [arrayRegistrationID]
		let row 	= JSON.stringify(body)
	
		if(!title){
			title = 'K360 - TÀI CHÍNH TIỆN LỢI'
		}
		let mapMessage = {
			data: {    //This is only optional, you can send any data
				row: row
			},
			notification: {
				title,
				body: descriptionn
			}
		};
		fcm.sendToMultipleToken(mapMessage, tokens, function (err, response) {
			if (err) {
				return ({
					error : true,
					message : 'unable_to_send_message'
				});
			} else {
				console.log(response);
				return resolve({
					error: false,
					message: response
				});
			}
		});
	
	})
}
// let tokenNguyen = 'dICILntvRsakamlOZzuyrA:APA91bGClrDjieiWJYJ_49sWyd7fWE6RLg3vTysSiiQJXL1pcoeOFjfq1E49-Hg2mqY2YbrCcC4lSGOanqoZuJqtQwH3pSjiOk2ZyjtxbsikgkmZ6FI6t0H6jjtBijSAStau4DnYViPY';
// let body = { 
// 	screen_key: 'ImageDealScreen',
// 	sender: 'KHANHNEY'
// }
// sendMessage({ title: 'K360 - EVERYONE', description:'HELLO NGUYEN', arrayRegistrationID: tokenNguyen, body })
// 	.then(result => console.log({ result }))
// 	.catch(err => console.log({ err }))