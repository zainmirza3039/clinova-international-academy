import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Building2, CalendarDays, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import DepartmentCard from '@/components/DepartmentCard';
import NewsCard from '@/components/NewsCard';
import { departments } from '@/data/departments';
import { publishedEducationalArticleCards } from '@/data/educationalArticles';
import { academyLegalIdentity } from '@/data/publicContact';

const pathways = [
  { icon: BookOpen, title: 'Continuing professional development', text: 'Structured, instructor-led learning for doctors, nurses and allied healthcare professionals.', to: '/cpd-courses', action: 'Explore CPD programmes' },
  { icon: Building2, title: 'Institutional collaboration', text: 'Work with healthcare organisations on professional education, clinical learning and placement opportunities.', to: '/training-partners', action: 'Discuss collaboration' },
  { icon: ShieldCheck, title: 'Certification and quality', text: 'Learn about Clinova’s developing quality framework and its separate professional certification pathway.', to: '/certification', action: 'Explore certification' },
];

const audience = ['Doctors', 'Physiotherapists and allied health professionals', 'Nurses and midwives', 'Healthcare educators and institutions'];

export default function HomePage() {
  useSEO({
    title: 'Clinova International Academy | Professional Healthcare Education',
    description: 'Instructor-led CPD education, healthcare professional development and institutional collaboration for doctors, nurses and allied healthcare professionals.',
  });

  return (
    <>
      <section className="clinova-home-hero" aria-labelledby="home-hero-heading">
        <div className="clinova-container clinova-home-hero__grid">
          <div className="clinova-home-hero__copy">
            <p className="clinova-eyebrow"><span aria-hidden="true" /> Clinova International Academy</p>
            <h1 id="home-hero-heading">Professional learning for the people who care for others.</h1>
            <p className="clinova-home-hero__lead">Advancing Healthcare Through Professional Education. Clinova brings healthcare professionals and experienced educators together through structured continuing professional development and institutional learning.</p>
            <div className="clinova-actions">
              <Link className="clinova-button clinova-button--primary" to="/cpd-courses">Explore CPD programmes <ArrowRight size={17} aria-hidden="true" /></Link>
              <Link className="clinova-button clinova-button--secondary" to="/about">About the academy</Link>
            </div>
            <p className="clinova-home-hero__note">For doctors, physiotherapists, nurses and the wider allied healthcare workforce.</p>
          </div>
          <aside className="clinova-home-hero__aside" aria-label="Academy focus">
            <div className="clinova-home-hero__aside-top">
              <span className="clinova-overline">Our focus</span>
              <GraduationCap size={25} aria-hidden="true" />
            </div>
            <p className="clinova-home-hero__statement">Education that connects current knowledge with professional practice.</p>
            <ul className="clinova-check-list">
              <li>Instructor-led online learning</li>
              <li>Healthcare-focused CPD programmes</li>
              <li>Institutional and clinical partnerships</li>
              <li>Quality-led educational development</li>
            </ul>
            <Link to="/contact" className="clinova-text-link">Speak with the academy <ArrowRight size={16} aria-hidden="true" /></Link>
          </aside>
        </div>
      </section>

      <section className="clinova-audience" aria-label="Who we serve">
        <div className="clinova-container clinova-audience__inner">
          <p>Supporting professional development across healthcare</p>
          <ul>{audience.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="clinova-section" aria-labelledby="pathways-heading">
        <div className="clinova-container">
          <div className="clinova-section-heading">
            <div><p className="clinova-overline">What we do</p><h2 id="pathways-heading">A connected approach to healthcare education</h2></div>
            <p>From professional learning to collaboration, each pathway has a clear purpose and a defined place within the academy.</p>
          </div>
          <div className="clinova-pathway-grid">
            {pathways.map(({ icon: Icon, title, text, to, action }, index) => <article className="clinova-pathway-card" key={title}>
              <span className="clinova-pathway-card__number">0{index + 1}</span>
              <Icon size={25} strokeWidth={1.7} aria-hidden="true" />
              <h3>{title}</h3><p>{text}</p>
              <Link to={to}>{action} <ArrowRight size={16} aria-hidden="true" /></Link>
            </article>)}
          </div>
        </div>
      </section>

      <section className="clinova-section clinova-section--paper" aria-labelledby="disciplines-heading">
        <div className="clinova-container">
          <div className="clinova-section-heading">
            <div><p className="clinova-overline">Healthcare disciplines</p><h2 id="disciplines-heading">Learning across clinical practice</h2></div>
            <Link to="/departments" className="clinova-text-link">View all subject areas <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="clinova-department-grid">{departments.slice(0, 5).map((department, index) => <DepartmentCard key={department.id} department={department} index={index} />)}</div>
          <p className="clinova-disclaimer">Subject areas describe educational interests. They do not by themselves represent an open course, clinical placement, professional licence or certification award.</p>
        </div>
      </section>

      <section className="clinova-section" aria-labelledby="teaching-heading">
        <div className="clinova-container clinova-teaching">
          <div className="clinova-teaching__intro"><p className="clinova-overline">Teaching and learning</p><h2 id="teaching-heading">Learn with guidance from healthcare educators.</h2><p>Our CPD model is designed around scheduled teaching, relevant learning materials and clear programme information. Instructor profiles and programme details will be added as appointments and course specifications are confirmed.</p><Link to="/become-an-instructor" className="clinova-text-link">Information for instructors <ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className="clinova-teaching__list">
            <div><CalendarDays size={22} aria-hidden="true" /><span><strong>Planned teaching</strong><small>Structured sessions and programme schedules</small></span></div>
            <div><Users size={22} aria-hidden="true" /><span><strong>Professional community</strong><small>Learning for multidisciplinary healthcare teams</small></span></div>
            <div><BookOpen size={22} aria-hidden="true" /><span><strong>Applied knowledge</strong><small>Learning resources connected to clinical practice</small></span></div>
          </div>
        </div>
      </section>

      <section className="clinova-section clinova-section--paper" aria-labelledby="partners-heading">
        <div className="clinova-container clinova-partners">
          <div><p className="clinova-overline">For healthcare organisations</p><h2 id="partners-heading">Build education and placement partnerships.</h2><p>Clinova welcomes enquiries from hospitals, clinics and healthcare organisations interested in professional education, teaching collaboration and structured clinical learning opportunities.</p><Link className="clinova-button clinova-button--primary" to="/training-partners">Explore partnerships <ArrowRight size={17} aria-hidden="true" /></Link></div>
          <div className="clinova-partners__panel"><Building2 size={28} aria-hidden="true" /><h3>Work with Clinova</h3><p>Discuss your organisation’s training needs, potential teaching contribution or placement collaboration.</p><Link to="/contact" className="clinova-text-link">Contact the academy <ArrowRight size={16} aria-hidden="true" /></Link></div>
        </div>
      </section>

      {publishedEducationalArticleCards.length > 0 && <section className="clinova-section" aria-labelledby="resources-heading">
        <div className="clinova-container">
          <div className="clinova-section-heading"><div><p className="clinova-overline">Knowledge and resources</p><h2 id="resources-heading">Perspectives for healthcare professionals</h2></div><Link to="/resources" className="clinova-text-link">All resources <ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className="clinova-resource-grid">{publishedEducationalArticleCards.slice(0, 3).map((item, index) => <NewsCard key={item.id} item={item} index={index} />)}</div>
        </div>
      </section>}

      <section className="clinova-home-contact" aria-labelledby="contact-heading">
        <div className="clinova-container clinova-home-contact__inner"><div><p className="clinova-overline">Start a conversation</p><h2 id="contact-heading">Let’s move healthcare education forward.</h2><p>For programme information, teaching opportunities and institutional collaboration, contact the Clinova team.</p><p className="clinova-home-contact__legal">{academyLegalIdentity.legalName}</p><p className="clinova-home-contact__availability">No CPD course enrollment, certification application, examination, credential issuance or live verification is currently available through this website.</p></div><Link className="clinova-button clinova-button--light" to="/contact">Contact Clinova <ArrowRight size={17} aria-hidden="true" /></Link></div>
      </section>
    </>
  );
}
