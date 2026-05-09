import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

function parseHandle(url) {
  try {
    const pathname = new URL(url).pathname.replace(/\/$/, '');
    const segment = pathname.split('/').filter(Boolean).pop();
    return segment ? `@${segment}` : url;
  } catch {
    return url;
  }
}

const inputCls =
  'w-full px-3.5 py-2.5 border border-edge rounded-xl text-sm text-body bg-card-bg outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-colors';

export function ContactDisplay({
  address, phone, emailBusiness, website,
  instagramUrl, facebookUrl, xUrl,
}) {
  const hasContact = address || phone || emailBusiness || website;
  const hasSocial  = instagramUrl || facebookUrl || xUrl;

  if (!hasContact && !hasSocial) {
    return <p className="text-sm text-muted">Sin información de contacto registrada.</p>;
  }

  return (
    <div className="space-y-4">
      {hasContact && (
        <div className="space-y-3">
          {address && (
            <div className="flex items-start gap-3 text-sm text-body">
              <MapPin className="w-4 h-4 text-muted mt-0.5 shrink-0" />
              <span>{address}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-3 text-sm text-body">
              <Phone className="w-4 h-4 text-muted shrink-0" />
              <span>{phone}</span>
            </div>
          )}
          {emailBusiness && (
            <div className="flex items-center gap-3 text-sm text-body min-w-0">
              <Mail className="w-4 h-4 text-muted shrink-0" />
              <a
                href={`mailto:${emailBusiness}`}
                className="truncate hover:text-primary-dark transition-colors"
              >
                {emailBusiness}
              </a>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-3 text-sm min-w-0">
              <Globe className="w-4 h-4 text-muted shrink-0" />
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-mid hover:text-primary-dark truncate transition-colors"
              >
                {website}
              </a>
            </div>
          )}
        </div>
      )}

      {hasSocial && (
        <div className="space-y-3 pt-3 border-t border-edge/40">
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm group hover:text-pink-500 transition-colors min-w-0">
              <FaInstagram className="w-4 h-4 text-muted shrink-0 group-hover:text-pink-500" />
              <span className="truncate text-body group-hover:text-pink-500">{parseHandle(instagramUrl)}</span>
            </a>
          )}
          {facebookUrl && (
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm group hover:text-blue-600 transition-colors min-w-0">
              <FaFacebook className="w-4 h-4 text-muted shrink-0 group-hover:text-blue-600" />
              <span className="truncate text-body group-hover:text-blue-600">{parseHandle(facebookUrl)}</span>
            </a>
          )}
          {xUrl && (
            <a href={xUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm group hover:text-heading transition-colors min-w-0">
              <FaXTwitter className="w-4 h-4 text-muted shrink-0 group-hover:text-heading" />
              <span className="truncate text-body group-hover:text-heading">{parseHandle(xUrl)}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        )}
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputCls} ${Icon ? 'pl-9' : ''}`}
        />
      </div>
    </div>
  );
}

export function ContactForm({ values, onChange }) {
  const set = (key) => (val) => onChange({ ...values, [key]: val });

  return (
    <div className="space-y-3">
      <Field label="Dirección"    icon={MapPin} value={values.address}       onChange={set('address')}       placeholder="Calle, ciudad, país" />
      <Field label="Teléfono"     icon={Phone}  value={values.phone}         onChange={set('phone')}         placeholder="+57 300 000 0000" />
      <Field label="Email"        icon={Mail}   type="email" value={values.emailBusiness} onChange={set('emailBusiness')} placeholder="contacto@negocio.com" />
      <Field label="Sitio web"    icon={Globe}  type="url"   value={values.website}       onChange={set('website')}       placeholder="https://www.negocio.com" />

      <p className="text-xs font-semibold text-muted uppercase tracking-wider pt-1">
        Redes sociales
      </p>
      <Field label="Instagram" value={values.instagramUrl} onChange={set('instagramUrl')} placeholder="https://instagram.com/negocio" />
      <Field label="Facebook"  value={values.facebookUrl}  onChange={set('facebookUrl')}  placeholder="https://facebook.com/negocio" />
      <Field label="X (Twitter)" value={values.xUrl}       onChange={set('xUrl')}         placeholder="https://x.com/negocio" />
    </div>
  );
}
