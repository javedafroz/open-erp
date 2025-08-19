export declare const API_ENDPOINTS: {
    readonly AUTH: "/api/v1/auth";
    readonly USERS: "/api/v1/users";
    readonly CRM: "/api/v1/crm";
    readonly SALES: "/api/v1/sales";
    readonly SERVICE: "/api/v1/service";
    readonly MARKETING: "/api/v1/marketing";
    readonly ANALYTICS: "/api/v1/analytics";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const DEFAULT_PAGE_SIZE = 25;
export declare const MAX_PAGE_SIZE = 100;
export declare const SUPPORTED_LOCALES: readonly ["en", "es", "fr", "de"];
export declare const CACHE_KEYS: {
    readonly USER_PROFILE: "user:profile";
    readonly USER_PERMISSIONS: "user:permissions";
    readonly ORGANIZATION: "org";
};
export declare const JWT_TOKEN_EXPIRY = 3600;
export declare const REFRESH_TOKEN_EXPIRY = 604800;
export declare const VALIDATION_RULES: {
    readonly PASSWORD_MIN_LENGTH: 8;
    readonly USERNAME_MIN_LENGTH: 3;
    readonly EMAIL_REGEX: RegExp;
};
//# sourceMappingURL=constants.d.ts.map