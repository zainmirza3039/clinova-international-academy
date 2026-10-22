import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import StudentDashboardPage from '@/pages/StudentDashboardPage';
import '../../src/index.css';

window.fetch = (() => { throw new Error('Application fetch disabled in the synthetic learner harness.'); }) as typeof fetch;
const scenario = new URLSearchParams(location.search).get('scenario') || 'ready';
export default function Harness() {
  return <><aside className="bg-amber-50 p-4 text-navy-900" data-testid="harness-banner"><strong>TEST HARNESS: synthetic data only — not auth, hosted, or production.</strong><p>Scenario: {scenario}. Auth and learner API calls are mocked; application fetch is blocked.</p></aside><StudentDashboardPage /></>;
}
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={['/student']}><Harness /></MemoryRouter>);
