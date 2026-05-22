import { Clock, Mail, Phone } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { getToken } from '../../utils/storage';
import { decodeToken } from '../../utils/jwt.utils';

function getPanelLink() {
  const token   = getToken();
  const decoded = decodeToken(token);
  const rol     = decoded?.rol?.toLowerCase();
  if (rol === 'owner') return '/dashboardBusiness/perfil';
  if (rol === 'admin') return '/adminDashboard';
  if (rol === 'user')  return '/unauthorized';   // USER → página 403
  return '/unauthorized';                        // sin sesión → página 403
}

export default function LandingFooter() {
  const panelTo = getPanelLink();

  const token   = getToken();
  const decoded = decodeToken(token);
  const isOwner = decoded?.rol?.toLowerCase() === 'owner';

  return (
    <footer className="bg-footer-bg border-t border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Logo + redes */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/dhhlvuzqa/image/upload/v1779333254/ecovida_perfiles/cruexzmiiuvn1tgyjng0.webp"
                alt="Eco Vida"
                className="h-5 w-auto object-contain shrink-0"
              />
              <span className="text-xs font-semibold text-heading uppercase tracking-wider">Eco Vida</span>
            </Link>
            <p className="text-xs text-muted leading-relaxed max-w-[220px]">
              Conectamos consumidores y comercios comprometidos con un futuro más sostenible.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted hover:text-pink-600 transition-colors"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="text-muted hover:text-heading transition-colors"
              >
                <FaXTwitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Compañía */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-heading uppercase tracking-wider">Compañía</p>
            <ul className="flex flex-col gap-2">
              {['Sobre nosotros', 'Nuestra misión', 'Impacto'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs text-muted hover:text-body transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Negocios — solo visible para owners */}
          {isOwner && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-heading uppercase tracking-wider">Negocios</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link to={panelTo} className="text-xs text-muted hover:text-body transition-colors">
                    Panel de control
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-xs text-muted hover:text-body transition-colors">
                    Certificaciones
                  </a>
                </li>
              </ul>
            </div>
          )}

          {/* Col 4: Contacto */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-heading uppercase tracking-wider">Contacto</p>
            <ul className="flex flex-col gap-2.5">
              <li className="flex items-center gap-2 text-xs text-muted">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>ecovidasupport@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>+57 300 000 0000</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Lun – Vie, 8am – 6pm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="mt-10 pt-6 border-t border-edge flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Eco Vida. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {['Privacidad', 'Términos', 'Cookies'].map((item) => (
              <a key={item} href="#" className="text-xs text-muted hover:text-body transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
