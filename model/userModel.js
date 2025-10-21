const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "superAdmin"],
    },
    isActive: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.statics.signup = async function (
  userCredentials,
  role,
  isusernameVerified
) {
  const { username, password, passwordAgain } =
    userCredentials;

  if (

    !username ||
    !password ||
    !passwordAgain ||
    !role
  ) {
    throw Error("All fields are required");
  }


  if (password !== passwordAgain) {
    throw Error("Password is not match");
  }



  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }

  // Checking if the username is already registered.
  const exists = await this.findOne({ username });
  if (exists) {
    throw Error("username already in use");
  }
  

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  userCredentials["password"] = hash;

  delete userCredentials["passwordAgain"];

  const user = await this.create({
    ...userCredentials,
    isActive: true,
    role,
    isusernameVerified,
  });

  user.password = "";

  return user;
};

UserSchema.statics.login = async function (username, password) {
  if (!username || !password) {
    throw Error("All fields are required");
  }

  let user = await this.findOne({ username });
  if (!user) {
    throw Error("This username is not registered. Please check!");
  }
  if (!user.isActive) {
    throw Error(
      "Your account is blocked. Contact customer care for further details"
    );
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect Password");
  }

  user.password = "";

  return user;
};

UserSchema.statics.changePassword = async function (
  _id,
  currentPassword,
  password,
  passwordAgain
) {
  if (password !== passwordAgain) {
    throw Error("Password doesn't match");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }
  const exists = await this.findOne({ _id });
  if (!exists) {
    throw Error("Cannot find username");
  }

  const match = await bcrypt.compare(currentPassword, exists.password);

  if (!match) {
    throw Error("Current Password is wrong");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  let user = await this.updateOne({ _id }, { $set: { password: hash } });
  console.log(user);

  user.password = "";

  return user;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
