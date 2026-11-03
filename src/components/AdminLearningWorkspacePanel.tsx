import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Award, Check, Clock3, GraduationCap, RefreshCw, ShieldCheck, Users, X } from 'lucide-react';
import {
  createAdminCourseAssignment, createInstructorProfile, fetchAdminLearningWorkspace,
  issueCpdCertificate, manageClinovaRole, reviewInstructorProfile, revokeCpdCertificate, setEnrollmentStatus,
  type AdminLearningWorkspace,
} from '@/lib/learning';

type AdminLearningSection = 'Applications' | 'Faculty' | 'Learners' | 'Certificates';
const empty: AdminLearningWorkspace = { profiles: [], instructors: [], enrollments: [], courses: [], certificates: [] };

export default function AdminLearningWorkspacePanel({ section, adminId }: { section: AdminLearningSection; adminId: string }) {
  const [data, setData] = useState<AdminLearningWorkspace>(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [instructorDraft, setInstructorDraft] = useState({ userId: '', publicName: '', title: '' });
  const [assignmentDraft, setAssignmentDraft] = useState({ instructorId: '', courseId: '' });
  const [certificateDraft, setCertificateDraft] = useState({ enrollmentId: '', number: '' });
  const [roleDraft, setRoleDraft] = useState({ userId: '', role: 'instructor' });
  const [revocationReason, setRevocationReason] = useState<Record<string,string>>({});

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetchAdminLearningWorkspace()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Admin records could not be loaded.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function run(action: () => Promise<unknown>, success: string) {
    if (busy) return;
    setBusy(true); setError(null); setNotice(null);
    try { await action(); setNotice(success); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The requested operation could not be completed.'); }
    finally { setBusy(false); }
  }

  async function createInstructor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(() => createInstructorProfile(instructorDraft.userId.trim(), instructorDraft.publicName, instructorDraft.title), 'Instructor profile created in pending review.');
    setInstructorDraft({ userId: '', publicName: '', title: '' });
  }
  async function assignInstructor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(() => createAdminCourseAssignment(assignmentDraft.courseId, assignmentDraft.instructorId, adminId), 'Instructor assigned to the selected programme.');
  }
  async function updateRole(event: FormEvent<HTMLFormElement>, enabled: boolean) {
    event.preventDefault();
    await run(() => manageClinovaRole(roleDraft.userId.trim(), roleDraft.role, enabled), enabled ? 'Role granted.' : 'Role revoked.');
  }

  async function issueCertificate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      const code = await issueCpdCertificate(certificateDraft.enrollmentId, certificateDraft.number);
      setNotice(`Certificate issued. Verification UUID: ${code}`);
      setCertificateDraft({ enrollmentId: '', number: '' });
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Certificate could not be issued.'); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="portal-loading" role="status">Loading academy records…</div>;
  return <section className="admin-learning-panel" aria-labelledby="admin-learning-heading">
    <div className="admin-learning-heading"><div><p className="portal-kicker">ACADEMY OPERATIONS</p><h2 id="admin-learning-heading">{section === 'Applications' ? 'Enrolment applications' : section === 'Faculty' ? 'Instructor and faculty management' : section === 'Learners' ? 'Learner directory' : 'CPD certificate register'}</h2><p>Live records from the secured Clinova database. Actions are restricted by the signed-in administrator role.</p></div><button type="button" className="portal-refresh" onClick={() => void refresh()} disabled={busy}><RefreshCw size={15} />Refresh</button></div>
    {error && <p role="alert" className="portal-alert">{error}</p>}
    {notice && <p role="status" className="portal-notice">{notice}</p>}

    {section === 'Applications' && <>
      <div className="portal-metrics"><article><span>Applications received</span><strong>{data.enrollments.filter(x => x.enrollment_status === 'applied').length}</strong></article><article><span>Active learners</span><strong>{data.enrollments.filter(x => x.enrollment_status === 'active').length}</strong></article><article><span>Completed programmes</span><strong>{data.enrollments.filter(x => x.enrollment_status === 'completed').length}</strong></article><article><span>Cancelled</span><strong>{data.enrollments.filter(x => x.enrollment_status === 'cancelled').length}</strong></article></div>
      <div className="portal-admin-records">{data.enrollments.map(row => <article key={row.id} className="portal-admin-record"><div><span className="portal-status">{row.enrollment_status}</span><h3>{row.learner?.full_name ?? 'Learner account'}</h3><p>{row.learner?.professional_title ?? 'Professional title not provided'} · {row.course?.title ?? 'CPD programme'}</p><small>Applied {new Date(row.applied_at).toLocaleString()}</small></div><div className="portal-record-actions">{row.enrollment_status === 'applied' && <><button type="button" disabled={busy} onClick={() => void run(() => setEnrollmentStatus(row.id,'active',adminId),'Enrolment approved.') }><Check size={14}/>Approve</button><button type="button" disabled={busy} onClick={() => void run(() => setEnrollmentStatus(row.id,'cancelled',adminId),'Application cancelled.') }><X size={14}/>Decline</button></>}{row.enrollment_status === 'active' && <button type="button" disabled={busy} onClick={() => void run(() => setEnrollmentStatus(row.id,'completed',adminId),'Programme completion recorded.') }><Check size={14}/>Mark complete</button>}</div></article>)}</div>
      {!data.enrollments.length && <p className="portal-empty">No learner applications have been submitted.</p>}
    </>}

    {section === 'Faculty' && <>
      <form className="portal-form portal-card" onSubmit={createInstructor}><h3>Create instructor profile</h3><p className="portal-muted">Use the UUID of an existing Supabase Auth user. Public registration cannot create teaching permissions.</p><label>Existing Auth user UUID<input required pattern="[0-9a-fA-F-]{36}" value={instructorDraft.userId} onChange={e => setInstructorDraft(v => ({...v,userId:e.target.value}))} /></label><label>Public display name<input required maxLength={160} value={instructorDraft.publicName} onChange={e => setInstructorDraft(v => ({...v,publicName:e.target.value}))} /></label><label>Professional title<input required maxLength={160} value={instructorDraft.title} onChange={e => setInstructorDraft(v => ({...v,title:e.target.value}))} /></label><button type="submit" className="clinova-button clinova-button--primary" disabled={busy}>Create pending profile</button></form>
      <form className="portal-form portal-card" onSubmit={event => void updateRole(event, true)}><h3>Assign an academy role</h3><p className="portal-muted">Grant or revoke roles for an existing Auth user. Role changes are checked by the Supabase Edge Function and recorded in the audit table.</p><label>Existing Auth user UUID<input required pattern="[0-9a-fA-F-]{36}" value={roleDraft.userId} onChange={e => setRoleDraft(v => ({...v,userId:e.target.value}))} /></label><label>Role<select value={roleDraft.role} onChange={e => setRoleDraft(v => ({...v,role:e.target.value}))}><option value="instructor">Instructor</option><option value="faculty">Faculty</option><option value="content_author">Content author</option><option value="clinical_reviewer">Clinical reviewer</option><option value="editorial_reviewer">Editorial reviewer</option><option value="content_publisher">Content publisher</option><option value="content_admin">Content administrator</option></select></label><div className="flex flex-wrap gap-3"><button type="submit" className="clinova-button clinova-button--primary" disabled={busy}>Grant role</button><button type="button" className="clinova-button clinova-button--secondary" disabled={busy || !roleDraft.userId} onClick={event => { event.preventDefault(); void run(() => manageClinovaRole(roleDraft.userId.trim(),roleDraft.role,false),'Role revoked.'); }}>Revoke role</button></div></form>
      <div className="portal-admin-records">{data.instructors.map(instructor => <article key={instructor.user_id} className="portal-admin-record"><div><span className="portal-status">{instructor.verification_status}</span><h3>{instructor.public_name}</h3><p>{instructor.professional_title}</p><small>{instructor.user_id}</small></div><div className="portal-record-actions">{instructor.verification_status !== 'verified' && <button type="button" disabled={busy} onClick={() => void run(() => reviewInstructorProfile(instructor.user_id,adminId,true),'Instructor profile verified and made public.') }><ShieldCheck size={14}/>Verify</button>}{instructor.verification_status !== 'rejected' && <button type="button" disabled={busy} onClick={() => void run(() => reviewInstructorProfile(instructor.user_id,adminId,false),'Instructor profile rejected.') }><X size={14}/>Reject</button>}</div></article>)}</div>
      <form className="portal-form portal-card" onSubmit={assignInstructor}><h3>Assign an instructor to a CPD programme</h3><label>Verified instructor<select required value={assignmentDraft.instructorId} onChange={e => setAssignmentDraft(v => ({...v,instructorId:e.target.value}))}><option value="">Select instructor</option>{data.instructors.filter(i => i.verification_status === 'verified').map(i => <option key={i.user_id} value={i.user_id}>{i.public_name} · {i.professional_title}</option>)}</select></label><label>Published CPD programme<select required value={assignmentDraft.courseId} onChange={e => setAssignmentDraft(v => ({...v,courseId:e.target.value}))}><option value="">Select programme</option>{data.courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><button type="submit" className="clinova-button clinova-button--primary" disabled={busy || !data.courses.length || !data.instructors.some(i => i.verification_status === 'verified')}>Assign instructor</button></form>
    </>}

    {section === 'Learners' && <><div className="portal-metrics"><article><span>Registered learner profiles</span><strong>{data.profiles.length}</strong></article><article><span>Active enrolments</span><strong>{data.enrollments.filter(e => e.enrollment_status === 'active').length}</strong></article><article><span>Completed enrolments</span><strong>{data.enrollments.filter(e => e.enrollment_status === 'completed').length}</strong></article><article><span>Pending applications</span><strong>{data.enrollments.filter(e => e.enrollment_status === 'applied').length}</strong></article></div><div className="portal-table-wrap portal-card"><table className="portal-table"><thead><tr><th>Learner</th><th>Professional title</th><th>Institution</th><th>Country</th><th>Account ID</th></tr></thead><tbody>{data.profiles.map(profile => <tr key={profile.user_id}><td>{profile.full_name ?? 'Name not provided'}</td><td>{profile.professional_title ?? '—'}</td><td>{profile.institution ?? '—'}</td><td>{profile.country ?? '—'}</td><td><code>{profile.user_id}</code></td></tr>)}</tbody></table></div></>}

    {section === 'Certificates' && <>
      <form className="portal-form portal-card" onSubmit={issueCertificate}><h3>Issue CPD completion certificate</h3><p className="portal-muted">Only completed enrolments can receive a certificate. Use the approved certificate number from the academy register.</p><label>Completed learner enrolment<select required value={certificateDraft.enrollmentId} onChange={e => setCertificateDraft(v => ({...v,enrollmentId:e.target.value}))}><option value="">Select completed enrolment</option>{data.enrollments.filter(e => e.enrollment_status === 'completed' && !data.certificates.some(c => c.enrollment_id === e.id)).map(e => <option key={e.id} value={e.id}>{e.learner?.full_name ?? 'Learner'} · {e.course?.title ?? 'CPD programme'}</option>)}</select></label><label>Certificate number<input required maxLength={80} value={certificateDraft.number} onChange={e => setCertificateDraft(v => ({...v,number:e.target.value}))} /></label><button type="submit" className="clinova-button clinova-button--primary" disabled={busy}>Issue certificate</button></form>
      <div className="portal-admin-records">{data.certificates.map(certificate => <article key={certificate.id} className="portal-admin-record"><div><span className={certificate.revoked_at ? 'portal-status portal-status--revoked' : 'portal-status portal-status--valid'}>{certificate.revoked_at ? 'revoked' : 'valid'}</span><h3>{certificate.learner?.full_name ?? 'Learner'} · {certificate.course?.title ?? 'CPD programme'}</h3><p>{certificate.certificate_number}</p><small>Verification UUID: {certificate.verification_code}</small></div><div className="portal-record-actions">{!certificate.revoked_at && <button type="button" disabled={busy || (revocationReason[certificate.id] ?? '').trim().length < 10} onClick={() => void run(() => revokeCpdCertificate(certificate.id,revocationReason[certificate.id] ?? ''),'Certificate revoked.')}>Revoke</button>}</div>{!certificate.revoked_at && <label className="portal-revocation">Revocation reason<textarea minLength={10} maxLength={2000} rows={2} value={revocationReason[certificate.id] ?? ''} onChange={e => setRevocationReason(v => ({...v,[certificate.id]:e.target.value}))} /></label>}</article>)}</div>
    </>}
    <p className="portal-footnote">Administrative actions are enforced by Supabase RLS and restricted RPCs. This panel does not expose authentication passwords or service-role credentials.</p>
  </section>;
}
