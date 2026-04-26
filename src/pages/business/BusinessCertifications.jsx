import { Award, LayoutDashboard, Leaf, Recycle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CERT_PLACEHOLDERS = [
  { label: 'Comercio Justo',        icon: ShieldCheck, desc: 'Certificación de prácticas comerciales éticas y sostenibles.' },
  { label: 'Huella de Carbono',     icon: Leaf,        desc: 'Verificación de reducción o compensación de emisiones de CO₂.' },
  { label: 'Reciclaje Responsable', icon: Recycle,     desc: 'Acreditación en gestión adecuada de residuos y economía circular.' },
];

export default function BusinessCertifications() {
  return (
    <div className="pl-14 pr-6 py-6 space-y-8">

      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <Link to="/dashboardBusiness" className="hover:text-body transition-colors">Mi Negocio</Link>
          <span>/</span>
          <span className="text-body font-medium">Certificaciones</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-primary-dark" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-heading">Certificaciones</h1>
            <p className="text-sm text-muted mt-0.5">
              Sellos y certificados de sostenibilidad · Próximamente
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 bg-primary-softest border border-edge rounded-2xl max-w-2xl">
        <Award className="w-4 h-4 text-primary-mid shrink-0 mt-0.5" />
        <p className="text-sm text-primary-dark">
          Esta sección está en desarrollo. Pronto podrás solicitar y gestionar certificaciones para tu negocio.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Certificaciones disponibles
        </p>
        <div className="flex flex-col gap-3 max-w-2xl">
          {CERT_PLACEHOLDERS.map((cert) => (
            <div
              key={cert.label}
              className="flex items-start gap-4 bg-card-bg rounded-2xl border border-edge shadow-sm p-4 opacity-60"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
                <cert.icon className="w-5 h-5 text-primary-dark" />
              </div>
              <div>
                <p className="text-sm font-medium text-body">{cert.label}</p>
                <p className="text-xs text-muted mt-0.5">{cert.desc}</p>
              </div>
              <span className="ml-auto self-center text-xs font-medium px-2.5 py-1 rounded-full bg-primary-softest text-muted border border-edge whitespace-nowrap">
                Próximamente
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
