let USER_COLL         = require('../packages/users/databases/user-coll');
let { sendMessage }   = require('./push-noti.cloudmessaging');

/**
 * FUNCTION gửi noti từ cloud messaging
 * @param {*} arrReceiver danh sách userID (danh sách người nhận noti)
 * @param {*} message 
 * @param {*} body 
 * @param {*} senderID người gửi
 */
function sendMessageMobile({ title, description: message, arrReceiverID, body, senderID: userID }){
    ( async() =>{
        for (const receiver of arrReceiverID){
        // tìm registrationID và gửi thông báo đến mobile
            if(receiver != userID){
                let infoUser    = await USER_COLL.findById(receiver);
                let devices     = infoUser.devices;
                if(devices && devices.length >0){
                    let  arrayRegistrationID  = devices.map(item=> {
                        return item.registrationID
                    })
                    sendMessage({ title,  description: message, arrayRegistrationID, body })
                        .then(resultSendMessage => console.log({ notiCloudMessaging: resultSendMessage }))
                        .catch(err => console.log({ err }))
                }
            }
        }
    })();
}

exports.sendMessageMobile = sendMessageMobile;
// ----------------PLAYGROUND-------------------//
// let arrReceiverID = ['60ab5729b436165fe06fd141'];
// let title = 'HELLO WORLD - K360';
// let description = 'CHAY NGAY DI';
// let senderID = 'KHANHNEY'
// let body = {
//     screen_key: 'Setting',
//     sender: senderID,
//     transactionID: 'abc'
// };

// sendMessageMobile({ title, description, arrReceiverID, senderID, body })