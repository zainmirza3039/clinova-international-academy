import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, Handshake, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import { validateFormFields, type FormFieldRules } from '@/lib/formValidation';

const discussionAreas = [
  {
    icon: BookOpen,
    title: 'Educational content',
    description: 'Identify subject areas, audiences and learning questions that could benefit from clear educational resources.',
  },
  {
    icon: Users,
    title: 'Learner needs',
    description: 'Describe accessibility, language, professional context and the learning support your organisation expects.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality and scope',
    description: 'Clarify content ownership, review responsibilities, professional limits and how any learning outcomes would be described.',
  },
];

type DraftField =
  | 'organisationName'
  | 'organisationType'
  | 'countryLocation'
  | 'contactName'
  | 'roleTitle'
  | 'businessEmail'
  | 'phoneNumber'
  | 'collaborationType'
  | 'proposal'
  | 'expectedAudience'
  | 'additionalDetails';

type DraftValues = Record<DraftField, string> & { acknowledgement: boolean };
type DraftErrors = Partial<Record<DraftField | 'acknowledgement', string>>;

const fieldRules: FormFieldRules = {
  organisationName: { required: true, maxLength: 200 },
  organisationType: { required: true, maxLength: 80 },
  countryLocation: { required: true, maxLength: 120 },
  contactName: { required: true, maxLength: 160 },
  roleTitle: { required: true, maxLength: 160 },
  businessEmail: { required: true, maxLength: 320, kind: 'email' },
  phoneNumber: { maxLength: 80 },
  collaborationType: { required: true, maxLength: 80 },
  proposal: { required: true, maxLength: 5000 },
  expectedAudience: { required: true, maxLength: 500 },
  additionalDetails: { maxLength: 2000 },
};

const fieldLabels: Record<DraftField, string> = {
  organisationName: 'Organisation name',
  organisationType: 'Organisation type',
  countryLocation: 'Country and location',
  contactName: 'Contact person',
  roleTitle: 'Professional role or title',
  businessEmail: 'Business email',
  phoneNumber: 'Phone number',
  collaborationType: 'Collaboration idea',
  proposal: 'Brief proposal or objectives',
  expectedAudience: 'Expected audience or learner group',
  additionalDetails: 'Additional details',
};

const createEmptyDraft = (): DraftValues => ({
  organisationName: '',
  organisationType: '',
  countryLocation: '',
  contactName: '',
  roleTitle: '',
  businessEmail: '',
  phoneNumber: '',
  collaborationType: '',
  proposal: '',
  expectedAudience: '',
  additionalDetails: '',
  acknowledgement: false,
});

function validateDraft(values: DraftValues): DraftErrors {
  const errors: DraftErrors = {};
  for (const field of Object.keys(fieldRules) as DraftField[]) {
    const result = validateFormFields({ [field]: values[field] }, { [field]: fieldRules[field] });
    if (result.error) errors[field] = result.error;
  }
  const phoneNumber = values.phoneNumber.trim();
  if (phoneNumber && !errors.phoneNumber && !/^(?=.*\d)[0-9+().\s-]{5,80}$/.test(phoneNumber)) {
    errors.phoneNumber = 'Use 5–80 characters with digits and common phone punctuation.';
  }
  if (!values.acknowledgement) {
    errors.acknowledgement = 'Confirm that this draft is not submitted or saved and contains no patient or learner information.';
  }
  return errors;
}

