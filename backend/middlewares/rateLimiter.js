import rateLimit from "express-rate-limit";

// Applies to login, signup, and forgot-password — the endpoints most
// worth protecting against repeated automated attempts (credential
// stuffing, account enumeration, spam signups, email-bombing via
// forgot-password). Keyed by IP by default.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window per IP
    standardHeaders: true, // return RateLimit-* headers
    legacyHeaders: false,
    message: {
        message: "Too many attempts. Please wait a few minutes and try again.",
        success: false,
    },
});

// A slightly looser limiter for resending a verification email — still
// needs a cap so it can't be used to spam someone's inbox.
export const resendLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many resend requests. Please wait a few minutes and try again.",
        success: false,
    },
});
