import validator from 'validator';
import User from '../models/User.js';


 //Validation utility functions


// Common validation patterns
const patterns = {
  phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  nic: {
    old: /^[0-9]{9}[VX]$/i,       // Old NIC format (9 digits + V/X)
    new: /^[0-9]{12}$/            // New NIC format (12 digits)
  },
  password: {
    min: 8,
    max: 128,
    strong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
  }
};

//Validate user registration data

export const validateRegistration = async (data) => {
  const errors = {};

  // Name validation
  if (!data.name || !validator.isLength(data.name, { min: 2, max: 50 })) {
    errors.name = 'Name must be between 2-50 characters';
  }

  // Email validation
  if (!data.email || !validator.isEmail(data.email)) {
    errors.email = 'Please provide a valid email';
  } else {
    const exists = await User.findOne({ email: data.email });
    if (exists) errors.email = 'Email already in use';
  }

  // Password validation
  if (!data.password || !validator.isLength(data.password, { min: patterns.password.min })) {
    errors.password = `Password must be at least ${patterns.password.min} characters`;
  } else if (!patterns.password.strong.test(data.password)) {
    errors.password = 'Password must contain at least one uppercase, one lowercase, one number and one special character';
  }

  // Phone validation
  if (!data.phone || !patterns.phone.test(data.phone)) {
    errors.phone = 'Please provide a valid phone number';
  }

  // Address validation
  if (!data.address || !validator.isLength(data.address, { min: 5, max: 255 })) {
    errors.address = 'Address must be between 5-255 characters';
  }

  // NIC validation
  if (!data.nic || (!patterns.nic.old.test(data.nic) && !patterns.nic.new.test(data.nic))) {
    errors.nic = 'Please provide a valid NIC number';
  } else {
    const exists = await User.findOne({ nic: data.nic.toUpperCase() });
    if (exists) errors.nic = 'NIC already registered';
  }

  // Role validation
  const validRoles = ['customer', 'restaurant_admin', 'delivery_person', 'admin'];
  if (!data.role || !validRoles.includes(data.role)) {
    errors.role = 'Please select a valid role';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

//Validate user login data

export const validateLogin = (data) => {
  const errors = {};

  if (!data.email || !validator.isEmail(data.email)) {
    errors.email = 'Please provide a valid email';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < patterns.password.min) {
    errors.push(`Password must be at least ${patterns.password.min} characters`);
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};


// Validate email address

export const validateEmail = (email) => {
  return validator.isEmail(email);
};

//Validate phone number

export const validatePhone = (phone) => {
  return patterns.phone.test(phone);
};

//Validate NIC number ( both old and new formats)
 
export const validateNIC = (nic) => {
  const normalizedNIC = nic.toUpperCase();
  return patterns.nic.old.test(normalizedNIC) || patterns.nic.new.test(normalizedNIC);
};

//Validate location coordinates
 
export const validateCoordinates = (coordinates) => {
  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates[0] >= -180 &&
    coordinates[0] <= 180 &&
    coordinates[1] >= -90 &&
    coordinates[1] <= 90
  );
};

//Validate user profile update data
 
export const validateProfileUpdate = async (userId, data) => {
  const errors = {};

  // Name validation
  if (data.name && !validator.isLength(data.name, { min: 2, max: 50 })) {
    errors.name = 'Name must be between 2-50 characters';
  }

  // Email validation (if changing email)
  if (data.email) {
    if (!validator.isEmail(data.email)) {
      errors.email = 'Please provide a valid email';
    } else {
      const exists = await User.findOne({ 
        email: data.email, 
        _id: { $ne: userId } 
      });
      if (exists) errors.email = 'Email already in use';
    }
  }

  // Phone validation
  if (data.phone && !patterns.phone.test(data.phone)) {
    errors.phone = 'Please provide a valid phone number';
  }

  // Address validation
  if (data.address && !validator.isLength(data.address, { min: 5, max: 255 })) {
    errors.address = 'Address must be between 5-255 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateRegistration,
  validateLogin,
  validatePassword,
  validateEmail,
  validatePhone,
  validateNIC,
  validateCoordinates,
  validateProfileUpdate
};