const { Tuition, Enrollment, Course, Student, Class, TuitionPayment } = require('../models');
const { ApiError } = require('../utils/apiError');
const { formatDate } = require('../utils/dateUtils');
const VNPayService = require('./vnpay.service');
const moment = require('moment');

class TuitionService {
  async getStudentTuitions(userId) {
    try {
      const student = await Student.findOne({
        where: { user_id: userId }
      });

      if (!student) {
        throw ApiError.notFound('Không tìm thấy thông tin học viên');
      }

      const enrollments = await Enrollment.findAll({
        where: {
          student_id: student.id,
          status: 'enrolled'
        },
        include: [{
          model: Class,
          required: true,
          where: {
            status: ['upcoming', 'ongoing']
          },
          include: [{
            model: Course,
            required: true,
            attributes: ['id', 'code', 'name', 'fee']
          }]
        }]
      });

      console.log('Found enrollments:', JSON.stringify(enrollments, null, 2));

      const tuitionPromises = enrollments.map(async (enrollment) => {
        if (!enrollment.Class?.Course) {
          console.warn(`No course found for enrollment ${enrollment.id}`);
          return null;
        }

        let tuition = await Tuition.findOne({
          where: {
            enrollment_id: enrollment.id
          }
        });

        if (!tuition) {
          tuition = await Tuition.create({
            student_id: student.id,
            enrollment_id: enrollment.id,
            amount: enrollment.Class.Course.fee,
            due_date: new Date(enrollment.enrolled_at.getTime() + (4 * 7 * 24 * 60 * 60 * 1000)),
            status: 'pending'
          });
        }

        return {
          id: tuition.id,
          amount: Number(tuition.amount),
          due_date: formatDate(tuition.due_date),
          status: tuition.status,
          course: {
            code: enrollment.Class.Course.code,
            name: enrollment.Class.Course.name
          }
        };
      });

      const allTuitions = await Promise.all(tuitionPromises);
      const tuitions = allTuitions.filter(tuition => tuition !== null);
      
      console.log('Processed tuitions:', tuitions);
      return tuitions;
    } catch (error) {
      console.error('Error in getStudentTuitions:', error);
      throw error;
    }
  }

