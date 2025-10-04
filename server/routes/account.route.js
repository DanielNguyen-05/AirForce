import express from "express";
import User from "./../model/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const router = express.Router();

router.post("/register", async (req, res) => {
  const existAccount = await User.findOne({
    email: req.body.email
  });

  if (existAccount) {
    res.json({
      code: "error",
      message: "Email already exists in the system!"
    });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  req.body.password = bcrypt.hashSync(req.body.password, salt);

  const newRecord = new User(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Register successfully!"
  });
})

router.post("/login", async (req, res) => {
  const existAccount = await User.findOne({
    email: req.body.email
  })
  if (!existAccount) {
    res.json({
      code: "error",
      message: "Email does not exists in the system!"
    });
    return;
  }

  const isValidPassword = await bcrypt.compare(req.body.password, `${existAccount.password}`);
  if (!isValidPassword) {
    res.json({
      code: "error",
      message: "Incorrect password!"
    });
    return;
  }

  const token = jwt.sign(
    {
      id: existAccount.id,
      email: existAccount.email
    },
    `${process.env.JWT_SECRET}`,
    {
      expiresIn: '1d'
    }
  );

  res.cookie("token", token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,  
    sameSite: "lax"
  });

  res.json({
    code: "success",
    message: "Login successfully!"
  });
})

export default router