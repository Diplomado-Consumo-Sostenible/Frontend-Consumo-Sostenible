import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BusinessForm from '../../Components/Auth/register/businessFormStep';
import { useToastContext } from '../../context/ToastContext';
import { registerBusinessModel } from '../../models/business/business.model';
import { postBusiness } from '../../services/business/busienss.service';

export default function CreateBusiness() {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const [loading, setLoading] = useState(false);

  async function handleNext(data) {
    setLoading(true);
    try {
      await postBusiness(registerBusinessModel(data));
      success('¡Negocio registrado! Está pendiente de aprobación.');
      navigate('/dashboardBusiness');
    } catch (err) {
      error(err?.message || 'No se pudo registrar el negocio. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto py-8 relative [&_form]:max-w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      )}
      <BusinessForm onNext={handleNext} onBack={() => navigate('/dashboardBusiness')} />
    </div>
  );
}
