import { useState, useEffect, useCallback } from 'react';
import { Flag, Search, Loader2, LayoutDashboard, ChevronRight, CheckCircle, Trash2, RotateCcw, AlertTriangle, ChevronLeft, ChevronRight as ChevronRightIcon, MessageSquare } from 'lucide-react';
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

const STATUS_COLORS = {
  Pendiente: 'bg-yellow-50 text-yellow-700',
  Resuelto: 'bg-green-50 text-green-700',
  Descartado: 'bg-gray-100 text-gray-600',
};

function ResolveModal({ report, onClose, onResolved }) {
  const toast = useToastContext();
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!action) return;
    setLoading(true);
    try {
      await resolveReport(report.review?.id_review || report.id_report, action, notes);
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
      <div className="relative bg-card-bg rounded-2xl shadow-warm w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
          <h2 className="text-base font-semibold text-heading">Resolver reporte</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-body hover:bg-app-bg transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {report.review?.content && (
            <div className="bg-app-bg rounded-xl p-4 border border-edge">
              <p className="text-xs text-muted font-medium mb-1">Reseña reportada</p>
              <p className="text-sm text-body line-clamp-3">"{report.review.content}"</p>
              {report.review?.rating && (
                <p className="text-xs text-muted mt-1">Calificación: {report.review.rating}/5</p>
              )}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-body mb-2">Motivo del reporte</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm">
              <Flag className="w-3.5 h-3.5" />{report.reason}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm font-medium text-body mb-2">Acción a tomar</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setAction('Delete')} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${action === 'Delete' ? 'border-red-400 bg-red-50 text-red-700' : 'border-edge text-muted hover:border-red-300 hover:bg-red-50/50 hover:text-red-600'}`}>
                  <Trash2 className="w-4 h-4" />Eliminar reseña
                </button>
                <button type="button" onClick={() => setAction('Restore')} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${action === 'Restore' ? 'border-green-400 bg-green-50 text-green-700' : 'border-edge text-muted hover:border-green-300 hover:bg-green-50/50 hover:text-green-600'}`}>
                  <RotateCcw className="w-4 h-4" />Restaurar reseña
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-body">Notas del admin (opcional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Justificación de la decisión..." rows={2} className="w-full px-3.5 py-2.5 rounded-xl border border-edge text-sm text-body placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg resize-none" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors">Cancelar</button>
              <button type="submit" disabled={!action || loading} className="flex-1 px-4 py-2.5 rounded-xl bg-primary-dark text-sm font-medium text-on-dark-active hover:bg-primary-darkest transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
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

export default function AdminReviewsReports() {
  const toast = useToastContext();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [page, setPage] = useState(1);
  const [resolveModal, setResolveModal] = useState(null);

  const fetchAll = useCallback(async (p = 1, reason = reasonFilter) => {
    try {
      setLoading(true);
      const data = await getReportedReviews({ page: p, limit: 15, reason: reason || undefined });
      setItems(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
      if (data?.meta) setMeta(data.meta);
    } catch {
      toast.error('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  }, [reasonFilter]);

  useEffect(() => {
    setPage(1);
    fetchAll(1, reasonFilter);
  }, [reasonFilter]);

  const handlePageChange = (p) => {
    setPage(p);
    fetchAll(p, reasonFilter);
  };

  const filtered = items.filter((i) =>
    !search ||
    i.reason?.toLowerCase().includes(search.toLowerCase()) ||
    i.review?.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-xl px-5 py-4 border border-red-100">
          <p className="text-xs text-red-700 font-medium">En cola</p>
          <p className="text-2xl font-bold mt-1 text-red-800">{items.length}</p>
        </div>
        <div className="bg-card-bg rounded-xl px-5 py-4 border border-edge">
          <p className="text-xs text-muted font-medium">Total global</p>
          <p className="text-2xl font-bold mt-1 text-heading">{meta.total || items.length}</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Buscar en reportes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-edge text-sm text-body placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg" />
        </div>
        <select value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-edge text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg">
          {REASON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-card-bg rounded-2xl border border-edge overflow-hidden shadow-warm-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Cargando...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
            <Flag className="w-10 h-10 opacity-30" />
            <p className="text-sm">No hay reportes con estos filtros</p>
          </div>
        ) : (
          <div className="divide-y divide-edge/40">
            {filtered.map((report) => (
              <div key={report.id_report} className="p-5 hover:bg-app-bg/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        <Flag className="w-3 h-3" />{report.reason}
                      </span>
                      {report.status && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-600'}`}>
                          {report.status}
                        </span>
                      )}
                      <span className="text-xs text-muted font-mono">Reporte #{report.id_report}</span>
                    </div>

                    {report.review?.content && (
                      <div className="bg-app-bg rounded-xl p-3 border border-edge mb-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MessageSquare className="w-3.5 h-3.5 text-muted" />
                          <span className="text-xs text-muted">Reseña reportada</span>
                          {report.review?.rating && (
                            <span className="text-xs text-muted ml-auto">★ {report.review.rating}/5</span>
                          )}
                        </div>
                        <p className="text-sm text-body line-clamp-2">"{report.review.content}"</p>
                      </div>
                    )}

                    {report.details && (
                      <p className="text-xs text-muted">Detalle: {report.details}</p>
                    )}
                    {report.user && (
                      <p className="text-xs text-muted mt-0.5">Reportado por: <span className="text-body">{report.user?.perfil?.nombre || report.user?.email || `Usuario #${report.user?.id_usuario}`}</span></p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {report.status === 'Pendiente' || !report.status ? (
                      <button onClick={() => setResolveModal(report)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-softest text-primary-dark text-xs font-medium hover:bg-primary-mid/20 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" />Resolver
                      </button>
                    ) : (
                      <span className="text-xs text-muted">Resuelto</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-edge">
            <span className="text-xs text-muted">Página {meta.page} de {meta.totalPages} · {meta.total} total</span>
            <div className="flex items-center gap-1">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg text-muted hover:text-body hover:bg-app-bg transition-colors disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= meta.totalPages} className="p-1.5 rounded-lg text-muted hover:text-body hover:bg-app-bg transition-colors disabled:opacity-40">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {resolveModal && (
        <ResolveModal
          report={resolveModal}
          onClose={() => setResolveModal(null)}
          onResolved={() => { setResolveModal(null); fetchAll(page, reasonFilter); }}
        />
      )}
    </div>
  );
}
