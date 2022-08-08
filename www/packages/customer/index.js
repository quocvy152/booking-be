const CUSTOMER_MODEL 		= require('./models/customer').MODEL;
const CUSTOMER_COLL  		= require('./databases/customer-coll');
const CUSTOMER_ROUTES       = require('./apis/customer');

const USER_DEVICE_MODEL		= require('./models/user_device').MODEL;
const USER_DEVICE_COLL		= require('./databases/user_device-coll');

module.exports = {
    CUSTOMER_ROUTES,
    CUSTOMER_COLL,
    CUSTOMER_MODEL,

	USER_DEVICE_MODEL,
	USER_DEVICE_COLL
}
