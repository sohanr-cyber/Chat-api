import jwt from "jsonwebtoken";

const JWT_SECRET = "secret_key";

export const signToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
    },

    JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};
