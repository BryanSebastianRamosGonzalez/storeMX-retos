import bcrypt from "bcrypt";
import User from "../models/users.js"
import PaymentMethod from "../models/paymentMethods.js"; 
import ShippingAddress from "../models/shippingAddress.js";

const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-hashPassword");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addresses = await ShippingAddress.find({ user: userId });

    const paymentMethods = await PaymentMethod.find({ user: userId, isActive: true });

    const userWithDetails = user.toObject();
    
    userWithDetails.shippingAddresses = addresses;
    userWithDetails.paymentMethods = paymentMethods;

    res.status(200).json({
      message: "User profile retrieved successfully",
      user: userWithDetails, 
    });
  } catch (error) {
    next(error);
  }
};


const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const users = await User.find(filter)
      .select("-hashPassword")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ _id: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      message: "Users retrieved successfully",
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-hashPassword");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User retrieved successfully", user });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { displayName, email, phone, avatar } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
    }
    if (displayName) user.displayName = displayName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    await user.save();
    const updatedUser = await User.findById(userId).select("-hashPassword");
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.hashPassword);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    user.hashPassword = hashedNewPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { displayName, email, phone, avatar, role, isActive } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
    }
    if (displayName) user.displayName = displayName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();
    const updatedUser = await User.findById(userId).select("-hashPassword");
    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isActive = false;
    await user.save();
    res.status(200).json({ message: "Account deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    const updatedUser = await User.findById(userId).select("-hashPassword");
    res.status(200).json({ message: `User ${user.isActive ? "activated" : "deactivated"} successfully`, user: updatedUser });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isActive = false;
    await user.save();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const searchUser = async (req, res, next) => {
  try {
    const { q, displayName, email, phone, role, isActive, sort, order, page = 1, limit = 10 } = req.query;
    let filters = {};
    if (displayName) filters.displayName = { $regex: displayName, $options: "i" };
    if (q) filters.$or = [{ displayName: { $regex: q, $options: "i" } }, { phone: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
    if (role) filters.role = role;
    if (isActive === "true") filters.isActive = true;
    else if (isActive === "false") filters.isActive = false;

    let sortOptions = {};
    if (sort) {
      const sortOrder = order === "desc" ? -1 : 1;
      sortOptions[sort] = sortOrder;
    } else {
      sortOptions.email = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filters).sort(sortOptions).skip(skip).limit(parseInt(limit));
    const totalResul = await User.countDocuments(filters);
    const totalPages = Math.ceil(totalResul / parseInt(limit));

    res.status(200).json({
      users,
      Pagination: { currentPage: parseInt(page), totalPages, totalResul, hasNext: parseInt(page) < totalPages, hasPrev: parseInt(page) > 1 },
      filters: { searchTearm: q || null, role: role || null, isActive: isActive === 'true' ? true : false, order: order || 'email' }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    next(error);
  }
};

export {
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUserProfile,
  changePassword,
  updateUser,
  deactivateUser,
  toggleUserStatus,
  deleteUser,
  searchUser,
  checkEmail
};