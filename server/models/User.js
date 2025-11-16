const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      unique: true,
      validate: {
        validator: function (v) {
          return validator.isEmail(v);
        },
        message: 'Please enter a valid email',
      },
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password length must be at least 8 characters'],
      maxlength: [128, 'Password length cannot exceed 128 characters'],
      select: false,
      validate: {
        validator: function (password) {
          if (!this.isModified('password')) {
            return true;
          }
          return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
        },
        message: 'Password must contain at least one letter and one number',
      },
    },

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    preferences: {
      units: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric',
      },

      weekStartsOn: {
        type: Number,
        min: 0, // 0 = Sunday
        max: 6, // 6 = Saturday
        default: 1, // Monday
      },
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not valid, must be role',
      },
      default: 'user',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to find active users
userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('User', userSchema);
