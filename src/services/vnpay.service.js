const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const vnpayConfig = require('../config/vnpay.config');

class VNPayService {
  static createPaymentUrl(paymentData) {
    try {
      const { amount, orderId, orderInfo, ipAddr } = paymentData;

      // Validate input
      if (!amount || !orderId || !orderInfo || !ipAddr) {
        throw new Error('Missing required parameters');
      }

      // Format date
      const date = new Date();
      const createDate = moment(date).format('YYYYMMDDHHmmss');
      const txnRef = moment(date).format('HHmmss'); // Tạo mã giao dịch theo format của VNPay

      // Initialize vnp_Params
      const vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = vnpayConfig.tmnCode;
      vnp_Params['vnp_Amount'] = Math.round(amount * 100);
      vnp_Params['vnp_BankCode'] = ''; // Để trống để hiện thị tất cả ngân hàng
      vnp_Params['vnp_CreateDate'] = createDate;
      vnp_Params['vnp_CurrCode'] = 'VND';
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_Locale'] = 'vn';
      vnp_Params['vnp_OrderInfo'] = orderInfo;
      vnp_Params['vnp_OrderType'] = '250000';
      vnp_Params['vnp_ReturnUrl'] = vnpayConfig.returnUrl;
      vnp_Params['vnp_TxnRef'] = txnRef;

      // Remove empty fields
      Object.keys(vnp_Params).forEach(key => {
        if (vnp_Params[key] === null || vnp_Params[key] === undefined || vnp_Params[key] === '') {
          delete vnp_Params[key];
        }
      });

      // Sort params
      const sortedParams = this.sortObject(vnp_Params);

      // Create raw signature string
      const signData = qs.stringify(sortedParams, { encode: false });

      // Create secure hash
      const hmac = crypto.createHmac('sha512', vnpayConfig.hashSecret);
      const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

      // Add secure hash to params
      sortedParams['vnp_SecureHash'] = signed;

      // Create final payment URL
      const paymentUrl = vnpayConfig.url + '?' + qs.stringify(sortedParams, { encode: false });

      console.log('VNPay Request Details:', {
        amount: amount,
        convertedAmount: Math.round(amount * 100),
        txnRef: txnRef,
        createDate: createDate,
        tmnCode: vnpayConfig.tmnCode,
        signData: signData,
        secureHash: signed,
        paymentUrl: paymentUrl
      });

      return paymentUrl;

    } catch (error) {
      console.error('VNPay URL Creation Error:', error);
      throw error;
    }
  }

  static sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }

  static verifyReturnUrl(vnpParams) {
    try {
      const secureHash = vnpParams['vnp_SecureHash'];
      
      delete vnpParams['vnp_SecureHash'];
      delete vnpParams['vnp_SecureHashType'];

      const sortedParams = this.sortObject(vnpParams);
      const signData = qs.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac('sha512', vnpayConfig.hashSecret);
      const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

      console.log('VNPay Return Verification:', {
        receivedHash: secureHash,
        calculatedHash: signed,
        signData: signData
      });

      return secureHash === signed;
    } catch (error) {
      console.error('VNPay Verification Error:', error);
      return false;
    }
  }
}

module.exports = VNPayService; 