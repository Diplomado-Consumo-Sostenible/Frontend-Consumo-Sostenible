import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FavoritesFAB({ count = 0 }) {
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={() => navigate('/favoritos')}
      aria-label={`Ver mis ${count} negocio${count !== 1 ? 's' : ''} favorito${count !== 1 ? 's' : ''}`}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full bg-terracotta text-white shadow-xl hover:opacity-90 active:scale-95 transition-all duration-200"
    >
      <Heart className="w-5 h-5 fill-white" />
      <span className="text-sm font-semibold">{count}</span>
    </button>
  );
}
