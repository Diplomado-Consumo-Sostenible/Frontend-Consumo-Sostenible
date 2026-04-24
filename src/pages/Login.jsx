import { useNavigate } from 'react-router-dom';
import LoginForm from '../Components/Auth/login/login_form';
import LoginHero from '../Components/Auth/login/login_hero';
import AuthLayout from '../layouts/AuthLayout';
import { login } from '../services/auth/auth.service';
import { loginModel } from '../models/auth/login.model';
import { decodeToken } from '../utils/jwt.utils';
import { saveToken } from '../utils/storage';

const redirectByRole = (rol, navigate) => {
  switch (rol?.toLowerCase()) {
    case 'admin':
      return navigate('/adminDashboard');
    case 'owner':
      return navigate('/dashboardBusiness');
    case 'user':
    default:
      return navigate('/dashboard');
  }
};

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    const credentials = loginModel(data);
    const response = await login(credentials);
    const token = response.access_token;
    saveToken(token);
    const payload = decodeToken(token);
    redirectByRole(payload?.rol, navigate);
  };

  return <AuthLayout hero={<LoginHero />} form={<LoginForm onLogin={handleLogin} />} />;
}
