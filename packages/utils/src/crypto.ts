import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (
  payload: object,
  secret: string,
  expiresIn: number = 3600
): string => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = <T = object>(
  token: string,
  secret: string
): T | null => {
  try {
    return jwt.verify(token, secret) as T;
  } catch {
    return null;
  }
};

export const generateUUID = (): string => {
  return uuidv4();
};

export const generateRandomString = (length: number = 32): string => {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};
