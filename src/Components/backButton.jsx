import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ 
    onBack,
    fallback = "/", 
    label = "Volver" 
}) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack){
            onBack(); 
        } else if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(fallback);
        }
    };

    return (
        <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-emerald-600 transition-colors"
        >
        <ArrowLeft className="w-4 h-4" />
        {label}
        </button>
    );
}