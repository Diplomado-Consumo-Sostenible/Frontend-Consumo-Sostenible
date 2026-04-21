import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../Components/Auth/register/register_form";
import RegisterHero from "../Components/Auth/register/register_hero";
import RoleStep from "../Components/Auth/register/rolStep";
import AuthLayout from "../layouts/AuthLayout";
import { registerModel } from "../models/auth/register.model";
import { login, registerUser } from "../services/auth/auth.service";
import { saveToken } from "../utils/storage";

export default function Register() {
  const [step, setStep] = useState(1);
  const [roleId, setRole] = useState(null); 
  const [formData, setFormData] = useState({});

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const navigate = useNavigate(); 

  const renderHero = () => {
  switch (step) {
    case 1:
      return <RegisterHero />;

    case 2:
      return <RegisterHero />;



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
                const formatted = registerModel(mergedData);
                await registerUser(formatted);

                const { access_token } = await login({
                  email: mergedData.email,
                  password: mergedData.password,
                });

                saveToken(access_token);

                navigate("/dashboard");
              } else {
                nextStep();
              }
            }}
          />
        );


      default:
        return null;
    }
  };

  return (
    <AuthLayout
      hero={renderHero()}
      form={renderStep()}
    />
  );
}