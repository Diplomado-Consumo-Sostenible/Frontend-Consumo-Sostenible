import { useNavigate } from 'react-router-dom';
import RegisterForm from '../Components/Auth/register/register_form';
import RegisterHero from '../Components/Auth/register/register_hero';
import AuthLayout from '../layouts/AuthLayout';
import { registerModel } from '../models/auth/register.model';
import { login, registerUser } from '../services/auth/auth.service';
import { saveSession, saveToken } from '../utils/storage';

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = async (data) => {
    const formatted = registerModel(data);
    await registerUser(formatted);

    const response = await login({
      email: data.email,
      password: data.password,
    });

    saveToken(response.access_token);
    saveSession(response.user);
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      hero={<RegisterHero />}
      form={<RegisterForm onNext={handleRegister} />}
    />
  );
}
