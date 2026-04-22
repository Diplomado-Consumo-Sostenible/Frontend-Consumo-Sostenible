import { Loader2 } from "lucide-react";

export default function Button({
    children,
    loading = false,
    icon: Icon,
    type = "button",
    className = "",
    ...props
}) {
    return (
        <button
        type={type}
        disabled={loading}
        className={`w-sm py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 
        bg-gradient-to-r from-emerald-500 to-teal-500 text-white 
        hover:from-emerald-600 hover:to-teal-600 
        transition-all duration-200 active:scale-[0.98]
        ${loading ? "opacity-70 cursor-not-allowed" : ""}
        ${className}`}
        {...props}
        >
        {loading ? (
            <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando...</span>
            </>
        ) : (
            <>
            {children}
            {Icon && <Icon className="w-5 h-5" />}
            </>
        )}
        </button>
    );
}