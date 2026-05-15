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
      className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2
        bg-primary-dark text-on-dark-active
        hover:bg-primary-darkest
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
