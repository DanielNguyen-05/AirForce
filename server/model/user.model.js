import mongoose from "mongoose";

const schema = new mongoose.Schema({
  email: String,
  password: String,
}, {
  timestamps: true
})

const User = mongoose.model('User', schema, "user");

export default User;