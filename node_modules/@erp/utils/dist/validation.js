import { VALIDATION_RULES } from '@erp/shared';
export const isValidEmail = (email) => {
    return VALIDATION_RULES.EMAIL_REGEX.test(email);
};
export const isValidPassword = (password) => {
    return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
};
export const isValidUsername = (username) => {
    return username.length >= VALIDATION_RULES.USERNAME_MIN_LENGTH;
};
export const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
};
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
export const sanitizeInput = (input) => {
    return input
        .trim()
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
};
export const validateRequired = (value, fieldName) => {
    if (value === null || value === undefined || value === '') {
        return `${fieldName} is required`;
    }
    return null;
};
export const validateMinLength = (value, minLength, fieldName) => {
    if (value.length < minLength) {
        return `${fieldName} must be at least ${minLength} characters long`;
    }
    return null;
};
export const validateMaxLength = (value, maxLength, fieldName) => {
    if (value.length > maxLength) {
        return `${fieldName} cannot exceed ${maxLength} characters`;
    }
    return null;
};
//# sourceMappingURL=validation.js.map