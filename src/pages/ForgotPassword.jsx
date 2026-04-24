import ForgotPasswordForm from '../Components/Auth/forgot_password/forgot_password_form';
import ForgotPasswordHero from '../Components/Auth/forgot_password/forgot_password_hero';
import AuthLayout from '../layouts/AuthLayout';

export default function ForgotPassword() {
  return <AuthLayout hero={<ForgotPasswordHero />} form={<ForgotPasswordForm />} />;
}
