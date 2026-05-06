# Refactor Plan: Status Codes & Best Practices

## Overview
Comprehensive refactor of the contacts-api to fix status code handling, standardize response format, eliminate bugs, and apply DRY/SOLID principles.

---

## Phase 1: Foundation — Constants, Response Helpers, Error Handler
**Goal:** Establish consistent constants, response format, and error handling.

### 1.1 Fix `src/constants.js`
- Add missing status codes: `BAD_REQUEST (400)`, `CONFLICT (409)`, `UNPROCESSABLE_ENTITY (422)`
- Fix typo `SUCESS` → add `OK (200)`

### 1.2 Create response helper utility
- New file: `src/utils/responseHelper.js`
- Functions: `successResponse(res, code, message, data)` and `errorResponse(res, code, message, error)`
- Format: `{ "success": true|false, "message": "...", "data": {...}, "error": "..." }`
- No `code` field in JSON body (HTTP status code is set on the response object)

### 1.3 Refactor `src/middleware/errorHandler.js`
- Replace switch statement with single unified handler
- Use `err.statusCode || 500` pattern
- Exclude stack trace in production
- Handle Mongoose-specific errors (CastError, ValidationError, DuplicateKeyError)
- Use response helper for consistency

**Commit:** `chore: standardize constants, response helpers, and error handler`

---

## Phase 2: Correct Status Codes Across All Controllers
**Goal:** Fix incorrect, inconsistent, and missing status codes.

### 2.1 `src/controllers/authController.js`
- Missing fields on register → `400` (not `401`)
- Duplicate email on register → `409` (not `401`)
- Duplicate username on register → `409` (not `401`)
- Missing email on forgotPassword → `400` (not `401`)
- Missing fields on resetPassword → `400` (not `401`)
- User not found on login → `404` (not `401`)
- Wrong password → `401` (correct)
- Hash password only **after** existence checks (performance)
- Fix undefined `isReset` variable on line 241
- Replace all responses with response helper

### 2.2 `src/controllers/contactController.js`
- Missing fields on create → `400`
- Not found on get/update/delete → `404`
- Forbidden on update/delete (wrong owner) → `403`
- Fix typo `statusCode.SUCESS` → `statusCode.OK`
- Use response helper for all endpoints

### 2.3 `src/controllers/userController.js`
- Missing fields on password update → `400`
- Wrong current password → `401`
- Duplicate email/username on profile update → `409`
- File not uploaded on avatar → `400`
- Fix `req.user._id` → `req.user.userId` (line 134)
- Add missing `Notification` import
- Use response helper for all endpoints

### 2.4 Middleware status codes
- `tokenValidator.js` — all auth errors return proper codes
- `emailVerificationValidator.js` — all verification errors return proper codes
- `validateRefreshToken.js` — all refresh errors return proper codes
- `validationMiddleware.js` — all validation errors return proper codes

**Commit:** `fix: correct HTTP status codes across all controllers and middleware`

---

## Phase 3: Bug Fixes & Field Unification
**Goal:** Fix runtime bugs and normalize field naming.

### 3.1 Fix `userId` vs `user_id` mismatch
- `contactController.js`: change `user_id` → `userId` (4 occurrences)
- `contactController.js`: change `req.user_id` → `req.user.userId`
- Model already uses `userId` — no changes needed there

### 3.2 Fix `tokenValidator.js:31` — redundant expiration check
- Remove manual `verified.exp` check; `jwt.verify()` already throws on expiry
- Handle `jwt.TokenExpiredError` in catch block

### 3.3 Fix `contactController.js:34` — field name mismatch
- Checks `phoneNumber` but model field is `phone`
- Change validation to check `phone`

### 3.4 Fix error handler invocation
- `authController.js:73` calls `errorHandler(err, req, res)` as function
- Should use `throw err` or `next(err)` instead
- Same pattern in `userController.js` catch blocks

**Commit:** `fix: resolve runtime bugs and unify field naming`

---

## Phase 4: DRY — Eliminate Duplication
**Goal:** Apply DRY principle to reduce code duplication.

### 4.1 Extract user response transformer
- New utility: `src/utils/userTransformer.js`
- Single function `transformUser(user)` replaces duplicated transformations
- Used in: `registerUser`, `loginUser`, `currentUserInfo`, `updateProfile`

### 4.2 Refactor token validators into factory
- `tokenValidator.js` and `emailVerificationValidator.js` share ~90% logic
- Create base token validator factory
- Both validators use factory with different secrets/messages

### 4.3 Remove `express-async-handler` dependency
- All controllers use explicit try/catch
- Remove `asyncHandler()` wrappers from `contactController.js`
- Remove from `package.json`
- Run `npm prune`

**Commit:** `refactor: apply DRY principles and remove duplication`

---

## Phase 5: SOLID & Security Improvements
**Goal:** Improve adherence to SOLID principles and harden security.

### 5.1 Increase bcrypt rounds
- Current: 8 rounds
- Update to: 12 rounds

### 5.2 Secure file upload
- Validate file extension in addition to mimetype
- Ensure upload directory exists before use

### 5.3 Add `AppError` custom error class
- New file: `src/utils/appError.js`
- Typed errors: `ValidationError`, `AuthenticationError`, `NotFoundError`, `ForbiddenError`
- Error handler inspects error type instead of switch on status code

**Commit:** `refactor: improve SOLID compliance and security posture`

---

## Phase 6: Architecture & Infrastructure
**Goal:** Clean up architectural issues and deployment config.

### 6.1 Align base path to `/api/v1/`
- `src/index.js`: mount router at `/api/v1`
- `vercel.json`: update routes to match `/api/v1`
- Update all route comments to reflect correct paths

### 6.2 Initialize Redis in startup
- `index.js`: await Redis connection before starting server
- Handle Redis connection failure gracefully

### 6.3 Graceful shutdown
- Handle `SIGTERM`/`SIGINT` for HTTP server
- Close MongoDB connection on shutdown
- Close Redis connection on shutdown

### 6.4 Clean up dead code
- Remove commented-out code blocks
- Remove unused `console.log` statements
- Remove unused `morgan.token("customdate")`

### 6.5 Add basic rate limiting
- Add `express-rate-limit` dependency
- Apply to auth endpoints (login, register, forgot-password)

**Commit:** `chore: fix architecture issues and add infrastructure improvements`

---

## Phase 7: Testing & Validation
**Goal:** Verify all changes work correctly.

### 7.1 Startup verification
- Verify server starts without errors
- Verify MongoDB and Redis connections establish
- Verify health check endpoint works

### 7.2 Verify removed dependency
- Confirm `express-async-handler` is fully removed
- Run `npm prune` and verify `node_modules` is clean

### 7.3 Manual API testing
- Test each endpoint with correct and incorrect payloads
- Verify status codes match expected values
- Verify response format consistency

**Commit:** `test: verify all refactored endpoints and dependencies`

---

## Phase 8: Final Cleanup & Documentation
**Goal:** Polish and document.

### 8.1 Update README.md
- Document API endpoints with request/response examples
- Document setup instructions
- Document environment variables

### 8.2 Final review
- Verify no linting errors
- Verify consistent code style
- Verify all imports are correct

**Commit:** `docs: update README and perform final cleanup`
