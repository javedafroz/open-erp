export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateToken: (payload: object, secret: string, expiresIn?: number) => string;
export declare const verifyToken: <T = object>(token: string, secret: string) => T | null;
export declare const generateUUID: () => string;
export declare const generateRandomString: (length?: number) => string;
//# sourceMappingURL=crypto.d.ts.map