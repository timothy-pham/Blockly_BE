const botConfig = {
    names: [
        "Lý Liên Kiệt",
        "Triệu Vy",
        "Cảnh Điềm",
        "Châu Tấn",
        "Huỳnh Hiểu Minh",
        "Dương Mịch",
        "Lưu Diệc Phi",
        "Ngô Kỳ Long",
        "Tôn Lệ",
        "Đặng Siêu",
        "Chân Tử Đan",
        "Tôn Tử Khánh",
        "Trương Thiết Hạn",
        "Trịnh Sảng",
        "Hứa Vỹ Luân",
        "Ngô Thiến",
        "Từ Chính Khê",
        "Phùng Thiệu Phong",
        "Lý Băng Băng",
        "Trương Hàn"],
    levels: {
        "easy": {
            minTime: 10,
            maxTime: 20,
            percentAnswer: 0.3,
            name: "🐣 - Dễ"
        },
        "medium": {
            minTime: 5,
            maxTime: 15,
            percentAnswer: 0.5,
            name: "🐥 - Trung bình"
        },
        "hard": {
            minTime: 5,
            maxTime: 10,
            percentAnswer: 0.8,
            name: "🐔 - Khó"
        },
        "hell": {
            minTime: 2,
            maxTime: 4,
            percentAnswer: 1,
            name: "🦅 - Địa ngục"
        }
    },
    defaultLevel: "easy",
}

module.exports = {
    botConfig
};