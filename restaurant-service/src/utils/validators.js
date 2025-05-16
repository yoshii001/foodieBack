import validator from 'validator';

const validationPatterns = {
  name: {
    min: 1,
    max: 100
  },
  password: {
    minLength: 8,
    hasUpperCase: /[A-Z]/, // At least one uppercase letter
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/, // At least one special character
  },
  phone: /^[0-9]{10}$/, // Exactly 10 digits
  address: {
    maxLength: 200
  },
  nic: {
    maxLength: 12
  }
};

// Validate name
export const validateName = (name) => {
  if (!name || name.length < validationPatterns.name.min || name.length > validationPatterns.name.max) {
    return `Name must be between ${validationPatterns.name.min} and ${validationPatterns.name.max} characters.`;
  }
  return null;
};

// Validate email
export const validateEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    return 'Please provide a valid email address.';
  }
  return null;
};

// Validate password
export const validatePassword = (password) => {
  if (!password || password.length < validationPatterns.password.minLength) {
    return 'Password must be at least 8 characters long.';
  }
  if (!validationPatterns.password.hasUpperCase.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!validationPatterns.password.hasSpecialChar.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

// Validate phone number
export const validatePhone = (phone) => {
  if (!phone || !validationPatterns.phone.test(phone)) {
    return 'Phone number must be exactly 10 digits.';
  }
  return null;
};

// Validate address
export const validateAddress = (address) => {
  if (!address || address.length > validationPatterns.address.maxLength) {
    return `Address must be less than ${validationPatterns.address.maxLength} characters.`;
  }
  return null;
};

// Validate NIC
export const validateNIC = (nic) => {
  if (!nic || nic.length > validationPatterns.nic.maxLength) {
    return `NIC must be no more than ${validationPatterns.nic.maxLength} characters.`;
  }
  return null;
};

// Validate role (assuming it's always a string like 'restaurant_admin')
export const validateRole = (role) => {
  if (!role || typeof role !== 'string') {
    return 'Role is required and must be a string.';
  }
  return null;
};

// Validate location (assuming it's an object with latitude and longitude)
export const validateLocation = (location) => {
  if (!location || typeof location !== 'object' || !location.latitude || !location.longitude) {
    return 'Location must include valid latitude and longitude values.';
  }
  return null;
};

// Overall registration validation function
export const validateRegistration = async (data) => {
  const errors = {};

  // Validate each field and add any errors
  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  const addressError = validateAddress(data.address);
  if (addressError) errors.address = addressError;

  const nicError = validateNIC(data.nic);
  if (nicError) errors.nic = nicError;

  const roleError = validateRole(data.role);
  if (roleError) errors.role = roleError;

  const locationError = validateLocation(data.location);
  if (locationError) errors.location = locationError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
