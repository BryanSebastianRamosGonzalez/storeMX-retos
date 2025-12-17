// src/controllers/orderController.js

import Order from "../models/order.js";
import Cart from "../models/cart.js"; // 🛑 IMPORTANTE: Importamos Cart para poder borrarlo
import errorHandler from "../middlewares/errorHandler.js";

async function getOrders(req, res, next) {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("products.productId") // O "products.product" según tu modelo
      .populate("shippingAddress")
      .populate("paymentMethod")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    // Si hay usuario logueado, filtramos por él por seguridad, si no, busca genérico (admin)
    const userId = req.user ? (req.user.userId || req.user._id) : null;
    
    const query = { _id: id };
    if (userId) {
        // Opcional: Descomenta esto si quieres seguridad estricta de que solo el dueño vea su orden
        // query.user = userId; 
    }

    const order = await Order.findOne(query)
      .populate("user")
      .populate("products.product") // Ajustado a 'product' si tu schema de Orden usa ese nombre en items
      .populate("shippingAddress")
      .populate("paymentMethod");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
}

// 🛑 FUNCIÓN CORREGIDA Y BLINDADA 🛑
async function getOrdersByUser(req, res, next) {
  try {
    const userId = req.user.userId || req.user._id;

    console.log(`🔍 Buscando órdenes para usuario: ${userId}`);

    const orders = await Order.find({ user: userId })
      .populate("user", "name email")
      .populate("products.productId") // Asegúrate que coincida con tu Schema de Order (product vs productId)
      .populate("shippingAddress")
      .populate("paymentMethod")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error en getOrdersByUser:", error);
    next(error);
  }
}

// 🛑 LÓGICA DE CREACIÓN CORREGIDA (VACIADO DE CARRITO) 🛑
async function createOrder(req, res, next) {
  try {
    console.log("📨 BODY RECIBIDO:", req.body);

    const userId = req.user.userId || req.user._id;

    // 1. Validar direcciones (Soporta ambos nombres)
    const shippingAddressId = req.body.shippingAddressId || req.body.shippingAddress;
    const paymentMethodId = req.body.paymentMethodId || req.body.paymentMethod;
    const shippingCost = req.body.shippingCost || 0;

    if (!shippingAddressId || !paymentMethodId) {
      return res.status(400).json({ error: "Faltan dirección o método de pago" });
    }

    // 2. Buscar Carrito
    const cart = await Cart.findOne({ user: userId }).populate('products.product');

    if (!cart || cart.products.length === 0) {
        return res.status(400).json({ message: "El carrito está vacío" });
    }

    // 🛑 3. EL CAMBIO VITAL: MAPEO EXACTO 🛑
    const orderItems = cart.products.map(item => {
        // Aseguramos obtener el ID sea como sea (objeto poblado o string directo)
        const productRef = item.product ? (item.product._id || item.product) : null;
        const price = item.product?.price || item.price || 0; 
        
        return {
            // ¡OJO AQUÍ! La base de datos exige 'productId', NO 'product'
            productId: productRef, 
            quantity: item.quantity,
            price: price
        };
    });

    console.log("📦 ITEMS PROCESADOS:", JSON.stringify(orderItems, null, 2)); // Chivato para ver qué estamos guardando

    // 4. Calcular total
    const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalPrice = subtotal + shippingCost;

    // 5. Crear Orden
    const newOrder = new Order({
      user: userId,
      products: orderItems, // Mongoose revisará que cada item tenga 'productId'
      shippingAddress: shippingAddressId,
      paymentMethod: paymentMethodId,
      shippingCost,
      totalPrice,
      totalAmount: totalPrice,
      status: "pending",
      paymentStatus: "pending",
    });

    await newOrder.save();

    // 6. Borrar Carrito
    await Cart.findOneAndDelete({ user: userId });

    console.log("✅ Orden creada:", newOrder._id);

    res.status(201).json({ 
        message: "Order created successfully", 
        order: newOrder 
    });

  } catch (error) {
    console.error("🔥 Error creando orden:", error);
    // Si el error es de validación, lo mostramos claro
    if (error.name === 'ValidationError') {
        return res.status(500).json({ 
            message: "Error de validación en BD", 
            error: error.message 
        });
    }
    next(error);
  }
}

async function updateOrder(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const allowedFields = ["status", "paymentStatus", "shippingCost"];
    const filteredUpdate = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    }

    if (filteredUpdate.shippingCost !== undefined) {
      const order = await Order.findById(id);
      if (order) {
        // Ajusta 'products' o 'items' según tu schema
        const productsList = order.products || order.items || [];
        const subtotal = productsList.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        filteredUpdate.totalPrice = subtotal + filteredUpdate.shippingCost;
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, filteredUpdate, {
      new: true,
    })
      .populate("user")
      .populate("shippingAddress")
      .populate("paymentMethod");

    if (updatedOrder) {
      return res.status(200).json(updatedOrder);
    } else {
      return res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    next(error);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({
        message: "Cannot cancel order with status: " + order.status,
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: "cancelled",
        paymentStatus: order.paymentStatus === "paid" ? "refunded" : "failed",
      },
      { new: true }
    )
      .populate("user")
      .populate("shippingAddress")
      .populate("paymentMethod");

    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Valid statuses: " + validStatuses.join(", "),
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (updatedOrder) {
      return res.status(200).json(updatedOrder);
    } else {
      return res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    next(error);
  }
}

async function updatePaymentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        error: "Invalid payment status. Valid statuses: " + validPaymentStatuses.join(", "),
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );

    if (updatedOrder) {
      return res.status(200).json(updatedOrder);
    } else {
      return res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    next(error);
  }
}

async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "cancelled") {
      return res.status(400).json({
        message: "Only cancelled orders can be deleted",
      });
    }

    await Order.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export {
  getOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrder,
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
};