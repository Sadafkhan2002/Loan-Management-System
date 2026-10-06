const { User } = require("../database/models");
const create = async (data) => {
  return await User.create(data);
};

const findById = async (id) => {
  return await User.findByPk(id, {
    attributes: {
      exclude: ["password"],
    },
  });
};

const findByIdWithPassword = async (id) => {
  return await User.findByPk(id);
};

const findByEmail = async (email) => {
  return await User.findOne({
    where: {
      email,
    },
  });
};

const findAll = async ({
  where,
  limit,
  offset,
}) => {
  return await User.findAndCountAll({
    where,
    limit,
    offset,
    attributes: {
      exclude: ["password"],
    },
    order: [["createdAt", "DESC"]],
  });
};

const update = async (user, data) => {
  return await user.update(data);
};

const deleteUser = async (user) => {
  return await user.destroy();
};

module.exports = {
  create,
  findById,
  findByIdWithPassword,
  findByEmail,
  findAll,
  update,
  deleteUser,
};