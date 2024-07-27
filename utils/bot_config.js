const botConfig = {
    names: [
        "Chử Ngọc Ẩn",
        "Mai Tấn Dũng",
        "Lương Tuấn Khanh",
        "Phạm Quốc Văn",
        "Thạch Hồng Ðăng",
        "Mã Việt Cường",
        "Tôn Cường Thịnh",
        "Huỳnh Ngọc Sơn",
        "Võ Tường Anh",
        "Đặng Hoài Tín",
        "Nguyễn Thanh Ngọc",
        "Ngô Bảo Tiên",
        "Hoàng Thanh Hà",
        "Huỳnh Thu Sương",
        "Đặng Ý Lan",
        "Lâm Kiều Thu",
        "Hoàng Kim Hòa",
        "Hàn Ái Vân",
        "Cao Ngọc Oanh",
        "Hà Nhã Lý"
    ],
    levels: {
        "easy": {
            minTime: 15,
            maxTime: 25,
            minQuestion: 0,
            maxQuestion: 1,
            percentAnswer: 0.3,
            name: "🐣 - Dễ"
        },
        "medium": {
            minTime: 10,
            maxTime: 20,
            minQuestion: 0.5,
            maxQuestion: 1,
            percentAnswer: 0.5,
            name: "🐥 - Trung bình"
        },
        "hard": {
            minTime: 5,
            maxTime: 15,
            minQuestion: 0.8,
            maxQuestion: 1,
            percentAnswer: 0.8,
            name: "🐔 - Khó"
        },
        "hell": {
            minTime: 1,
            maxTime: 3,
            minQuestion: 1,
            maxQuestion: 1,
            percentAnswer: 1,
            name: "🦅🦅🦅 - Địa ngục"
        }
    },
    defaultLevel: "easy",
}

module.exports = {
    botConfig
};