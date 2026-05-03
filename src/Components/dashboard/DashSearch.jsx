import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTiposNegocio } from '../../services/types/tiposNegocio.service';

function buildUrl(q, category) {
  const params = new URLSearchParams();
  if (q)        params.set('q',        q);
  if (category) params.set('category', category);
  const qs = params.toString();
  return qs ? `/dashboard/explorar?${qs}` : '/dashboard/explorar';
}

export default function DashSearch() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query,          setQuery]          = useState('');
  const [activeChip,     setActiveChip]     = useState('all');
  const [activeCategory, setActiveCategory] = useState('');
  const [categories,     setCategories]     = useState([]);
  const [loadingCats,    setLoadingCats]    = useState(true);

  useEffect(() => {
    getTiposNegocio()
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    navigate(buildUrl(query.trim(), activeCategory));
  }

  function handleChipClick(chip) {
    const categoryName = chip.id === 'all' ? '' : chip.label;
    setActiveChip(chip.id);
    setActiveCategory(categoryName);
    navigate(buildUrl(query.trim(), categoryName));
  }

  function handleFiltros() {
    navigate(buildUrl(query.trim(), activeCategory));
  }

  const chips = [
    { id: 'all', label: 'Todos', Icon: null },
    ...categories.map((c) => ({ id: `cat-${c.id_category}`, label: c.category, Icon: null })),
  ];

  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-heading">¿Qué negocio sostenible buscas hoy?</h3>
        <p className="text-xs text-muted mt-0.5">Descubre negocios que cuidan el planeta</p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Restaurante, tienda orgánica…"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-app-bg border border-edge rounded-xl text-body placeholder:text-muted focus:outline-none focus:border-primary-mid focus:ring-1 focus:ring-primary-mid/30 transition-all"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors shrink-0"
          style={{ background: '#2E6B47' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1a3d2b')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#2E6B47')}
        >
          <ArrowRight className="w-4 h-4" />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </form>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {loadingCats && (
          <>
            {[80, 100, 72, 90, 84].map((w, i) => (
              <div key={i} className="shrink-0 h-7 rounded-full bg-edge animate-pulse" style={{ width: w }} />
            ))}
          </>
        )}
        {!loadingCats && chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => handleChipClick(chip)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              activeChip === chip.id
                ? 'border-primary-dark bg-primary-softest text-primary-dark'
                : 'border-edge text-body hover:border-primary-mid hover:text-primary-dark'
            }`}
          >
            {chip.Icon && <chip.Icon className="w-3.5 h-3.5 shrink-0" />}
            {chip.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleFiltros}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-edge text-xs font-medium text-muted hover:border-primary-mid hover:text-primary-dark transition-all shrink-0"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
        </button>
      </div>
    </div>
  );
}
