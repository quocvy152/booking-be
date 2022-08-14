const BASE_ROUTE = '/admin';

const CF_ROUTINGS_COMMON = {
    HOME: `${BASE_ROUTE}/home`,
    LOGIN: `/login`,
    LOGOUT: `/logout`,
    
    LIST_PROVINCES: `/list-provinces`,
    LIST_DISTRICTS: `/list-districts/:province`,
    LIST_WARDS: `/list-wards/:district`,

    ORIGIN_APP: BASE_ROUTE
}

exports.CF_ROUTINGS_COMMON = CF_ROUTINGS_COMMON;