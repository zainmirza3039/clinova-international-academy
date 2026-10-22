import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StudentDashboardPage from '@/pages/StudentDashboardPage';
import LearnerWorkspace from '@/learner/LearnerWorkspace';

const USER = '11111111-1111-4111-8111-111111111111';
const COURSE = '22222222-2222-4222-8222-222222222222';
const MODULE = '33333333-3333-4333-8333-333333333333';
const LESSON = '44444444-4444-4444-8444-444444444444';

type Api = {
  getProfile: ReturnType<typeof vi.fn>;
  listEnrolments: ReturnType<typeof vi.fn>;
  listCourses: ReturnType<typeof vi.fn>;
  listModules: ReturnType<typeof vi.fn>;
  listLessons: ReturnType<typeof vi.fn>;
  listProgress: ReturnType<typeof vi.fn>;
  setLessonCompletion: ReturnType<typeof vi.fn>;
};
const apiFactory = vi.fn();
const auth = { enabled: true, status: 'ready', recovery: false, session: { user: { id: USER } }, client: {}, signOut: vi.fn().mockResolvedValue({ error: null }) };
vi.mock('@/auth/AuthProvider', () => ({ useAuth: () => auth }));
vi.mock('@/learner/learnerApi', async () => {
  const actual = await vi.importActual<typeof import('@/learner/learnerApi')>('@/learner/learnerApi');
  return { ...actual, createLearnerApi: (...args: unknown[]) => apiFactory(...args) };
});

function makeApi(overrides: Partial<Api> = {}): Api {
  return {
    getProfile: vi.fn().mockResolvedValue({ user_id: USER, display_name: 'Ada Learner' }),
    listEnrolments: vi.fn().mockResolvedValue([{ id: 'enrol-1', course_id: COURSE, status: 'active', enrolled_at: '2025-01-01' }]),
    listCourses: vi.fn().mockResolvedValue([{ id: COURSE, slug: 'course', title: 'Safe Course', summary: 'A plain summary' }]),
    listModules: vi.fn().mockResolvedValue([{ id: MODULE, course_id: COURSE, title: 'Module One', position: 1 }]),
    listLessons: vi.fn().mockResolvedValue([{ id: LESSON, course_id: COURSE, module_id: MODULE, title: 'Lesson One', body_markdown: '<script>alert(1)</script> **plain**', position: 1 }]),
    listProgress: vi.fn().mockResolvedValue([]),
    setLessonCompletion: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}
function renderPage() { return render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>); }
function renderWorkspace(api: Api) { return render(<MemoryRouter><LearnerWorkspace api={api as never} /></MemoryRouter>); }
async function readyToLesson(api: Api) {
  renderWorkspace(api);
  await screen.findByText(/Ada Learner/);
  fireEvent.click(await screen.findByRole('button', { name: /Read Safe Course/i }));
  await screen.findByRole('button', { name: /Open lessons: Module One/i });
  fireEvent.click(screen.getByRole('button', { name: /Open lessons: Module One/i }));
  await screen.findByText('Lesson One');
}

afterEach(() => { cleanup(); vi.clearAllMocks(); });
beforeEach(() => { vi.stubEnv('VITE_LEARNER_DATA_ENABLED', 'true'); apiFactory.mockReset(); auth.enabled = true; auth.status = 'ready'; auth.recovery = false; auth.session = { user: { id: USER } }; auth.client = {}; });

describe('StudentDashboardPage learner gating', () => {
  it.each([
    ['default off', 'false', true], ['disabled auth', 'true', false], ['loading auth', 'true', false], ['recovery', 'true', false], ['no session', 'true', false],
  ])('%s never reads learner data', (_name, env, enabled) => {
    vi.stubEnv('VITE_LEARNER_DATA_ENABLED', env); auth.enabled = enabled; auth.status = _name === 'loading auth' ? 'loading' : 'ready'; auth.recovery = _name === 'recovery'; auth.session = _name === 'no session' ? null : { user: { id: USER } };
    apiFactory.mockReturnValue(makeApi()); renderPage();
    expect(screen.getByRole('status').textContent).toMatch(/Learner records unavailable/i);
    const candidate = apiFactory.mock.results[0]?.value as Api | undefined; if (candidate) { expect(candidate.getProfile).not.toHaveBeenCalled(); expect(candidate.listEnrolments).not.toHaveBeenCalled(); }
  });

  it('creates the API only for a ready authenticated learner and renders records', async () => {
    const api = makeApi(); apiFactory.mockReturnValue(api); renderPage();
    await screen.findByText(/Ada Learner/);
    expect(apiFactory).toHaveBeenCalledWith(auth.client, true, USER);
    expect(api.getProfile).toHaveBeenCalled(); expect(api.listEnrolments).toHaveBeenCalledWith(0);
  });
});