export default function TrainingPartnersPage() {
  const [draft, setDraft] = useState<DraftValues>(createEmptyDraft);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [status, setStatus] = useState('');
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const focusErrorSummaryOnUpdate = useRef(false);

  useSEO({
    title: 'Training Partnerships',
    description: 'Information and a local-only draft checker for organisations exploring educational collaboration with Clinova International Academy.',
  });

  useEffect(() => {
    if (focusErrorSummaryOnUpdate.current && Object.keys(errors).length > 0) {
      errorSummaryRef.current?.focus();
      focusErrorSummaryOnUpdate.current = false;
    }
  }, [errors]);

  const updateField = (field: DraftField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setStatus('');
  };

  const updateAcknowledgement = (value: boolean) => {
    setDraft((current) => ({ ...current, acknowledgement: value }));
    setErrors((current) => {
      if (!current.acknowledgement) return current;
      const next = { ...current };
      delete next.acknowledgement;
      return next;
    });
    setStatus('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('');
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      focusErrorSummaryOnUpdate.current = true;
      return;
    }
    setStatus('Your draft passed local field checks, but no enquiry was submitted. Nothing was sent or saved. Use the Contact page postal details if you wish to send a written expression of interest.');
  };

  const clearDraft = () => {
    setDraft(createEmptyDraft());
    setErrors({});
    setStatus('');
  };

  const renderInput = (field: DraftField, type: 'text' | 'email' | 'tel' = 'text', autoComplete = 'off') => {
    const id = `partner-${field}`;
    const error = errors[field];
    const rule = fieldRules[field];
    const required = Boolean(rule.required);
    return (
      <div key={field}>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-navy-800">
          {fieldLabels[field]}{required ? ' (required)' : ' (optional)'}
        </label>
        <input
          id={id}
          name={field}
          type={type}
          autoComplete={autoComplete}
          value={draft[field]}
          maxLength={rule.maxLength}
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-help ${id}-error` : `${id}-help`}
          onChange={(event) => updateField(field, event.target.value)}
          className="w-full rounded-md border border-navy-300 bg-white px-4 py-3 text-base text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
        />
        <p id={`${id}-help`} className="mt-1 text-xs text-navy-600">Maximum {rule.maxLength} characters.</p>
        {error && <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-800">{error}</p>}
      </div>
    );
  };

  const renderTextarea = (field: DraftField) => {
    const id = `partner-${field}`;
    const error = errors[field];
    const rule = fieldRules[field];
    const required = Boolean(rule.required);
    return (
      <div key={field}>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-navy-800">
          {fieldLabels[field]}{required ? ' (required)' : ' (optional)'}
        </label>
        <textarea
          id={id}
          name={field}
          value={draft[field]}
          maxLength={rule.maxLength}
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-help ${id}-error` : `${id}-help`}
          onChange={(event) => updateField(field, event.target.value)}
          rows={field === 'proposal' ? 5 : 3}
          className="w-full rounded-md border border-navy-300 bg-white px-4 py-3 text-base text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
        />
        <p id={`${id}-help`} className="mt-1 text-xs text-navy-600">Maximum {rule.maxLength} characters.</p>
        {error && <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-800">{error}</p>}
      </div>
    );
  };

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Training Partnerships' }]}
        eyebrow="Training Partnerships"
        title="Start a considered conversation about learning"
        description="Explore possible educational collaboration and check a proposal draft in this page. Online submissions are not available."
        image="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />
      <section className="bg-white px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-editorial lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600">Areas for discussion</p>
            <h2 className="font-heading text-2xl font-bold text-navy-800 md:text-3xl">Build the conversation around clear expectations</h2>
            <p className="mt-5 text-base leading-relaxed text-navy-600">
              An expression of interest is not a partnership agreement. Before any collaboration begins, both parties should agree in writing on scope, responsibilities, content review, delivery, data handling, fees and any claims about accreditation or certificates.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">
              The examples below are ideas to discuss, not confirmed services or partnerships. Internship or supervised-placement offers are not represented here and would require separate operational approval.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {discussionAreas.map(({ icon: Icon, title, description }) => (
              <article key={title} className="border-t-2 border-teal-500 pt-6">
                <Icon className="mb-5 h-7 w-7 text-clinical-600" aria-hidden="true" />
                <h3 className="font-heading text-lg font-bold text-navy-800">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="collaboration-draft" aria-labelledby="collaboration-draft-heading" className="bg-surface-50 px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600">Local draft checker only</p>
          <h2 id="collaboration-draft-heading" className="mt-3 font-heading text-2xl font-bold text-navy-800 md:text-3xl">Outline a collaboration idea</h2>
          <p className="mt-4 leading-relaxed text-navy-600">
            This form checks fields in your current page only. It does not contact a server, send an enquiry, or save your details. Values remain temporarily in this page until you clear them, leave, or reload. Do not enter patient, learner, or other sensitive personal information.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-navy-600">
            The acknowledgement below only confirms that you understand this local-only behavior; it is not a privacy-policy consent or a submission.
          </p>
          <p className="mt-3 text-sm font-semibold text-navy-800">
            No written submission has been received. Use the <Link to="/contact" className="text-clinical-700 underline">published postal contact details</Link> if you wish to send correspondence.
          </p>

          <form aria-labelledby="collaboration-draft-heading" className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {Object.keys(errors).length > 0 && (
              <div ref={errorSummaryRef} role="alert" aria-labelledby="partner-error-summary-heading" tabIndex={-1} className="border-l-4 border-red-700 bg-red-50 p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800">
                <h3 id="partner-error-summary-heading" className="font-semibold text-red-900">Review these fields</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-900">
                  {(Object.entries(errors) as [keyof DraftErrors, string][]).map(([field, message]) => (
                    <li key={field}>
                      <a className="underline" href={`#partner-${field}`}>{field === 'acknowledgement' ? 'Acknowledgement' : fieldLabels[field as DraftField]}: {message}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {renderInput('organisationName')}
              <div>
                <label htmlFor="partner-organisationType" className="mb-2 block text-sm font-semibold text-navy-800">Organisation type (required)</label>
                <select
                  id="partner-organisationType"
                  name="organisationType"
                  value={draft.organisationType}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.organisationType)}
                  aria-describedby={errors.organisationType ? 'partner-organisationType-help partner-organisationType-error' : 'partner-organisationType-help'}
                  onChange={(event) => updateField('organisationType', event.target.value)}
                  className="w-full rounded-md border border-navy-300 bg-white px-4 py-3 text-base text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
                >
                  <option value="">Choose an organisation type</option>
                  <option value="Hospital or clinic">Hospital or clinic</option>
                  <option value="University or college">University or college</option>
                  <option value="Healthcare education provider">Healthcare education provider</option>
                  <option value="Professional or clinical organisation">Professional or clinical organisation</option>
                  <option value="Other">Other</option>
                </select>
                <p id="partner-organisationType-help" className="mt-1 text-xs text-navy-600">Choose the closest description.</p>
                {errors.organisationType && <p id="partner-organisationType-error" className="mt-1 text-sm font-medium text-red-800">{errors.organisationType}</p>}
              </div>
              {renderInput('countryLocation')}
              {renderInput('contactName', 'text', 'name')}
              {renderInput('roleTitle', 'text', 'organization-title')}
              {renderInput('businessEmail', 'email', 'email')}
              {renderInput('phoneNumber', 'tel', 'tel')}
              <div>
                <label htmlFor="partner-collaborationType" className="mb-2 block text-sm font-semibold text-navy-800">Collaboration idea (required)</label>
                <select
                  id="partner-collaborationType"
                  name="collaborationType"
                  value={draft.collaborationType}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.collaborationType)}
                  aria-describedby={errors.collaborationType ? 'partner-collaborationType-help partner-collaborationType-error' : 'partner-collaborationType-help'}
                  onChange={(event) => updateField('collaborationType', event.target.value)}
                  className="w-full rounded-md border border-navy-300 bg-white px-4 py-3 text-base text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
                >
                  <option value="">Choose an idea to discuss</option>
                  <option value="CPD education discussion">CPD education discussion</option>
                  <option value="Educational-content collaboration">Educational-content collaboration</option>
                  <option value="Institutional training programme discussion">Institutional training programme discussion</option>
                  <option value="Guest educator or subject-matter expert">Guest educator or subject-matter expert</option>
                  <option value="Joint educational event or workshop">Joint educational event or workshop</option>
                  <option value="Other proposed idea">Other proposed idea</option>
                </select>
                <p id="partner-collaborationType-help" className="mt-1 text-xs text-navy-600">These are discussion topics, not confirmed offerings.</p>
                {errors.collaborationType && <p id="partner-collaborationType-error" className="mt-1 text-sm font-medium text-red-800">{errors.collaborationType}</p>}
              </div>
            </div>

            <div className="space-y-5">
              {renderTextarea('proposal')}
              {renderTextarea('expectedAudience')}
              {renderTextarea('additionalDetails')}
            </div>

            <div>
              <div className="flex items-start gap-3">
                <input
                  id="partner-acknowledgement"
                  name="acknowledgement"
                  type="checkbox"
                  required
                  checked={draft.acknowledgement}
                  aria-required="true"
                  aria-invalid={Boolean(errors.acknowledgement)}
                  aria-describedby={errors.acknowledgement ? 'partner-acknowledgement-help partner-acknowledgement-error' : 'partner-acknowledgement-help'}
                  onChange={(event) => updateAcknowledgement(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
                />
                <label htmlFor="partner-acknowledgement" className="text-sm leading-relaxed text-navy-800">
                  I understand this draft is not sent or saved, and I have not included patient or learner information. (required)
                </label>
              </div>
              <p id="partner-acknowledgement-help" className="ml-7 mt-1 text-xs text-navy-600">This acknowledgement is for local draft checking only.</p>
              {errors.acknowledgement && <p id="partner-acknowledgement-error" className="ml-7 mt-1 text-sm font-medium text-red-800">{errors.acknowledgement}</p>}
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="min-h-11 rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
                Validate draft only
              </button>
              <button type="button" onClick={clearDraft} className="min-h-11 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
                Clear draft
              </button>
            </div>
            {status && <p role="status" aria-live="polite" className="border-l-4 border-amber-600 bg-white p-4 text-sm leading-relaxed text-navy-800">{status}</p>}
          </form>
        </div>
      </section>

      <section className="bg-navy-800 px-6 py-14">
        <div className="mx-auto flex max-w-editorial flex-col justify-between gap-8 md:flex-row md:items-center lg:px-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <Handshake className="h-6 w-6 text-teal-300" aria-hidden="true" />
              <h2 className="font-heading text-2xl font-bold text-white">Any future collaboration needs written agreement</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-navy-100/75">
              Online partnership submissions are unavailable. No partnership, delivery capacity or commercial terms are implied by this page.
            </p>
          </div>
          <Link to="/contact" className="inline-flex min-h-11 shrink-0 items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-navy-800 hover:bg-navy-50">
            Contact information<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
