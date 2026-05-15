import { Heart } from 'lucide-react';

/**
 * Floating action button that appears when the user has at least one favourite.
 * Slides in from the bottom-right with a spring-like scale animation.
 */
export default function FavoritesFAB({ count = 0, onOpen }) {
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Ver mis ${count} negocio${count !== 1 ? 's' : ''} favorito${count !== 1 ? 's' : ''}`}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full bg-terracotta text-white shadow-xl hover:opacity-90 active:scale-95 transition-all duration-200"
    >
      <Heart className="w-5 h-5 fill-white" />
      <span className="text-sm font-semibold">{count}</span>
    </button>
  );
}
