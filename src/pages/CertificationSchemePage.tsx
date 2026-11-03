import { Navigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';

export default function CertificationSchemePage() {
  useSEO({ title: 'Certification scheme information', description: 'No Clinova professional certification scheme is approved or open.', noindex: true });
  return <Navigate to="/certification" replace />;
}
