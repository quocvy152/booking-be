// KIỂU TÀI KHOẢN
exports.ADMIN_LEVEL = [
    { value: 0, text: 'Editor' },
    { value: 1, text: 'Admin' },
]

// TRẠNG THÁI
exports.ADMIN_STATUS = [
    { value: 0, text: 'Khóa' },
    { value: 1, text: 'Hoạt động' },
]

// KIỂU BÀI VIẾT
exports.POST_TYPE = [
    { value: 0, text: 'Product' },
    { value: 1, text: 'News' },
]

/**
 * MIME Types image
 */
 exports.MIME_TYPES_IMAGE = [ 
	'image/jpeg', 
	'image/pjpeg', 
	'image/png', 
	'image/svg+xml'
];

/**
 * Định nghĩa file collection
 * BIG SALE
 */
exports.DESCRIPTION_BIG_SALE_COLL = {
    name: "Tên khuyến mãi BigSale",
    description: "Mô tả khuyến mãi",
    image: "Hình ảnh khuyến mãi",
    typeDiscount: "Loại giảm giá [1, 2] => ['Giảm theo tiền', 'Giảm theo %']",
    code: "Mã code khuyến mãi",
    maxUsage: "Số lượng mã được sử dụng trong chương trình khuyến mãi này",
    products: "Mảng sản phẩm được sử dụng khuyến mãi",
    amountDiscountByMoney: "Nếu typeDiscount = 1 thì sử dụng trường này",
    amountDiscountByPercent: "Nếu typeDiscount = 2 thì sử dụng trường này",
    status: "[0, 1] => [hết hạn, còn hạng]",
    linkDiscounts: "Là một mảng link được link tới những trang thương mại điện tử khác",
    userCreate: "User tạo khuyến mãi",
    userUpdate: "User update khuyến mãi",
    createAt: "Ngày tạo khuyến mãi"
};

// GIỚI TÍNH
exports.GENDER_TYPE = [
    { value: 0, text: 'Nữ' },
    { value: 1, text: 'Nam' },
    { value: 2, text: 'Khác' },
]

// LOẠI TÀI KHOẢN
exports.CUSTOMER_ACCOUNT_TYPE = [
    { value: 0, text: 'Bình thường' },
    { value: 1, text: 'Google' },
    { value: 2, text: 'Facebook' },
    { value: 3, text: 'Apple' },
]

// LOẠI LỊCH SỬ
exports.HISTORY_POINT_TYPE = [
    { value: 1, text: 'Tích điểm' },
    { value: 2, text: 'Đổi điểm' },
]

// PHƯƠNG THỨC THANH TOÁN
exports.PAYMENT_TYPE = [
    { value: 1, text: 'Thanh toán qua thẻ ATM nội địa, thẻ thanh toán quốc tế', description: "Thanh toán online qua thẻ ATM nội địa. Miễn phí thanh toán." },
    { value: 2, text: 'Thanh toán khi nhận hàng', description: 'Khi các bạn cần sự an toàn. Chúng tôi hỗ trợ thanh toán khi nhận được sản phẩm' },
    // { value: 2, text: 'Chuyển khoản ngân hàng' },
]

// TRẠNG THÁI ĐƠN HÀNG
exports.ORDER_STATUS_TYPE = [                   
    { value: 0, text: 'Đang xử lý' },
    { value: 1, text: 'Đã nhận hàng' },
    { value: 2, text: 'Đang giao' },
    { value: 3, text: 'Đã giao thành công' },
]

exports.PRODUCT_STATUS = [                   
    { value: 0, text: 'Không hoạt động' },
    { value: 1, text: 'Hoạt động' },
]

exports.REGISTER_TRIAL_PROGRAM_STATUS = [                   
    { value: 0, text: 'Đã Nhận', color: "#E64237" },
    { value: 1, text: 'Đã Xem', color: "#2596be" },
    { value: 2, text: 'Đang Chuyển Hàng', color: "#758c94" },
    { value: 3, text: 'Khách không nhận', color: "#472c81" },
    { value: 4, text: 'Khách đã nhận', color: "#2c8144" },
]

// TRẠNG THÁI ĐẶT XE
exports.STATUS_BOOKING = [                   
    { value: 0, text: 'Không hoạt động' },
    { value: 1, text: 'Đang hoạt động' },
    { value: 2, text: 'Đã hủy' },
    { value: 3, text: 'Đợi duyệt' },
    { value: 4, text: 'Đợi trả xe' },
    { value: 5, text: 'Đã thanh toán' },
]

exports.BOOKING_URL = {
    BOOKING_SERVER: 'https://booking-be-app.herokuapp.com'
}
