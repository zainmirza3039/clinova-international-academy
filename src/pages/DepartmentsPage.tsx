import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import DepartmentCard from '@/components/DepartmentCard';
import CTASection from '@/components/CTASection';
import { departments } from '@/data/departments';

export default function DepartmentsPage() {
  useSEO({ title: 'Healthcare Subject Areas', description: 'Clinova healthcare subject-area information; no course enrollment or qualification offer is implied.' });
  return <>
    <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Subject areas' }]} eyebrow="Subject areas" title="Healthcare subject-area information" description="Browse subject-area information. Course records and legacy outlines are under review and are not current enrollment offers." image="https://images.pexels.com/photos/5452233/pexels-photo-5452233.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" />
    <section className="bg-white py-16 lg:py-24"><div className="mx-auto max-w-editorial px-6 lg:px-10"><p className="mb-9 max-w-3xl text-sm leading-relaxed text-navy-600">These subject areas do not establish an academic department, professional qualification, clinical approval, CPD credit or certification scheme. No course is open for enrollment through this directory.</p><div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{departments.map((department, index) => <DepartmentCard key={department.id} department={department} index={index} />)}</div></div></section>
    <CTASection title="Explore CPD system status" description="Clinova is developing a structured CPD learning system. No course is currently open for enrollment." primaryCTA={{ label: 'CPD system status', to: '/cpd-courses' }} secondaryCTA={{ label: 'Professional certification', to: '/certification' }} />
  </>;
}
