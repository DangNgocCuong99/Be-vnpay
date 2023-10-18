import axios from 'axios';
import crypto from 'crypto';
import https from "https"
// Hàm lấy ngày hiện tại theo định dạng yyyyMMddHHmmss
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Hàm tạo mã tham chiếu giao dịch ngẫu nhiên
function generateTransactionReference() {
    return Math.random().toString(36).substr(2, 10);
}

// Hàm tạo chuỗi hash bằng thuật toán SHA256
function generateSecureHash(data, secretKey) {
    const keys = Object.keys(data).sort();
    const hash = crypto.createHash('sha256');

    keys.forEach((key) => {
        hash.update(`${key}=${data[key]}&`);
    });

    hash.update(`vnp_SecureSecret=${secretKey}`);

    return hash.digest('hex');
}



export const handleApi = async () => {
    try {
        const { amount } = { amount: 1000 };

        // Tạo các thông tin cần thiết cho yêu cầu thanh toán VNPay
        const vnp_TmnCode = 'YOUR_VNPAY_TMN_CODE';
        const vnp_Amount = amount * 100; // Số tiền phải nhân 100
        const vnp_Command = 'pay';
        const vnp_CreateDate = getCurrentDate();
        const vnp_CurrCode = 'VND';
        const vnp_IpAddr = "127.0.0.1";
        const vnp_Locale = 'vn';
        const vnp_OrderInfo = 'Order information';
        const vnp_ReturnUrl = 'YOUR_RETURN_URL';
        const vnp_TxnRef = generateTransactionReference();
        const vnp_Version = '2.0.0';
        const vnp_SecureHashType = 'SHA256';
        const vnp_SecureSecret = 'YOUR_VNPAY_SECRET_KEY';

        // Tính toán chuỗi hash từ dữ liệu yêu cầu và Khóa bí mật
        const secureHash = generateSecureHash(
            {
                vnp_TmnCode,
                vnp_Amount,
                vnp_Command,
                vnp_CreateDate,
                vnp_CurrCode,
                vnp_IpAddr,
                vnp_Locale,
                vnp_OrderInfo,
                vnp_ReturnUrl,
                vnp_TxnRef,
                vnp_Version,
                vnp_SecureHashType,
            },
            vnp_SecureSecret
        );

        // Gửi yêu cầu tạo mã thanh toán đến VNPay
        const response = await axios.post('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', {
            vnp_TmnCode,
            vnp_Amount,
            vnp_Command,
            vnp_CreateDate,
            vnp_CurrCode,
            vnp_IpAddr,
            vnp_Locale,
            vnp_OrderInfo,
            vnp_ReturnUrl,
            vnp_TxnRef,
            vnp_Version,
            vnp_SecureHashType,
            vnp_SecureHash: secureHash,
        }, {
            httpsAgent: new https.Agent({
                rejectUnauthorized: false // set to false
            })
        });
        console.log("🚀 ~ file: test.ts:91 ~ handleApi ~ response:", response)

        const { data } = response;

        // Trả về URL thanh toán VNPay cho client
        return ({ payUrl: data });
    } catch (error) {
        console.log(error);
    }
}