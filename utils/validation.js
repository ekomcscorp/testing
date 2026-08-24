/**
 * Email validation utility
 * Validates email format according to RFC 5322 standard
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidFormat = emailRegex.test(email.trim());

  // Additional checks
  if (!isValidFormat) {
    return false;
  }

  // Check length
  if (email.length > 254) {
    return false;
  }

  const [localPart, domain] = email.trim().split("@");

  // Local part constraints
  if (!localPart || localPart.length > 64) {
    return false;
  }

  // Check for consecutive dots
  if (email.includes("..")) {
    return false;
  }

  // Check domain has at least one dot
  if (!domain || !domain.includes(".")) {
    return false;
  }

  return true;
};

/**
 * Get error message for invalid email
 * @param {string} email - Email address
 * @returns {string} - Error message
 */
const getEmailErrorMessage = (email) => {
  if (!email) {
    return "Email tidak boleh kosong";
  }

  if (typeof email !== "string") {
    return "Email harus berupa teks";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Format email tidak valid (contoh: user@domain.com)";
  }

  if (email.length > 254) {
    return "Email terlalu panjang (maksimal 254 karakter)";
  }

  const [localPart, domain] = email.trim().split("@");

  if (!localPart || localPart.length > 64) {
    return "Bagian sebelum @ terlalu panjang (maksimal 64 karakter)";
  }

  if (email.includes("..")) {
    return "Email tidak boleh mengandung titik berturut-turut (..)";
  }

  if (!domain || !domain.includes(".")) {
    return "Domain email harus mengandung titik (.)";
  }

  return "Email tidak valid";
};

module.exports = {
  isValidEmail,
  getEmailErrorMessage,
};
