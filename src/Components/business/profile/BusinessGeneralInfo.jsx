const tagLabel = (t) => t.tagName ?? t.name ?? t.tag ?? String(t);

const inputCls =
  'w-full px-3.5 py-2.5 border border-edge rounded-xl text-sm text-body bg-card-bg outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-colors';

// ── Vista de solo lectura ─────────────────────────────────────────────────────

export function GeneralInfoDisplay({ description, tags }) {
  return (
    <div className="space-y-4">
      {description && (
        <p className="text-sm text-body leading-relaxed">{description}</p>
      )}

      {tags?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">
            Etiquetas
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.id_tags ?? tagLabel(t)}
                className="text-xs px-3 py-1 bg-primary-softest border border-edge rounded-full text-body"
              >
                #{tagLabel(t)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Formulario de edición ─────────────────────────────────────────────────────

export function GeneralInfoForm({ values, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Descripción
        </label>
        <textarea
          value={values.description ?? ''}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
          rows={4}
          placeholder="Describe tu negocio…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {values.tags?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted mb-1.5">
            Etiquetas <span className="font-normal">(solo lectura)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {values.tags.map((t) => (
              <span
                key={t.id_tags ?? tagLabel(t)}
                className="text-xs px-3 py-1 bg-primary-softest border border-edge rounded-full text-muted"
              >
                #{tagLabel(t)}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted mt-1.5">
            Las etiquetas se gestionan desde administración.
          </p>
        </div>
      )}
    </div>
  );
}
