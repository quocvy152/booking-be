const BASE_ROUTE_LOCATION = '/location';
const BASE_ROUTE_UPLOAD = '/upload';

const CF_ROUTINGS_COMMON = {
    LIST_PROVINCES: `${BASE_ROUTE_LOCATION}/provinces`,
    LIST_DISTRICTS: `${BASE_ROUTE_LOCATION}/district-by-province`,
    LIST_WARDS: `${BASE_ROUTE_LOCATION}/ward-list-district`,
    UPLOAD_IMGBB: `${BASE_ROUTE_UPLOAD}/imgbb`,
}

exports.CF_ROUTINGS_COMMON = CF_ROUTINGS_COMMON;