import { Router } from 'express';
import { createPaymentMethod, getPaymentMethods, deletePaymentMethod } from '../controllers/paymentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.route('/')
  .get(getPaymentMethods)     
  .post(createPaymentMethod);  

router.route('/:id')
  .delete(deletePaymentMethod); 
export default router;