describe('LearnerWorkspace reads', () => {
  it('shows empty profile/enrolment honestly and does not infer zero', async () => {
    const api = makeApi({ getProfile: vi.fn().mockResolvedValue(null), listEnrolments: vi.fn().mockResolvedValue([]) }); renderWorkspace(api);
    expect(await screen.findByText(/No profile has been provisioned/i)).toBeTruthy();
    expect(screen.getByText(/No enrolment records were returned/i)).toBeTruthy();
    expect(screen.queryByText(/0%|zero progress/i)).toBeNull();
  });
  it('shows loading, errors, and retries profile/enrolments', async () => {
    let rejectProfile!: (e: Error) => void; const profile = new Promise<never>((_, reject) => { rejectProfile = reject; });
    const api = makeApi({ getProfile: vi.fn().mockReturnValueOnce(profile).mockResolvedValue({ user_id: USER, display_name: 'Recovered' }), listEnrolments: vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue([]) }); renderWorkspace(api);
    expect(screen.getAllByRole('status').length).toBeGreaterThanOrEqual(2); rejectProfile(new Error('x'));
    await screen.findByRole('button', { name: /Retry profile/i });
    fireEvent.click(screen.getByRole('button', { name: /Retry profile/i })); fireEvent.click(screen.getByRole('button', { name: /Retry enrolments/i }));
    await screen.findByText(/Recovered/); expect(api.getProfile).toHaveBeenCalledTimes(2); expect(api.listEnrolments).toHaveBeenCalledTimes(2);
  });
  it('renders published lessons as escaped plaintext and omits unpublished lesson data', async () => { const api = makeApi(); renderWorkspace(api); fireEvent.click(await screen.findByRole('button', { name: /Read Safe Course/i })); fireEvent.click(await screen.findByRole('button', { name: /Open lessons: Module One/i }));
    expect(await screen.findByText('<script>alert(1)</script> **plain**')).toBeTruthy(); expect(document.querySelector('script')).toBeNull(); expect(api.listLessons).toHaveBeenCalledWith(COURSE, MODULE, 0);
  });
  it('paginates modules, lessons and markers with page size ten', async () => { const api = makeApi({ listModules: vi.fn().mockResolvedValue(Array.from({ length: 10 }, (_, i) => ({ id: `${MODULE}-${i}`, course_id: COURSE, title: `Module ${i}`, position: i }))), listProgress: vi.fn().mockResolvedValue(Array.from({ length: 10 }, (_, i) => ({ user_id: USER, course_id: COURSE, lesson_id: `${LESSON}-${i}`, completed_at: 'now' }))) }); renderWorkspace(api); fireEvent.click(await screen.findByRole('button', { name: /Read Safe Course/i })); await screen.findByText('Module 0'); expect((screen.getByRole('button', { name: /Next modules/i }) as HTMLButtonElement).disabled).toBe(false); fireEvent.click(screen.getByRole('button', { name: /Next modules/i })); await waitFor(() => expect(api.listModules).toHaveBeenCalledWith(COURSE, 1));
  });
});

