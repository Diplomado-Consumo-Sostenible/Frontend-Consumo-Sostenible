import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const variants = {
  error: {
    wrapper: "bg-red-50 border-red-200 text-red-600",
    icon: <AlertCircle className="w-4 h-4 shrink-0" />,
  },
  success: {
    wrapper: "bg-emerald-50 border-emerald-200 text-emerald-700",
    icon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
  },
  info: {
    wrapper: "bg-teal-50 border-teal-200 text-teal-700",
    icon: <Info className="w-4 h-4 shrink-0" />,
  },
};

export default function AuthAlert({ message, variant = "error" }) {
  if (!message) return null;
  const { wrapper, icon } = variants[variant] ?? variants.error;

  return (
    <div className={`flex items-center gap-3 border text-sm px-4 py-3 rounded-xl ${wrapper}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
}
