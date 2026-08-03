// Lightweight, dependency-free validation helpers used across controllers.

const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit mobile numbers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPhone(phone) {
  return typeof phone === "string" && PHONE_REGEX.test(phone);
}

function isValidEmail(email) {
  if (!email) return true; // email is optional
  return EMAIL_REGEX.test(email);
}

function isValidDob(dobString) {
  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) return false;
  const now = new Date();
  return dob < now && dob.getFullYear() > 1900;
}

function isValidAadhaarLast4(value) {
  return typeof value === "string" && /^\d{4}$/.test(value);
}

/**
 * Validates the public membership application payload.
 * Returns an array of error strings (empty if valid).
 */
function validateApplicationPayload(body) {
  const errors = [];
  if (!body.fullName || body.fullName.trim().length < 3) errors.push("Full name is required");
  if (!body.fatherName || body.fatherName.trim().length < 3) errors.push("Father's name is required");
  if (!isValidDob(body.dob)) errors.push("A valid date of birth is required");
  if (!["MALE", "FEMALE", "OTHER"].includes(body.gender)) errors.push("Gender is required");
  if (!body.address || body.address.trim().length < 5) errors.push("Address is required");
  if (!body.districtId) errors.push("District is required");
  if (!body.assemblyId) errors.push("Assembly is required");
  if (!body.mandalId) errors.push("Mandal is required");
  if (!body.panchayatId) errors.push("Village Panchayat is required");
  if (!isValidPhone(body.phone)) errors.push("A valid 10-digit phone number is required");
  if (!isValidEmail(body.email)) errors.push("Email format is invalid");
  if (!isValidAadhaarLast4(body.aadhaarLast4)) errors.push("Aadhaar last 4 digits must be exactly 4 numbers");
  return errors;
}

module.exports = {
  isValidPhone,
  isValidEmail,
  isValidDob,
  isValidAadhaarLast4,
  validateApplicationPayload,
};
