const TuitionService = require('../services/tuition.service');
const { ApiError } = require('../utils/apiError');

class TuitionController {
  async getStudentTuitions(req, res, next) {
    try {
      const tuitions = await TuitionService.getStudentTuitions(req.user.id);
      res.json({
        success: true,
        data: tuitions
      });
    } catch (error) {
      next(error);
    }
  }

  async createPayment(req, res, next) {
    try {
      const payment = await TuitionService.createPayment(req.body, req.user.id);
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  async createVNPayPayment(req, res, next) {
    try {
      const ipAddr = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress ||
                     req.socket.remoteAddress ||
                     req.connection.socket.remoteAddress;
                       
      console.log('Client IP:', ipAddr);
      
      const result = await TuitionService.createVNPayPayment(
        req.body.tuition_id,
        req.user.id,
        ipAddr
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async handleVNPayReturn(req, res, next) {
    try {
      const result = await TuitionService.handleVNPayReturn(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TuitionController(); 