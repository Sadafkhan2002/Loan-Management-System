const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const userRepository = require("../repositories/user.repository");

const getUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role,
  status,
}) => {
  page = Number(page);
  limit = Number(limit);

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 10;
  }

  if (limit > 100) {
    limit = 100;
  }

  const offset = (page - 1) * limit;

  const where = {};

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  if (search.trim()) {
    where[Op.or] = [
      {
        name: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
      {
        email: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
    ];
  }

  const result = await userRepository.findAll({
    where,
    limit,
    offset,
  });

  return {
    users: result.rows,
    pagination: {
      totalItems: result.count,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(
        result.count / limit
      ),
    },
  };
};

const getUserById = async (id) => {
  const user =
    await userRepository.findById(id);

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return user;
};

const updateUser = async (
  id,
  data,
  currentUserId
) => {
  const user =
    await userRepository.findByIdWithPassword(
      id
    );

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;

    throw error;
  }

  /*
   * Prevent an administrator from
   * accidentally removing their own
   * admin role.
   */
  if (
    Number(id) === Number(currentUserId) &&
    data.role &&
    data.role !== "admin"
  ) {
    const error = new Error(
      "You cannot remove your own admin role"
    );

    error.statusCode = 400;

    throw error;
  }

  if (data.email) {
    const existingUser =
      await userRepository.findByEmail(
        data.email
      );

    if (
      existingUser &&
      Number(existingUser.id) !== Number(id)
    ) {
      const error = new Error(
        "Email is already registered"
      );

      error.statusCode = 409;

      throw error;
    }
  }

  const updateData = {
    ...data,
  };

  if (data.password) {
    updateData.password =
      await bcrypt.hash(data.password, 10);
  }

  await userRepository.update(
    user,
    updateData
  );

  return await userRepository.findById(id);
};

const updateUserStatus = async (
  id,
  status,
  currentUserId
) => {
  const user =
    await userRepository.findByIdWithPassword(
      id
    );

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;

    throw error;
  }

  /*
   * Prevent an admin from deactivating
   * their own account.
   */
  if (
    Number(id) === Number(currentUserId) &&
    status === "inactive"
  ) {
    const error = new Error(
      "You cannot deactivate your own account"
    );

    error.statusCode = 400;

    throw error;
  }

  await userRepository.update(user, {
    status,
  });

  return await userRepository.findById(id);
};

const deleteUser = async (
  id,
  currentUserId
) => {
  const user =
    await userRepository.findByIdWithPassword(
      id
    );

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;

    throw error;
  }

  if (
    Number(id) === Number(currentUserId)
  ) {
    const error = new Error(
      "You cannot delete your own account"
    );

    error.statusCode = 400;

    throw error;
  }

  await userRepository.deleteUser(user);

  return true;
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
};