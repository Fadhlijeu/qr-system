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
 * Admin self-registration (the "Daftar Akun Admin" flow on the login page).
 *
 * ON by default: the register form can create an account. Whether that account
 * requires an e-mail OTP first is controlled separately by
 * `isAdminOtpRegistrationEnabled()` — while that one is off, registration simply
 * skips the OTP step. Turn this flag off to close public admin signup entirely.
 */
export function isAdminRegistrationEnabled() {
  return envFlag("ENABLE_ADMIN_REGISTRATION", true);
}

/**
 * Admin self-registration with an e-mail OTP (`/auth/register/request-otp` and
 * `/auth/register/verify-otp`), including the SMTP delivery of the code.
 *
 * OFF by default: the flow (routes, OTP store, SMTP delivery and the OTP screens)
 * stays fully implemented but is parked, so `POST /auth/register` can create the
 * account straight away without waiting for a code. While this flag is on, direct
 * registration without OTP is rejected so e-mail verification cannot be bypassed.
 * Re-enable with `ENABLE_ADMIN_OTP_REGISTRATION=true` in `.env`.
 */
export function isAdminOtpRegistrationEnabled() {
  return envFlag("ENABLE_ADMIN_OTP_REGISTRATION", false);
}
