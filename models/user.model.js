const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address: { type: String, required: true, trim: true },
  governorate: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  area: { type: String, trim: true },
  buildingDetails: { type: String, trim: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  mobilePhone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nationalId: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
    default: 'user'
  },
  dateOfBirth: {
    type: Date
  },
  addresses: [addressSchema],
  isBlocked: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  birthdayEmailSentYear: {
    type: Number
  }
}, {
  timestamps: true
});

userSchema.index({ dateOfBirth: 1 });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.isCorrectPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);