import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactPage from '@/pages/ContactPage';
import TrainingPartnersPage from '@/pages/TrainingPartnersPage';
import NewsletterForm from '@/components/NewsletterForm';

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from } }));
vi.mock('@/hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
}));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });
const renderPage = (Component: React.ComponentType) => render(<MemoryRouter><Component /></MemoryRouter>);

function fillValidPartnershipEnquiry() {
  const fields: Array<[RegExp, string]> = [
    [/organisation name/i, 'Northside Learning Group'],
    [/country and location/i, 'United Kingdom'],
    [/contact person/i, 'Alex Example'],
    [/professional role or title/i, 'Education Director'],
    [/business email/i, 'alex@example.org'],
    [/brief proposal or objectives/i, 'We would like to discuss possible educational content collaboration.'],
    [/expected audience or learner group/i, 'Healthcare professionals in our learning network.'],
  ];
  fields.forEach(([label,value])=>fireEvent.change(screen.getByLabelText(label),{target:{value}}));
  fireEvent.change(screen.getByLabelText(/organisation type/i),{target:{value:'University or college'}});
  fireEvent.change(screen.getByLabelText(/collaboration idea/i),{target:{value:'Educational-content collaboration'}});
  fireEvent.click(screen.getByLabelText(/i confirm i am authorised/i));
}

describe('public enquiry workflows', () => {
  it('submits a validated contact enquiry to the private contact submissions table', async () => {
    const insert=vi.fn().mockResolvedValue({error:null});
    from.mockReturnValue({insert});
    renderPage(ContactPage);
    fireEvent.change(screen.getByLabelText('Full name'),{target:{value:'Alex Example'}});
    fireEvent.change(screen.getByLabelText('Email address'),{target:{value:'alex@example.org'}});
    fireEvent.change(screen.getByLabelText('Subject'),{target:{value:'CPD programme information'}});
    fireEvent.change(screen.getByLabelText('Message'),{target:{value:'Please share details about upcoming CPD programmes.'}});
    fireEvent.submit(screen.getByRole('form',{name:'How can the academy help?'}));
    expect((await screen.findByRole('status')).textContent).toMatch(/Your enquiry has been received/i);
    expect(from).toHaveBeenCalledWith('contact_submissions');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      name:'Alex Example',email:'alex@example.org',subject:'CPD programme information',
      message:'Please share details about upcoming CPD programmes.',
    }));
  });

  it('submits a validated institutional expression of interest without implying a partnership is confirmed', async () => {
    const insert=vi.fn().mockResolvedValue({error:null});
    from.mockReturnValue({insert});
    renderPage(TrainingPartnersPage);
    fillValidPartnershipEnquiry();
    const form=screen.getByRole('form',{name:'Discuss a collaboration'});
    fireEvent.submit(form);
    expect((await screen.findByRole('status')).textContent).toMatch(/Your partnership enquiry has been received/i);
    expect(screen.getByRole('status').textContent).toMatch(/no partnership or placement is confirmed/i);
    expect(from).toHaveBeenCalledWith('partnership_inquiries');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      full_name:'Alex Example',
      organisation:'Northside Learning Group',
      role:'Education Director',
      email:'alex@example.org',
      country:'United Kingdom',
      message:expect.stringContaining('Organisation type: University or college'),
    }));
  });

  it('announces required-field errors before sending a partnership enquiry', () => {
    const insert=vi.fn().mockResolvedValue({error:null});
    from.mockReturnValue({insert});
    renderPage(TrainingPartnersPage);
    fireEvent.submit(screen.getByRole('form',{name:'Discuss a collaboration'}));
    expect(screen.getByRole('alert').textContent).toMatch(/Organisation name: Please complete all required fields/i);
    expect(screen.getByLabelText(/organisation name/i).getAttribute('aria-invalid')).toBe('true');
    expect(insert).not.toHaveBeenCalled();
  });

  it('reports a submission failure without displaying a false success message', async () => {
    const insert=vi.fn().mockResolvedValue({error:new Error('database unavailable')});
    from.mockReturnValue({insert});
    renderPage(ContactPage);
    fireEvent.change(screen.getByLabelText('Full name'),{target:{value:'Alex Example'}});
    fireEvent.change(screen.getByLabelText('Email address'),{target:{value:'alex@example.org'}});
    fireEvent.change(screen.getByLabelText('Subject'),{target:{value:'Question'}});
    fireEvent.change(screen.getByLabelText('Message'),{target:{value:'A general enquiry.'}});
    fireEvent.submit(screen.getByRole('form',{name:'How can the academy help?'}));
    await waitFor(()=>expect(screen.getByRole('alert').textContent).toMatch(/could not be submitted/i));
    expect(screen.queryByText(/Your enquiry has been received/i)).toBeNull();
  });

  it('keeps the learning-library callout as navigation rather than an inactive subscription form', () => {
    const {container}=renderPage(NewsletterForm);
    expect(container.querySelector('form')).toBeNull();
    expect(screen.getByRole('link',{name:/Browse resources/i}).getAttribute('href')).toBe('/resources');
    expect(screen.getByRole('link',{name:/Contact information/i}).getAttribute('href')).toBe('/contact');
  });
});
