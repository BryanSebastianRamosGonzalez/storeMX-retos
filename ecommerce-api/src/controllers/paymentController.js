import PaymentMethod from '../models/paymentMethods.js';

export const createPaymentMethod = async (req, res) => {
  try {
    const { type, cardNumber, cardHolderName, expiryDate } = req.body;
    
    const userId = req.user.userId || req.user._id;

    let finalCardNumber = cardNumber;
    let provider = 'generic';

    if (type !== 'cash_on_delivery') {
        
        if (!cardNumber || cardNumber.length < 15) {
            return res.status(400).json({ message: 'Número de tarjeta inválido' });
        }

        if (cardNumber.startsWith('4')) provider = 'Visa';
        else if (cardNumber.startsWith('5')) provider = 'Mastercard';
        else if (cardNumber.startsWith('3')) provider = 'Amex';

        finalCardNumber = cardNumber.slice(-4); 
    }

    const newMethod = new PaymentMethod({
      user: userId,
      type,
      provider,         
      cardNumber: finalCardNumber,
      cardHolderName,
      expiryDate,
      isDefault: false 
    });

    await newMethod.save();

    res.status(201).json({
        message: 'Método de pago agregado con éxito',
        paymentMethod: newMethod
    });

  } catch (error) {
    console.error("Error en createPaymentMethod:", error);
    res.status(500).json({ message: 'Error al procesar el método de pago', error: error.message });
  }
};

export const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const methods = await PaymentMethod.find({ user: userId }).sort({ createdAt: -1 });
    
    res.status(200).json(methods);
  } catch (error) {
    console.error("Error en getPaymentMethods:", error);
    res.status(500).json({ message: 'Error al obtener métodos de pago', error });
  }
};

export const deletePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user._id;

        const deleted = await PaymentMethod.findOneAndDelete({ _id: id, user: userId });

        if (!deleted) {
            return res.status(404).json({ message: 'Método de pago no encontrado o no autorizado' });
        }

        res.status(200).json({ message: 'Método de pago eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};