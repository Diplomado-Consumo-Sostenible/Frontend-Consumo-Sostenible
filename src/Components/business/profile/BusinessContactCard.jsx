import { useEffect, useState } from 'react';
import { Check, Globe, Leaf, Loader2, Mail, MapPin, Pencil, Phone, X } from 'lucide-react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const inputCls =
  'w-full px-3.5 py-2.5 border border-edge rounded-xl text-sm text-body bg-card-bg outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-colors';

const socialInputCls =
  'w-full pl-9 pr-3 py-2 rounded-xl text-sm text-white placeholder-white/30 bg-white/10 border border-white/20 focus:border-white/60 outline-none transition-colors';

export function ContactDisplay({ address, phone, emailBusiness }) {
  const hasContact = address || phone || emailBusiness;

  if (!hasContact) {
    return <p className="text-sm text-muted">Sin información de contacto registrada.</p>;
  }

  return (
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
    </div>
  );
}

const SOCIAL_FIELDS = [
  { key: 'instagramUrl', Icon: FaInstagram, label: 'Instagram',   placeholder: 'https://instagram.com/negocio' },
  { key: 'facebookUrl',  Icon: FaFacebook,  label: 'Facebook',    placeholder: 'https://facebook.com/negocio'  },
  { key: 'xUrl',         Icon: FaXTwitter,  label: 'X (Twitter)', placeholder: 'https://x.com/negocio'         },
  { key: 'website',      Icon: Globe,       label: 'Sitio web',   placeholder: 'https://www.negocio.com'       },
];

export function SocialCard({ instagramUrl, facebookUrl, xUrl, website, onSave }) {
  const canEdit = typeof onSave === 'function';

  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [draft,   setDraft]   = useState({
    instagramUrl: instagramUrl || '',
    facebookUrl:  facebookUrl  || '',
    xUrl:         xUrl         || '',
    website:      website      || '',
  });

  useEffect(() => {
    if (!editing) {
      setDraft({
        instagramUrl: instagramUrl || '',
        facebookUrl:  facebookUrl  || '',
        xUrl:         xUrl         || '',
        website:      website      || '',
      });
    }
  }, [instagramUrl, facebookUrl, xUrl, website, editing]);

  const links = [
    instagramUrl && { href: instagramUrl, Icon: FaInstagram, label: 'Instagram' },
    facebookUrl  && { href: facebookUrl,  Icon: FaFacebook,  label: 'Facebook'  },
    xUrl         && { href: xUrl,         Icon: FaXTwitter,  label: 'X (Twitter)' },
    website      && { href: website,      Icon: Globe,       label: 'Sitio web'  },
  ].filter(Boolean);

  if (!links.length && !canEdit) return null;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        instagramUrl: draft.instagramUrl || null,
        facebookUrl:  draft.facebookUrl  || null,
        xUrl:         draft.xUrl         || null,
        website:      draft.website      || null,
      });
      setEditing(false);
    } catch {}
    finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft({
      instagramUrl: instagramUrl || '',
      facebookUrl:  facebookUrl  || '',
      xUrl:         xUrl         || '',
      website:      website      || '',
    });
    setEditing(false);
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-6 py-5"
      style={{
        background: '#344E41',
        boxShadow: '0px 0px 2px #171a1f14, 0px 1px 2.5px #171a1f12',
      }}
    >
      <div className="absolute top-4 bottom-4 right-4 pointer-events-none select-none flex items-center">
        <Leaf
          style={{ width: 88, height: 88, color: 'rgba(255,255,255,0.18)', fill: 'none', strokeWidth: 1.2 }}
        />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-white leading-7" style={{ fontSize: '18px' }}>
            Redes sociales
          </h4>
          {canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-medium text-white/70 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Pencil className="w-3 h-3" />Editar
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-2.5">
            {SOCIAL_FIELDS.map(({ key, Icon, label, placeholder }) => (
              <div key={key}>
                <label className="text-[11px] font-medium text-white/60 mb-1 block">{label}</label>
                <div className="relative">
                  <Icon
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.45)', fill: 'rgba(255,255,255,0.45)' }}
                  />
                  <input
                    type="url"
                    value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    placeholder={placeholder}
                    className={socialInputCls}
                  />
                </div>
              </div>
            ))}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="text-xs font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3 inline mr-1" />Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 text-xs font-medium bg-white text-[#344E41] hover:bg-white/90 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            {links.length > 0
              ? links.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white transition-colors hover:bg-white/90 active:bg-white/80"
                    style={{ color: '#2C5C39' }}
                  >
                    <Icon className="w-5 h-5" style={{ fill: '#2C5C39' }} />
                  </a>
                ))
              : (
                <p className="text-sm text-white/50 italic">
                  Sin redes configuradas. Haz clic en Editar para agregar.
                </p>
              )
            }
          </div>
        )}
      </div>
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
      <Field label="Dirección" icon={MapPin} value={values.address}       onChange={set('address')}       placeholder="Calle, ciudad, país" />
      <Field label="Teléfono"  icon={Phone}  value={values.phone}         onChange={set('phone')}         placeholder="+57 300 000 0000" />
      <Field label="Email"     icon={Mail}   type="email" value={values.emailBusiness} onChange={set('emailBusiness')} placeholder="contacto@negocio.com" />
    </div>
  );
}
