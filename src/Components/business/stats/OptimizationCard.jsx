import { CalendarDays, Lightbulb } from 'lucide-react';

export default function OptimizationCard() {
  return (
    <div className="bg-primary-dark rounded-2xl p-5 text-on-dark-active">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="w-4 h-4 text-on-dark" />
        <h3 className="text-sm font-semibold">Optimización de Perfil</h3>
      </div>
      <p className="text-xs text-on-dark mb-4">
        Mejora tus métricas con estas recomendaciones
      </p>

      <div className="bg-primary-darkest rounded-xl p-3 mb-4 flex gap-2.5">
        <CalendarDays className="w-4 h-4 shrink-0 mt-0.5 text-on-dark" />
        <div>
          <p className="text-sm font-medium text-on-dark-active">Publicar Contenido Nuevo</p>
          <p className="text-xs text-on-dark mt-0.5">
            Los negocios que publican 3 veces por semana aumentan sus visitas un 20%.
          </p>
        </div>
      </div>

      <button  className="w-full bg-card-bg text-primary-dark font-semibold text-sm py-2.5 rounded-xl hover:bg-primary-softest transition-colors cursor-pointer">
        Ir a galeria de imagenes 
      </button>
    </div>
  );
}
