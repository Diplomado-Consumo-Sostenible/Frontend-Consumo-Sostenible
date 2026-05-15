import { ChevronDown, Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getTiposNegocio } from '../../services/types/tiposNegocio.service';
import { getTags } from '../../services/types/tags.service';

const SORT_OPTIONS = [
  { value: 'relevant', label: 'Más relevantes' },
  { value: 'rated',    label: 'Mejor calificados' },
  { value: 'nearby',   label: 'Más cercanos' },
  { value: 'reviews',  label: 'Más reseñados' },
];

function normaliseTag(t) {
  return { id: t.id_tags ?? t.id_tag ?? t.id, label: t.name ?? t.tag ?? t.tagName ?? String(t.id_tags ?? t.id) };
}
function normaliseCategory(c) {
  return { id: c.id_category ?? c.id, label: c.category ?? c.name ?? String(c.id_category ?? c.id) };
}

export default function LandingFilterBar({
  activeCategoryId,
  activeTagIds,      // Set<number>
  sortOrder,
  searchText,
  onCategoryChange,
  onTagToggle,       // (id: number) => void — parent toggles the Set
  onSortChange,
  onSearchClear,     // clears searchText in parent
  onClear,
}) {
  const [categories, setCategories] = useState([]);
  const [tags, setTags]             = useState([]);

  const loadFilters = useCallback(async () => {
    try {
      const [rawCats, rawTags] = await Promise.all([getTiposNegocio(), getTags()]);
      setCategories((Array.isArray(rawCats) ? rawCats : []).map(normaliseCategory));
      setTags((Array.isArray(rawTags) ? rawTags : []).map(normaliseTag));
    } catch { /* graceful */ }
  }, []);

  useEffect(() => { loadFilters(); }, [loadFilters]);

  const hasFilters = Boolean(activeCategoryId || activeTagIds.size > 0 || searchText?.trim());

  return (
    <div className="sticky top-16 z-30 bg-app-bg/85 backdrop-blur-md border-b border-edge/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">

          {/* ── Category chips ── */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onCategoryChange(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                !activeCategoryId
                  ? 'bg-primary-dark text-on-dark-active'
                  : 'bg-card-bg text-body border border-edge hover:border-primary-mid hover:text-primary-dark'
              }`}
            >
              Todos
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id === activeCategoryId ? null : cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategoryId === cat.id
                    ? 'bg-primary-dark text-on-dark-active'
                    : 'bg-card-bg text-body border border-edge hover:border-primary-mid hover:text-primary-dark'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          {tags.length > 0 && <div className="w-px h-5 bg-edge self-center" />}

          {/* ── Tag chips (multi-select, terracotta active) ── */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => {
                const active = activeTagIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onTagToggle(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-terracotta text-white'
                        : 'bg-card-bg text-body border border-edge hover:border-terracotta hover:text-terracotta'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active search chip */}
          {searchText?.trim() && (
            <button
              type="button"
              onClick={onSearchClear}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-primary-softest text-primary-dark border border-primary-light/40 hover:border-primary-mid transition-colors whitespace-nowrap"
            >
              <Search className="w-3 h-3" />
              {searchText.trim().length > 20 ? `${searchText.trim().slice(0, 20)}…` : searchText.trim()}
              <X className="w-3 h-3 ml-0.5" />
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1 min-w-4" />

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2 shrink-0">
            {hasFilters && (
              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-muted hover:text-body border border-edge hover:border-primary-mid transition-colors whitespace-nowrap"
              >
                <X className="w-3 h-3" />
                Limpiar
              </button>
            )}

            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-medium bg-card-bg text-body border border-edge hover:border-primary-mid focus:outline-none focus:border-primary-mid transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
