const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userRepository = require("../repositories/user.repository");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const getPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
});

const register = async ({
  name,
  email,
  password,
}) => {
  if (!name || !email || !password) {
    throw createError(
      "Name, email and password are required",
      400
    );
  }

  if (password.length < 6) {
    throw createError(
      "Password must contain at least 6 characters",
      400
    );
  }

  const existingUser =
    await userRepository.findByEmail(email);

  if (existingUser) {
    throw createError(
      "A user with this email already exists",
      409
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role: "customer",
    status: "active",
  });

  const token = generateToken(user);

  return {
    user: getPublicUser(user),
    token,
  };
};

const login = async ({
  email,
  password,
}) => {
  if (!email || !password) {
    throw createError(
      "Email and password are required",
      400
    );
  }

  const user =
    await userRepository.findByEmail(email);

  if (!user) {
    throw createError(
      "Invalid email or password",
      401
    );
  }

  if (user.status !== "active") {
    throw createError(
      "Your account is inactive",
      403
    );
  }

  const passwordMatch =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!passwordMatch) {
    throw createError(
      "Invalid email or password",
      401
    );
  }

  const token = generateToken(user);

  return {
    user: getPublicUser(user),
    token,
  };
};

const getMe = async (userId) => {
  const user =
    await userRepository.findById(userId);

  if (!user) {
    throw createError(
      "User not found",
      404
    );
  }

  return user;
};

module.exports = {
  register,
  login,
  getMe,
};