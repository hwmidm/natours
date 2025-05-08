const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
    // trim: true,
    // unique: true
  },
  email: {
    type: String,
    // trim: true,
    required: [true, 'Please provide your Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide a valid E-Mail']
  },
  photo: { type: String, default: 'default.jpg' },
  password: {
    type: String,
    required: [true, 'A user must have a Password'],
    minLength: [8, 'A password must have at least 8 characters'],
    select: false
  },
  passwordChangeAt: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm the password'],
    // select: false,
    validate: {
      // This Only works on CREATE & SAVE !!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match!'
    }
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangeAt = Date.now() - 1000;
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    console.log(changeTimeStamp, JWTTimestamp);
    return JWTTimestamp < changeTimeStamp;
  }
  // false means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
