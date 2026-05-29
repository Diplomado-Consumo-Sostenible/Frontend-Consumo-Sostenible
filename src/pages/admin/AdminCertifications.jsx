import { useState, useEffect, useCallback } from 'react';
import ModalOverlay from '../../Components/ui/ModalOverlay';
import { Award, Download, FileText, Search, Trash2, X, AlertTriangle, Loader2, LayoutDashboard, ChevronRight, CheckCircle, XCircle, Clock, ExternalLink, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';

async function downloadFile(url, filename) {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename || 'documento.pdf';
  a.click();
  URL.revokeObjectURL(blobUrl);
}
import { getAdminCertifications, changeCertificationStatus, deleteCertificationAdmin } from '../../services/admin/admin-certifications.service';
import { useToastContext } from '../../context/ToastContext';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'Pending', label: 'Pendientes' },
  { value: 'Active', label: 'Aprobadas' },
  { value: 'Rejected', label: 'Rechazadas' },
];

function StatusBadge({ status }) {
  const map = {
    Active:   { label: 'Aprobada',  cls: 'bg-green-50 text-green-700',  icon: CheckCircle },
    Pending:  { label: 'Pendiente', cls: 'bg-yellow-50 text-yellow-700', icon: Clock },
    Rejected: { label: 'Rechazada', cls: 'bg-red-50 text-red-600',       icon: XCircle },
  };
  const cfg = map[status] || map.Pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>
      <Icon className="w-3.5 h-3.5" />{cfg.label}
    </span>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel, loading, confirmLabel = 'Confirmar', confirmClass = 'bg-primary-dark hover:bg-primary-darkest' }) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="relative bg-card-bg rounded-2xl shadow-warm w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-heading">{title}</h3>
            <p className="text-sm text-muted mt-1">{message}</p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors disabled:opacity-50">Cancelar</button>
            <button onClick={onConfirm} disabled={loading} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${confirmClass}`}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}{confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

export default function AdminCertifications() {
  const toast = useToastContext();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, totalGlobal: 0, totalPending: 0, totalApproved: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAll = useCallback(async (p = 1, status = statusFilter) => {
    try {
      setLoading(true);
      const data = await getAdminCertifications({ page: p, limit: 15, status: status || undefined });
      setItems(Array.isArray(data?.data) ? data.data : []);
      if (data?.meta) setMeta({
        total:         data.meta.totalItems   ?? data.meta.total        ?? 0,
        page:          data.meta.currentPage  ?? data.meta.page         ?? 1,
        totalPages:    data.meta.totalPages   ?? 1,
        totalGlobal:   data.meta.totalGlobal  ?? 0,
        totalPending:  data.meta.totalPending ?? 0,
        totalApproved: data.meta.totalApproved ?? 0,
      });
    } catch {
      toast.error('Error al cargar las certificaciones');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setPage(1);
    fetchAll(1, statusFilter);
  }, [statusFilter]);

  const handlePageChange = (p) => {
    setPage(p);
    fetchAll(p, statusFilter);
  };

  const handleStatusChange = async (cert, newStatus) => {
    setActionLoading(cert.id_certification);
    try {
      await changeCertificationStatus(cert.id_certification, newStatus);
      toast.success(`Certificación ${newStatus === 'Active' ? 'aprobada' : 'rechazada'}`);
      fetchAll(page, statusFilter);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al cambiar estado');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm?.cert) return;
    setActionLoading('delete');
    try {
      await deleteCertificationAdmin(confirm.cert.id_certification);
      toast.success('Certificación eliminada');
      setConfirm(null);
      fetchAll(page, statusFilter);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al eliminar');
      setConfirm(null);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = items.filter((i) =>
    !search || i.name?.toLowerCase().includes(search.toLowerCase()) || i.issuing_entity?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Administrador</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-body font-medium">Certificaciones</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-serif text-heading">Gestión de Certificaciones</h1>
            <p className="text-sm text-muted mt-0.5">Aprueba o rechaza solicitudes de certificación sostenible</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 rounded-xl px-5 py-4 border border-yellow-100">
          <p className="text-xs text-yellow-700 font-medium">Pendientes</p>
          <p className="text-2xl font-bold mt-1 text-yellow-800">{meta.totalPending}</p>
          <p className="text-[11px] text-yellow-600 mt-0.5">En todos los negocios</p>
        </div>
        <div className="bg-green-50 rounded-xl px-5 py-4 border border-green-100">
          <p className="text-xs text-green-700 font-medium">Total aprobadas</p>
          <p className="text-2xl font-bold mt-1 text-green-800">{meta.totalApproved}</p>
          <p className="text-[11px] text-green-600 mt-0.5">Certificaciones activas</p>
        </div>
        <div className="bg-card-bg rounded-xl px-5 py-4 border border-edge">
          <p className="text-xs text-muted font-medium">Total global</p>
          <p className="text-2xl font-bold mt-1 text-heading">{meta.totalGlobal}</p>
          <p className="text-[11px] text-muted mt-0.5">Todas las certificaciones</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Buscar por nombre o entidad..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-edge text-sm text-body placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg" />
        </div>
        <div className="flex gap-1 bg-card-bg border border-edge rounded-xl p-1">
          {STATUS_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === opt.value ? 'bg-primary-dark text-on-dark-active' : 'text-muted hover:text-body'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card-bg rounded-2xl border border-edge overflow-hidden shadow-warm-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Cargando...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
            <Award className="w-10 h-10 opacity-30" />
            <p className="text-sm">No hay certificaciones con estos filtros</p>
          </div>
        ) : (
          <div className="divide-y divide-edge/40">
            {filtered.map((cert) => (
              <div key={cert.id_certification} className="p-5 hover:bg-app-bg/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-heading">{cert.name}</span>
                        <StatusBadge status={cert.status} />
                      </div>
                      <p className="text-xs text-muted mt-0.5">Entidad: <span className="text-body">{cert.issuing_entity}</span></p>
                      {cert.business && (
                        <p className="text-xs text-muted mt-0.5">Negocio: <span className="text-body">{cert.business?.businessName || cert.business?.name || `#${cert.business?.id_business}`}</span></p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {cert.badge_url && (
                          <>
                            <a href={cert.badge_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-mid hover:text-primary-dark transition-colors">
                              <FileText className="w-3 h-3" />Ver documento
                            </a>
                            <button onClick={() => downloadFile(cert.badge_url, `${cert.name}.pdf`)} className="inline-flex items-center gap-1 text-xs text-primary-mid hover:text-primary-dark transition-colors">
                              <Download className="w-3 h-3" />Descargar
                            </button>
                          </>
                        )}
                        {cert.verification_url && (
                          <a href={cert.verification_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary-dark transition-colors">
                            <ExternalLink className="w-3 h-3" />Verificación
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {actionLoading === cert.id_certification ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted" />
                    ) : (
                      <>
                        {cert.status !== 'Active' && (
                          <button onClick={() => handleStatusChange(cert, 'Active')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" />Aprobar
                          </button>
                        )}
                        {cert.status !== 'Rejected' && (
                          <button onClick={() => handleStatusChange(cert, 'Rejected')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors">
                            <XCircle className="w-3.5 h-3.5" />Rechazar
                          </button>
                        )}
                        <button onClick={() => setConfirm({ cert })} className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && items.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-edge">
            <span className="text-xs text-muted">
              <span className="font-semibold text-body">{meta.total}</span> certificación{meta.total !== 1 ? 'es' : ''} {statusFilter ? `· filtro activo` : ''}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} aria-label="Página anterior" className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted px-1">
                Página <span className="font-semibold text-body">{meta.page}</span> de{' '}
                <span className="font-semibold text-body">{meta.totalPages}</span>
              </span>
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= meta.totalPages} aria-label="Página siguiente" className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          title="Eliminar certificación"
          message={`¿Eliminar "${confirm.cert.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          loading={actionLoading === 'delete'}
          confirmLabel="Eliminar"
          confirmClass="bg-red-500 hover:bg-red-600"
        />
      )}
    </div>
  );
}
