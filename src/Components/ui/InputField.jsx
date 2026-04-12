export default function InputField({
  label,
  id,
  type = "text",
  placeholder,
  registration, 
  error,
  icon: Icon,   
  rightSlot,      
}) {
  const base =
    "w-full pl-10 pr-4 py-3 rounded-xl border text-stone-700 placeholder-stone-300 text-sm " +
    "focus:outline-none focus:ring-2 transition-all shadow-sm bg-white ";
  const stateClass = error
    ? "border-red-300 focus:ring-red-200 focus:border-red-400"
    : "border-stone-200 focus:ring-emerald-300 focus:border-emerald-400 hover:border-stone-300";

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-stone-600">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`${base}${stateClass}${rightSlot ? " pr-11" : ""}`}
          {...registration}
        />
        {rightSlot && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
          <span>⚠</span> {error.message}
        </p>
      )}
    </div>
  );
}
