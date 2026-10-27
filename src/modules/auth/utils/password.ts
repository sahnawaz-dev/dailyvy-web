/** Mirrors the server's password policy (server/src/common/validators/password.js). */
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'lower', label: 'A lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'upper', label: 'An uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', label: 'A number', test: (p: string) => /\d/.test(p) },
] as const

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password))
}

/** 0 (empty) .. 4 (strong). Length and symbols push beyond the minimum. */
export function passwordScore(password: string): number {
  if (!password) return 0
  let score = PASSWORD_RULES.filter((rule) => rule.test(password)).length - 1
  if (password.length >= 12) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return Math.max(1, Math.min(4, score))
}
