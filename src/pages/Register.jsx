import RegisterForm from "../Components/Auth/register/register_form";
import RegisterHero from "../Components/Auth/register/register_hero";
import AuthLayout from "../layouts/AuthLayout";

export default function Register() {
  return (
    <AuthLayout
      hero={<RegisterHero />}
      form={<RegisterForm />}
    />
  );
}
