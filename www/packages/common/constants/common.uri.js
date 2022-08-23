const BASE_ROUTE = '/location';

const CF_ROUTINGS_COMMON = {
    HOME: `${BASE_ROUTE}/home`,
    LOGIN: `/login`,
    LOGOUT: `/logout`,
    
    LIST_PROVINCES: `${BASE_ROUTE}/provinces`,
    LIST_DISTRICTS: `${BASE_ROUTE}/district-by-province`,
    LIST_WARDS: `${BASE_ROUTE}/ward-list-district`,

    ORIGIN_APP: BASE_ROUTE
}

exports.CF_ROUTINGS_COMMON = CF_ROUTINGS_COMMON;