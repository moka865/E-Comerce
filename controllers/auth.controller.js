const { request } = require("express");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const token = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const myUser = await User.findOne({ email });
  if (!myUser || !(await myUser.isCorrectPassword(password))) {
    return res.status(404).json({ ERROR: `invalid email or password` });
  }
  // const isCorrectPassword= await myUser.isCorrectPassword(password)
  // if(!isCorrectPassword){
  //     return res.status(401).json({ERROR:"invalid Password"})
  // }
  const accessToken = token(myUser);
  res.status(201).json({ login: "vaild", token: accessToken });
};
