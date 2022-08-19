const BOOKING_MODEL 		= require('./models/booking').MODEL;
const BOOKING_COLL  		= require('./databases/booking-coll');
const BOOKING_ROUTES        = require('./apis/booking');

module.exports = {
    BOOKING_ROUTES,
    BOOKING_COLL,
    BOOKING_MODEL,
}
