/** UI-level prerequisite only; authoritative issuance eligibility must also be enforced server-side. */
export function isEnrollmentMarkedCompleted(status: string | null | undefined): boolean {
  return status === 'completed';
}
