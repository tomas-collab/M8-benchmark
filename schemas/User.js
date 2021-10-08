import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: ["guest", "host"],
      default: "guest",
    },
    password: { type: String },
    googleId: { type: String },
  },
  {
    timestamps: true,
  }
);

//  ======== Hashing passwords
// creating new
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const hash = await bcrypt.hash(this.password, 12);
  this.password = hash;

  return next();
});

// Updating existent
userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  const { password: plainPwd } = update;

  if (plainPwd) {
    const password = await bcrypt.hash(plainPwd, 10);
    this.setUpdate({ ...update, password });
  }
});

//Showing json without passwords
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

//Checking credentials
userSchema.statics.checkCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const UserModel = model("user", userSchema);

export default UserModel;
