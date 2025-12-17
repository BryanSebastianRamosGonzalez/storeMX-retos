import express from 'express';
import {
  getOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrder,
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

router.get('/orders', authMiddleware, isAdmin, getOrders);

router.get('/orders/user', authMiddleware, getOrdersByUser);

router.get('/orders/:id', authMiddleware, getOrderById);

router.post('/orders', authMiddleware, createOrder);

router.patch('/orders/:id/cancel', authMiddleware, isAdmin, cancelOrder);

router.patch('/orders/:id/status', authMiddleware, isAdmin, updateOrderStatus);

router.patch('/orders/:id/payment-status', authMiddleware, isAdmin, updatePaymentStatus);

router.put('/orders/:id', authMiddleware, isAdmin, updateOrder);

router.delete('/orders/:id', authMiddleware, isAdmin, deleteOrder);

export default router;