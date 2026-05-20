import { useState, useEffect, useCallback } from 'react';
import {
  Flag,
  Search,
  Loader2,
  LayoutDashboard,
  ChevronRight,
  CheckCircle,
  Trash2,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  MessageSquare,
  Building2,
  User,
  X,
  ShieldAlert,
} from 'lucide-react';
import { getReportedReviews, resolveReport } from '../../services/admin/reviews-reports.service';
import { useToastContext } from '../../context/ToastContext';

const REASON_OPTIONS = [
  { value: '', label: 'Todos los motivos' },
  { value: 'Lenguaje inapropiado u ofensivo', label: 'Lenguaje ofensivo' },
  { value: 'Contenido falso o engañoso', label: 'Contenido falso' },
  { value: 'Spam o publicidad no solicitada', label: 'Spam' },
  { value: 'Acoso o amenazas', label: 'Acoso' },
  { value: 'Información personal expuesta', label: 'Info personal' },
  { value: 'Otro motivo', label: 'Otro' },
];

// Deduplica los motivos de los reportes de una reseña
function uniqueReasons(reports = []) {
  return [...new Set(reports.map((r) => r.reason).filter(Boolean))];
}

// ── Modal de resolución ───────────────────────────────────────────────────────
function ResolveModal({ review, onClose, onResolved }) {
  const toast = useToastContext();
  const [action, setAction]   = useState('');
  const [notes, setNotes]     = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = uniqueReasons(review.reports);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!action) return;
    setLoading(true);
    try {
      await resolveReport(review.id_review, action, notes);
      toast.success(action === 'Delete' ? 'Reseña eliminada' : 'Reseña restaurada');
      onResolved();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al resolver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card-bg rounded-2xl shadow-warm w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-edge shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <h2 className="text-base font-semibold text-heading">Resolver reporte</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-body hover:bg-app-bg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">

          {/* Motivos del reporte */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Motivo{reasons.length !== 1 ? 's' : ''} del reporte
            </p>
            <div className="flex flex-wrap gap-2">
              {reasons.length > 0 ? reasons.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium"
                >
                  <Flag className="w-3 h-3" />{r}
                </span>
              )) : (
                <span className="text-xs text-muted">Sin motivo especificado</span>
              )}
            </div>
            {review.reports?.length > reasons.length && (
              <p className="text-[11px] text-muted mt-1.5">
                {review.reports.length} reporte{review.reports.length !== 1 ? 's' : ''} en total
              </p>
            )}
          </div>

          {/* Negocio afectado */}
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-muted shrink-0" />
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wide">Negocio afectado</p>
              <p className="text-sm font-semibold text-heading">
                {review.business?.businessName ?? '—'}
              </p>
            </div>
          </div>

          {/* Autor de la reseña */}
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-muted shrink-0" />
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wide">Autor de la reseña</p>
              <p className="text-sm text-body">{review.user?.email ?? '—'}</p>
            </div>
          </div>

          {/* Comentario de la reseña */}
          <div className="bg-app-bg rounded-xl p-4 border border-edge">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-muted" />
              <p className="text-xs text-muted font-medium">Comentario de la reseña</p>
              {review.rating != null && (
                <span className="ml-auto text-xs text-muted">★ {review.rating}/5</span>
              )}
            </div>
            <p className="text-sm text-body leading-relaxed">
              "{review.comment || 'Sin comentario'}"
            </p>
          </div>

          {/* Acción */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm font-medium text-body mb-2">Acción a tomar</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAction('Delete')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                    action === 'Delete'
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-edge text-muted hover:border-red-300 hover:bg-red-50/50 hover:text-red-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />Eliminar reseña
                </button>
                <button
                  type="button"
                  onClick={() => setAction('Restore')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                    action === 'Restore'
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-edge text-muted hover:border-green-300 hover:bg-green-50/50 hover:text-green-600'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />Restaurar reseña
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-body">Notas del admin (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Justificación de la decisión..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-edge text-sm text-body placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!action || loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary-dark text-sm font-medium text-on-dark-active hover:bg-primary-darkest transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <CheckCircle className="w-4 h-4" />Resolver
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AdminReviewsReports() {
  const toast = useToastContext();
  const [items, setItems]           = useState([]);
  const [meta, setMeta]             = useState({ total: 0, totalGlobal: 0, page: 1, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [page, setPage]             = useState(1);
  const [resolveModal, setResolveModal] = useState(null);

  const fetchAll = useCallback(async (p = 1, reason = reasonFilter) => {
    try {
      setLoading(true);
      const data = await getReportedReviews({ page: p, limit: 15, reason: reason || undefined });
      setItems(Array.isArray(data?.data) ? data.data : []);
      if (data?.meta) setMeta(data.meta);
    } catch {
      toast.error('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  }, [reasonFilter, toast]);

  useEffect(() => {
    setPage(1);
    fetchAll(1, reasonFilter);
  }, [reasonFilter]);

  const handlePageChange = (p) => {
    setPage(p);
    fetchAll(p, reasonFilter);
  };

  // Búsqueda cliente sobre la página actual (campos reales del backend)
  const filtered = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.comment?.toLowerCase().includes(q) ||
      item.user?.email?.toLowerCase().includes(q) ||
      item.business?.businessName?.toLowerCase().includes(q) ||
      item.reports?.some((r) => r.reason?.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb + título */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Administrador</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-body font-medium">Reportes de Reseñas</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Flag className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-serif text-heading">Reportes de Reseñas</h1>
            <p className="text-sm text-muted mt-0.5">Modera las reseñas reportadas por la comunidad</p>
          </div>
        </div>
      </div>

      {/* Contadores por reseñas afectadas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-xl px-5 py-4 border border-red-100">
          <p className="text-xs text-red-700 font-medium">En cola</p>
          <p className="text-2xl font-bold mt-1 text-red-800">{meta.total}</p>
          <p className="text-[11px] text-red-500 mt-0.5">
            {reasonFilter
              ? `Reseñas con motivo "${REASON_OPTIONS.find(o => o.value === reasonFilter)?.label ?? reasonFilter}"`
              : 'Reseñas con al menos un reporte'}
          </p>
        </div>
        <div className="bg-card-bg rounded-xl px-5 py-4 border border-edge">
          <p className="text-xs text-muted font-medium">Total global</p>
          <p className="text-2xl font-bold mt-1 text-heading">{meta.totalGlobal}</p>
          <p className="text-[11px] text-muted mt-0.5">Total de reseñas reportadas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar por reseña, autor, negocio o motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-edge text-sm text-body placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg"
          />
        </div>
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-edge text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg"
        >
          {REASON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-card-bg rounded-2xl border border-edge overflow-hidden shadow-warm-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
            <Flag className="w-10 h-10 opacity-30" />
            <p className="text-sm">No hay reportes con estos filtros</p>
          </div>
        ) : (
          <div className="divide-y divide-edge/40">
            {filtered.map((item) => {
              const reasons = uniqueReasons(item.reports);
              return (
                <div key={item.id_review} className="p-5 hover:bg-app-bg/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">

                      {/* Fila superior: ID + badge oculta + motivos */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted font-mono font-medium">
                          Reseña #{item.id_review}
                        </span>
                        {item.is_hidden_by_moderation && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700">
                            <AlertTriangle className="w-3 h-3" />Oculta por moderación
                          </span>
                        )}
                        {reasons.map((r) => (
                          <span
                            key={r}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700"
                          >
                            <Flag className="w-2.5 h-2.5" />{r}
                          </span>
                        ))}
                      </div>

                      {/* Negocio + Autor + Nº reportes — anchos fijos para alineación consistente */}
                      <div className="flex items-center gap-x-5">
                        <div className="flex items-center gap-1.5 w-40 min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span className="text-xs text-muted shrink-0">Negocio:</span>
                          <span className="text-xs text-body font-medium truncate">
                            {item.business?.businessName ?? '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 w-52 min-w-0">
                          <User className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span className="text-xs text-muted shrink-0">Autor:</span>
                          <span className="text-xs text-body truncate">{item.user?.email ?? '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Flag className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span className="text-xs text-muted">Reportes:</span>
                          <span className="text-xs font-semibold text-red-600">
                            {item.report_count}
                          </span>
                        </div>
                      </div>

                      {/* Preview del comentario */}
                      {item.comment && (
                        <div className="bg-app-bg rounded-xl p-3 border border-edge">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MessageSquare className="w-3.5 h-3.5 text-muted" />
                            <span className="text-xs text-muted">Reseña</span>
                            {item.rating != null && (
                              <span className="text-xs text-muted ml-auto">★ {item.rating}/5</span>
                            )}
                          </div>
                          <p className="text-sm text-body line-clamp-2">"{item.comment}"</p>
                        </div>
                      )}
                    </div>

                    {/* Botón resolver */}
                    <div className="shrink-0">
                      <button
                        onClick={() => setResolveModal(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-softest text-primary-dark text-xs font-medium hover:bg-primary-mid/20 transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />Resolver
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginador */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-edge">
            <span className="text-xs text-muted">
              <span className="font-semibold text-body">{meta.total}</span> reseña{meta.total !== 1 ? 's' : ''} reportada{meta.total !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted px-1">
                Página <span className="font-semibold text-body">{meta.page}</span> de{' '}
                <span className="font-semibold text-body">{meta.totalPages}</span>
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= meta.totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Página siguiente"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {resolveModal && (
        <ResolveModal
          review={resolveModal}
          onClose={() => setResolveModal(null)}
          onResolved={() => { setResolveModal(null); fetchAll(page, reasonFilter); }}
        />
      )}
    </div>
  );
}
