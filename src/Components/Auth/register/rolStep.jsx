import { Store, User } from "lucide-react";
import BackButton from "../../backButton";

export default function RoleStep({ onSelectRole}) {
    return (
        <div className="flex-1 bg-white/80 backdrop-blur-xl flex flex-col justify-center px-10 py-10">
        <BackButton />
            <div className="mb-8">
                <h1 className="text-stone-800 text-2xl font-semibold">
                ¿Cómo deseas registrarte?
                </h1>
                <p className="text-stone-400 text-sm mt-1">
                Elige el tipo de cuenta que quieres crear
                </p>
            </div>

            <div className="grid gap-6">

                <button
                    onClick={() => onSelectRole(2)}
                    className="group border border-stone-200 rounded-2xl p-5 flex items-center gap-4 
                    hover:border-emerald-400 hover:shadow-md transition-all bg-white"
                    >
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 
                    group-hover:bg-emerald-100 transition">
                        <User className="w-6 h-6 text-emerald-600" />
                    </div>

                    <div className="text-left">
                        <h2 className="text-stone-800 font-medium">Usuario</h2>
                        <p className="text-sm text-stone-400">
                        Explora y utiliza la plataforma
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => onSelectRole (3)}
                    className="group border border-stone-200 rounded-2xl p-5 flex items-center gap-4 
                    hover:border-emerald-400 hover:shadow-md transition-all bg-white"
                    >
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 
                    group-hover:bg-emerald-100 transition">
                        <Store className="w-6 h-6 text-emerald-600" />
                    </div>

                    <div className="text-left">
                        <h2 className="text-stone-800 font-medium">Negocio</h2>
                        <p className="text-sm text-stone-400">
                        Registra tu establecimiento
                        </p>
                    </div>
                </button>

            </div>
        </div>
    );
}