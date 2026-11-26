import { afterEach, describe, expect, it, vi } from 'vitest';

const { from, rpc, upsert } = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from,
    rpc,
  },
}));

import { issueCpdCertificate, markLessonProgress } from '@/lib/learning';

afterEach(() => {
  vi.clearAllMocks();
});

describe('learning service identity and issuer boundaries', () => {
  it('always scopes lesson progress writes to the supplied learner and enrollment', async () => {
    upsert.mockResolvedValue({ error: null });
    from.mockReturnValue({ upsert });

    await markLessonProgress('learner-123', 'enrollment-456', 'lesson-789', true);

    expect(from).toHaveBeenCalledWith('course_lesson_progress');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: 'learner-123',
        enrollment_id: 'enrollment-456',
        lesson_id: 'lesson-789',
        progress_status: 'completed',
      }),
      { onConflict: 'enrollment_id,lesson_id' },
    );
  });

  it('delegates certificate issuance to the named server-side RPC', async () => {
    rpc.mockResolvedValue({ data: { verification_code: 'verification-123' }, error: null });

    await expect(issueCpdCertificate('enrollment-456', 'CLN-2026-001'))
      .resolves.toBe('verification-123');

    expect(rpc).toHaveBeenCalledWith('issue_cpd_certificate', {
      p_enrollment_id: 'enrollment-456',
      p_certificate_number: 'CLN-2026-001',
    });
  });

  it('does not report issuance success when the server returns no verification code', async () => {
    rpc.mockResolvedValue({ data: null, error: null });

    await expect(issueCpdCertificate('enrollment-456', 'CLN-2026-002'))
      .rejects.toThrow('The certificate was not returned by the issuer.');
  });
});
