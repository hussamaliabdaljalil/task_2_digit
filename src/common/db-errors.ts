/** True when a DB error is a unique-constraint violation (PostgreSQL or SQLite). */
export function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; driverError?: { code?: string } };
  const code = e?.code ?? e?.driverError?.code;
  return code === '23505' || code === 'SQLITE_CONSTRAINT_UNIQUE' || code === 'SQLITE_CONSTRAINT_PRIMARYKEY';
}
