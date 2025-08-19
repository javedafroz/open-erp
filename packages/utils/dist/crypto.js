import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
const SALT_ROUNDS = 12;
export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};
export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};
export const generateToken = (payload, secret, expiresIn = 3600) => {
    return jwt.sign(payload, secret, { expiresIn });
};
export const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    }
    catch {
        return null;
    }
};
export const generateUUID = () => {
    return uuidv4();
};
export const generateRandomString = (length = 32) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
};
//# sourceMappingURL=crypto.js.map