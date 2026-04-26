import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BusinessFormHero from '../Components/Auth/register/businessFormHero';
import BusinessFormStep from '../Components/Auth/register/businessFormStep';
import RegisterForm from '../Components/Auth/register/register_form';
import RegisterHero from '../Components/Auth/register/register_hero';
import RoleStep from '../Components/Auth/register/rolStep';
import AuthLayout from '../layouts/AuthLayout';
import { registerModel } from '../models/auth/register.model';
import { registerBusinessModel } from '../models/business/business.model';
import { login, registerUser } from '../services/auth/auth.service';
import { postBusiness } from '../services/business/business.service';
import { saveToken } from '../utils/storage';
import { useToastContext } from '../context/ToastContext';

export default function Register() {
  const [step, setStep] = useState(1);
  const [roleId, setRole] = useState(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const toast = useToastContext();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const renderHero = () => {
    switch (step) {
      case 3:
        return <BusinessFormHero />;
      default:
        return <RegisterHero />;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <RoleStep
            onSelectRole={(selectedRole) => {
              setRole(selectedRole);
              setStep(2);
            }}
          />
        );

      case 2:
        return (
          <RegisterForm
            role={roleId}
            onBack={prevStep}
            defaultValues={formData}
            onNext={async (data) => {
              const mergedData = { ...formData, ...data, roleId };
              setFormData(mergedData);

              if (roleId === 2) {
                try {
                  const res = await registerUser(registerModel(mergedData));
                  const { access_token } = await login({
                    email: mergedData.email,
                    password: mergedData.password,
                  });
                  saveToken(access_token);
                  toast.success(res?.message || '¡Cuenta creada exitosamente!');
                  navigate('/dashboard');
                } catch (err) {
                  toast.error(err?.message || 'Error al crear la cuenta');
                }
              } else {
                nextStep();
              }
            }}
          />
        );

      case 3:
        return (
          <BusinessFormStep
            onBack={prevStep}
            onNext={async (businessData) => {
              const mergedData = { ...formData, ...businessData, roleId };
              setFormData(mergedData);
              try {
                const res = await registerUser(registerModel(mergedData));
                const { access_token } = await login({
                  email: mergedData.email,
                  password: mergedData.password,
                });
                saveToken(access_token);
                await postBusiness(registerBusinessModel(mergedData));
                toast.success(res?.message || '¡Negocio registrado exitosamente!');
                navigate('/dashboardBusiness');
              } catch (err) {
                toast.error(err?.message || 'Error al registrar el negocio');
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  return <AuthLayout hero={renderHero()} form={renderStep()} />;
}
