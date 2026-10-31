# Course Management Backend (NestJS + TypeORM + PostgreSQL)

## Run
```bash
cp .env.example .env
docker compose up -d        # PostgreSQL
npm install
npm run start:dev           # http://localhost:3000/api
npm run test:e2e            # e2e tests (in-memory SQLite, no DB needed)
```

## Design decisions
- **Money**: `decimal(10,2)`, returned as numbers. `finalPrice` is computed (never stored) on every course response.
- **Discounts**: validated against the *resulting* state on create and PATCH (e.g. lowering `price` below an existing FIXED discount -> 400). `NONE` always normalises `discountValue` to 0.
- **Enrollment**: student must exist (404), course must exist (404) and be active (400), no active duplicate (409). `priceAtEnrollment` is snapshotted from the current discount.
- **Re-enrollment after cancellation is allowed.** A *partial unique index* (`status = 'ACTIVE'`) on `(studentId, courseId)` enforces one active enrollment per pair, race-safe. Re-activating a cancelled enrollment that would duplicate an active one returns 409.
- **Delete guards**: deleting a student or course with any enrollment -> 409 (deactivate the course with `isActive:false` instead). Enrollment `DELETE` is a hard delete; prefer `PATCH {status:"CANCELLED"}` to keep history.
- Emails are unique for admins and students (409 on conflict).
- `ValidationPipe` runs with `whitelist` + `forbidNonWhitelisted`, so unknown fields are rejected with 400.
- `synchronize` is on for development only; use migrations for production.
- **No authentication** (per the spec): every endpoint is public. Not for production.
