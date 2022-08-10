const BRAND_MODEL 		= require('./models/brand').MODEL;
const BRAND_COLL  		= require('./databases/brand-coll');
const BRAND_ROUTES      = require('./apis/brand');

module.exports = {
    BRAND_ROUTES,
    BRAND_COLL,
    BRAND_MODEL,
}
