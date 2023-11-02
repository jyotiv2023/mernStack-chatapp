import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { generateToken } from "../config/generateToken.js";

export const registerUser = asyncHandler(async (request, response) => {
  console.log(response);

  const { name, email, password, picture } = request.body;
  if (!name || !email || !password) {
    response.status(400);
    throw new Error("Please Enter all the fields");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    response.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    picture,
  });
  if (user) {
    response.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      token: generateToken(user._id),
    });
  } else {
    response.status(400);
    throw new Error("Failed to create the user");
  }
});

export const authUser = asyncHandler(async (request, response) => {
  const { email, password } = request.body;
  const userExists = await User.findOne({ email });

  if (userExists && (await userExists.matchPassword(password))) {
    response.json({
      _id: userExists._id,
      name: userExists.name,
      email: userExists.email,
      picture: userExists.picture,
      token: generateToken(userExists._id),
    });
  } else {
    response.status(401);
    throw new Error("Invalid email or password");
  }
});

export const allUsers = asyncHandler(async (request, response) => {
  const keyword = request.query.search
    ? {
        $or: [
          { name: { $regex: request.query.search, $options: "i" } },
          { email: { $regex: request.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({
    _id: { $ne: request.user._id },
  });
  response.send(users);
});
