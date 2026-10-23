// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AssessmentWorkspace from '../src/learner/AssessmentWorkspace';
import type { createLearnerApi } from '../src/learner/learnerApi';

const courseId = '22222222-2222-4222-8222-222222222222';
const assessmentId = '55555555-5555-4555-8555-555555555555';
const attemptId = '66666666-6666-4666-8666-666666666666';
const questionId = '77777777-7777-4777-8777-777777777777';

function makeApi() {
  return {
    listAssessments: vi.fn().mockResolvedValue([{
      id: assessmentId, course_id: courseId, title: 'Clinical knowledge check',
      instructions: 'Choose the best answer.', max_attempts: 3,
    }]),
    listAssessmentAttempts: vi.fn().mockResolvedValue([]),
    listAssessmentQuestions: vi.fn().mockResolvedValue([{
      id: questionId, assessment_id: assessmentId, course_id: courseId,
      prompt: 'Which option is correct?', question_type: 'single_choice',
      choices: [{ id: 'a', label: 'Option A' }, { id: 'b', label: 'Option B' }],
      points: 1, position: 1,
    }]),
    startAssessmentAttempt: vi.fn().mockResolvedValue({ attemptId, attemptNumber: 1 }),
    submitAssessmentAttempt: vi.fn().mockResolvedValue(undefined),
  };
}

describe('AssessmentWorkspace', () => {
  it('starts, answers, and submits through the owner-bound learner API', async () => {
    const api = makeApi();
    render(<AssessmentWorkspace api={api as unknown as ReturnType<typeof createLearnerApi>} courseId={courseId} active />);

    await waitFor(() => expect(screen.getByText('Clinical knowledge check')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Start new attempt' }));
    await waitFor(() => expect(screen.getByText('Which option is correct?')).toBeTruthy());

    fireEvent.click(screen.getByLabelText('Option B'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit assessment' }));

    await waitFor(() => expect(api.submitAssessmentAttempt).toHaveBeenCalledWith(attemptId, [{ question_id: questionId, answer: 'b' }]));
    expect(screen.getByText(/Your responses were submitted/)).toBeTruthy();
  });

  it('does not offer assessment start controls for read-only enrolments', async () => {
    const api = makeApi();
    render(<AssessmentWorkspace api={api as unknown as ReturnType<typeof createLearnerApi>} courseId={courseId} active={false} />);
    await waitFor(() => expect(screen.getByText('Clinical knowledge check')).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'Start new attempt' })).toBeNull();
    expect(screen.getByText(/read-only/)).toBeTruthy();
    expect(api.startAssessmentAttempt).not.toHaveBeenCalled();
  });
});
