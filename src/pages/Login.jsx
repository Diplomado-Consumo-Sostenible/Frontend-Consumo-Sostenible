import LoginForm from "../Components/Auth/login/login_form";
import LoginHero from "../Components/Auth/login/login_hero";
import AuthLayout from "../layouts/AuthLayout";

export default function Login() {
  return (
    <AuthLayout
      hero={<LoginHero />}
      form={<LoginForm />}
    />
  );
}