describe('LearnerWorkspace completion writes', () => {
  it('keeps both completion controls locked while an accepted write is being verified', async () => {
    let resolveMarkers!: (rows: never[]) => void;
    const markers = new Promise<never[]>(resolve => { resolveMarkers = resolve; });
    const api = makeApi({ listProgress: vi.fn().mockResolvedValueOnce([]).mockReturnValueOnce(markers) });
    await readyToLesson(api);
    const mark = screen.getByRole('button', { name: /Mark reading complete/i }) as HTMLButtonElement;
    const remove = screen.getByRole('button', { name: /Remove completion marker/i }) as HTMLButtonElement;
    fireEvent.click(mark);
    await screen.findByText(/Verifying saved markers/i);
    expect(mark.disabled).toBe(true);
    expect(remove.disabled).toBe(true);
    fireEvent.click(remove);
    expect(api.setLessonCompletion).toHaveBeenCalledTimes(1);
    resolveMarkers([]);
    await screen.findByText(/Saved markers reloaded/i);
    expect(mark.disabled).toBe(false);
    expect(remove.disabled).toBe(false);
  });
  it('keeps an accepted write locked after failed verification until an explicit successful reread', async () => {
    const api = makeApi({ listProgress: vi.fn().mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('verification failed')).mockRejectedValueOnce(new Error('retry failed')).mockResolvedValue([]) });
    await readyToLesson(api);
    const mark = screen.getByRole('button', { name: /Mark reading complete/i }) as HTMLButtonElement;
    const remove = screen.getByRole('button', { name: /Remove completion marker/i }) as HTMLButtonElement;
    fireEvent.click(mark);
    await screen.findByText(/Completion change accepted, but saved markers could not be verified/i);
    expect(mark.disabled).toBe(true);
    expect(remove.disabled).toBe(true);
    fireEvent.click(mark);
    expect(api.setLessonCompletion).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /Reload saved markers/i }));
    await screen.findByRole('button', { name: /Retry saved completion markers/i });
    expect(mark.disabled).toBe(true);
    expect(api.listProgress).toHaveBeenCalledTimes(3);
    fireEvent.click(screen.getByRole('button', { name: /Retry saved completion markers/i }));
    await screen.findByText(/Saved markers reloaded/i);
    expect(mark.disabled).toBe(false);
    expect(remove.disabled).toBe(false);
    expect(api.setLessonCompletion).toHaveBeenCalledTimes(1);
  });
  it('delegates one RPC intent per click, suppresses double clicks, and disables while pending', async () => { let resolve!: () => void; const pending = new Promise<void>(r => { resolve = r; }); const api = makeApi({ setLessonCompletion: vi.fn().mockReturnValue(pending) }); await readyToLesson(api); const button = screen.getByRole('button', { name: /Mark reading complete/i }) as HTMLButtonElement; fireEvent.click(button); fireEvent.click(button); expect(api.setLessonCompletion).toHaveBeenCalledTimes(1); expect(api.setLessonCompletion).toHaveBeenCalledWith(LESSON, true); expect(button.disabled).toBe(true); resolve(); await waitFor(() => expect(button.disabled).toBe(false));
  });
  it('keeps completed and withdrawn enrolments read-only', async () => { for (const status of ['completed', 'withdrawn'] as const) { const api = makeApi({ listEnrolments: vi.fn().mockResolvedValue([{ id: 'e', course_id: COURSE, status, enrolled_at: 'now' }]) }); renderWorkspace(api); await screen.findByText(new RegExp(`Enrolment status: ${status}`)); const read = screen.queryByRole('button', { name: /Read Safe Course/i }); if (read) { fireEvent.click(read); expect(await screen.findByText(/Read-only access/i)).toBeTruthy(); } else { expect(screen.getByText(/Lesson access is unavailable/i)).toBeTruthy(); } expect(screen.queryByRole('button', { name: /Mark reading complete/i })).toBeNull(); cleanup(); } });
  it('does not optimistically mark on ambiguous RPC errors, does not auto-retry, and stays locked until successful reload', async () => { const api = makeApi({ setLessonCompletion: vi.fn().mockRejectedValue(new Error('ambiguous')), listProgress: vi.fn().mockResolvedValue([]) }); await readyToLesson(api); const mark = screen.getByRole('button', { name: /Mark reading complete/i }); fireEvent.click(mark); expect((await screen.findByRole('alert')).textContent).toMatch(/may have reached the server|no automatic retry/i); expect(screen.queryByText(/saved self-reported marker/i)).toBeNull(); expect(api.setLessonCompletion).toHaveBeenCalledTimes(1); expect((mark as HTMLButtonElement).disabled).toBe(true); fireEvent.click(mark); expect(api.setLessonCompletion).toHaveBeenCalledTimes(1); fireEvent.click(screen.getByRole('button', { name: /Reload saved markers/i })); await waitFor(() => expect(api.listProgress).toHaveBeenCalledTimes(2)); await waitFor(() => expect((mark as HTMLButtonElement).disabled).toBe(false));
  });
  it('does not treat progress read failure as zero', async () => { const api = makeApi({ listProgress: vi.fn().mockRejectedValue(new Error('read')) }); await readyToLesson(api); expect((await screen.findByRole('alert')).textContent).toMatch(/not evidence of missing records or zero progress/i); expect(screen.queryByText(/No saved markers were returned/i)).toBeNull();
  });
});

describe('LearnerWorkspace stale response safety', () => {
  it('clears old account data and ignores deferred responses after account change', async () => { let resolveOld!: (v: unknown) => void; const oldProfile = new Promise(r => { resolveOld = r; }); const first = makeApi({ getProfile: vi.fn().mockReturnValue(oldProfile), listEnrolments: vi.fn().mockResolvedValue([]) }); apiFactory.mockReturnValue(first); const { rerender } = render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>); await waitFor(() => expect(first.getProfile).toHaveBeenCalled()); auth.session = { user: { id: '55555555-5555-4555-8555-555555555555' } }; const next = makeApi({ getProfile: vi.fn().mockResolvedValue({ user_id: '55555555-5555-4555-8555-555555555555', display_name: 'New Account' }), listEnrolments: vi.fn().mockResolvedValue([]) }); apiFactory.mockReturnValue(next); rerender(<MemoryRouter><StudentDashboardPage /></MemoryRouter>); expect(screen.queryByText('Old Account')).toBeNull(); await screen.findByText(/New Account/); resolveOld({ user_id: USER, display_name: 'Old Account' }); await new Promise(r => setTimeout(r, 0)); expect(screen.queryByText('Old Account')).toBeNull();
  });
});
