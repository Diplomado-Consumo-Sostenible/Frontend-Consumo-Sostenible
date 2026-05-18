import { useNavigate } from 'react-router-dom';
import BusinessFormHero from '../Components/Auth/register/businessFormHero';
import BusinessFormStep from '../Components/Auth/register/businessFormStep';
import AuthLayout from '../layouts/AuthLayout';
import { useToastContext } from '../context/ToastContext';
import { registerBusinessModel } from '../models/business/business.model';
import { postBusiness } from '../services/business/busienss.service';

export default function RegisterBusiness() {
  const navigate = useNavigate();
  const toast = useToastContext();

  const handleNext = async (data) => {
    try {
      await postBusiness(registerBusinessModel(data));
      toast.success('¡Negocio registrado! Está pendiente de aprobación.');
      navigate('/dashboardBusiness/perfil', { replace: true });
    } catch (err) {
      toast.error(err?.message || 'No se pudo registrar el negocio. Inténtalo de nuevo.');
    }
  };

  return (
    <AuthLayout
      hero={<BusinessFormHero />}
      form={
        <BusinessFormStep
          onNext={handleNext}
          onBack={() => navigate('/', { replace: true })}
        />
      }
    />
  );
}