  async createPayment(data, userId) {
    try {
      const student = await Student.findOne({
        where: { user_id: userId }
      });

      if (!student) {
        throw ApiError.notFound('Không tìm thấy thông tin học viên');
      }

      const tuition = await Tuition.findOne({
        where: {
          id: data.tuition_id,
          student_id: student.id
        }
      });

      if (!tuition) {
        throw ApiError.notFound('Không tìm thấy thông tin học phí');
      }

      if (tuition.status === 'paid') {
        throw ApiError.badRequest('Học phí này đã được thanh toán');
      }

      // Tạo mã giao dịch unique
      const transactionId = `TUI${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

      const payment = await TuitionPayment.create({
        tuition_id: tuition.id,
        student_id: student.id,
        amount: data.amount,
        payment_method: data.payment_method,
        payment_details: data.payment_details,
        transaction_id: transactionId,
        status: 'processing',
        payment_date: new Date(),
        notes: data.notes
      });

      // Cập nhật trạng thái học phí
      await tuition.update({ status: 'processing' });

      return {
        id: payment.id,
        transaction_id: payment.transaction_id,
        status: payment.status,
        payment_date: formatDate(payment.payment_date)
      };
    } catch (error) {
      console.error('Error in createPayment:', error);
      throw error;
    }
  }

  async createVNPayPayment(tuitionId, userId, ipAddr) {
    try {
      const student = await Student.findOne({
        where: { user_id: userId }
      });

      if (!student) {
        throw ApiError.notFound('Không tìm thấy thông tin học viên');
      }

      const tuition = await Tuition.findOne({
        where: {
          id: tuitionId,
          student_id: student.id
        }
      });

      if (!tuition) {
        throw ApiError.notFound('Không tìm thấy thông tin học phí');
      }

      if (tuition.status === 'paid') {
        throw ApiError.badRequest('Học phí này đã được thanh toán');
      }

      // Tạo mã giao dịch ngắn gọn theo format HHmmss
      const transactionId = moment().format('HHmmss');
      const fullTransactionId = moment().format('YYYYMMDDHHmmss') + Math.random().toString(36).substring(2, 15).toUpperCase();

      // Lưu payment record với cả 2 mã giao dịch
      const payment = await TuitionPayment.create({
        tuition_id: tuition.id,
        student_id: student.id,
        amount: tuition.amount,
        payment_method: 'vnpay',
        status: 'pending',
        transaction_id: transactionId, // Mã ngắn để VNPay trả về
        full_transaction_id: fullTransactionId, // Mã đầy đủ để lưu trữ
        created_at: new Date()
      });

      console.log('Created payment record:', {
        paymentId: payment.id,
        transactionId: transactionId,
        fullTransactionId: fullTransactionId,
        amount: tuition.amount
      });

      // Tạo URL thanh toán VNPay với mã giao dịch ngắn
      const vnpayUrl = VNPayService.createPaymentUrl({
        amount: tuition.amount,
        orderId: transactionId, // Sử dụng mã ngắn
        orderInfo: `Thanh toan hoc phi - Ma GD: ${fullTransactionId}`,
        ipAddr: ipAddr || '127.0.0.1'
      });

      return {
        success: true,
        data: {
          paymentUrl: vnpayUrl,
          transactionId: transactionId,
          fullTransactionId: fullTransactionId
        }
      };
    } catch (error) {
      console.error('Error in createVNPayPayment:', error);
      throw error;
    }
  }

  async handleVNPayReturn(vnpayResponse) {
    try {
      console.log('VNPay return params:', vnpayResponse);

      const isValidSignature = VNPayService.verifyReturnUrl(vnpayResponse);
      if (!isValidSignature) {
        throw ApiError.badRequest('Invalid VNPay signature');
      }

      const transactionId = vnpayResponse.vnp_TxnRef;
      console.log('Looking for payment with transaction ID:', transactionId);

      // Tìm payment record với mã giao dịch ngắn
      const payment = await TuitionPayment.findOne({
        where: {
          transaction_id: transactionId // Tìm theo mã ngắn
        },
        include: [
          {
            model: Tuition,
            as: 'tuition',
            required: true
          },
          {
            model: Student,
            as: 'student',
            required: true
          }
        ]
      });

      if (!payment) {
        console.error('Payment not found for transaction:', transactionId);
        throw ApiError.notFound('Payment not found');
      }

      console.log('Found payment:', {
        paymentId: payment.id,
        tuitionId: payment.tuition?.id,
        status: payment.status
      });

      const responseCode = vnpayResponse.vnp_ResponseCode;
      const transactionStatus = vnpayResponse.vnp_TransactionStatus;
      const amount = parseInt(vnpayResponse.vnp_Amount) / 100;

      // Cập nhật trạng thái thanh toán
      if (responseCode === '00' && transactionStatus === '00') {
        await payment.update({
          status: 'completed',
          payment_response: JSON.stringify(vnpayResponse),
          paid_at: new Date()
        });

        await payment.tuition.update({
          status: 'paid',
          paid_at: new Date()
        });

        return {
          success: true,
          message: 'Thanh toán thành công',
          data: {
            paymentId: payment.id,
            tuitionId: payment.tuition.id,
            amount: amount,
            status: 'completed'
          }
        };
      } else {
        await payment.update({
          status: 'failed',
          payment_response: JSON.stringify(vnpayResponse)
        });

        return {
          success: false,
          message: 'Thanh toán thất bại',
          code: responseCode,
          data: {
            paymentId: payment.id,
            tuitionId: payment.tuition.id,
            amount: amount,
            status: 'failed'
          }
        };
      }
    } catch (error) {
      console.error('Error in handleVNPayReturn:', error);
      throw error;
    }
  }
}

module.exports = new TuitionService(); 