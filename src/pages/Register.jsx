import RegisterForm from "../Components/Auth/register_form";
import RegisterHero from "../Components/Auth/register_hero";
import AuthLayout from "../layouts/AuthLayout";

// Página de registro: solo ensambla el layout con sus partes.
// Toda la lógica vive en RegisterForm, toda la visual en RegisterHero.
export default function Register() {
  return (
    <AuthLayout
      hero={<RegisterHero />}
      form={<RegisterForm />}
    />
  );
}
