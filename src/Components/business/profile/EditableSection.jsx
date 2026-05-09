import { Check, Loader2, Pencil, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToastContext } from '../../../context/ToastContext';


 /* Wrapper reutilizable para secciones editables del perfil de negocio.*/

export default function EditableSection({
  title,
  icon: Icon,
  initialValues,
  onSave,
  renderHeader,
  children,
}) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [draft,   setDraft]   = useState(initialValues);

  const { success, error: showError } = useToastContext();

  useEffect(() => {
    if (!editing) setDraft(initialValues);
  }, [initialValues, editing]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
      success('Cambios guardados correctamente.');
    } catch (err) {
      showError(err?.message || 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(initialValues);
    setEditing(false);
  }

  const canEdit = typeof onSave === 'function';

  // Botones pre-construidos: el llamador los coloca donde quiera
  const editButtons = canEdit && (
    <div className="flex items-center gap-2">
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary-mid px-2 py-1 rounded-lg hover:bg-primary-softest transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </button>
      ) : (
        <>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-body px-2 py-1 rounded-lg hover:bg-edge transition-colors disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-70"
          >
            {saving
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Check className="w-3.5 h-3.5" />
            }
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      )}
    </div>
  );

  return (
    <div
      className={`bg-card-bg rounded-2xl p-6 border transition-all duration-200 ${
        editing ? 'border-primary-mid/40 ring-2 ring-primary-mid/10' : 'border-edge'
      }`}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      {renderHeader ? (
        renderHeader({ editing, saving, editButtons })
      ) : (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary-mid" />}
            <h2 className="text-base font-semibold text-heading">{title}</h2>
          </div>
          {editButtons}
        </div>
      )}

      {/* ── Contenido ──────────────────────────────────────────────── */}
      {children({ values: draft, setValues: setDraft, editing, saving })}
    </div>
  );
}
