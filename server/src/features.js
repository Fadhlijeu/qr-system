/**
 * Central feature flags.
 *
 * A flag is only a gate: every feature stays fully implemented, so it can be
 * switched back on at any time without touching the code.
 *
 * Values are read lazily from `process.env` (i.e. after `dotenv.config()` has
 * run in `index.js`) so they can be toggled from `.env` without a rebuild.
 */

function envFlag(name, defaultValue = false) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(String(raw).trim().toLowerCase());
}

/**
 * Admin self-registration with an e-mail OTP (`/auth/register/request-otp` and
 * `/auth/register/verify-otp`), including the SMTP delivery of the code.
 *
 * Temporarily OFF (default): login only. The endpoints answer `403` with a clear
 * message and the login page hides the registration entry point while disabled.
 * Re-enable with `ENABLE_ADMIN_OTP_REGISTRATION=true` in `.env`.
 */
export function isAdminOtpRegistrationEnabled() {
  return envFlag("ENABLE_ADMIN_OTP_REGISTRATION", false);
}
