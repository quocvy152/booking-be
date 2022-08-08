const USER_MODEL 		= require('./models/user').MODEL;
const USER_COLL  		= require('./databases/user-coll');
const USER_ROUTES       = require('./apis/user');

module.exports = {
    USER_ROUTES,
    USER_COLL,
    USER_MODEL,
}
