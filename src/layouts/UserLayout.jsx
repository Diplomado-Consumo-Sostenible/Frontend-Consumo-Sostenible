import LandingFooter from '../Components/landing/LandingFooter';
import LandingNavbar from '../Components/landing/LandingNavbar';

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-app-bg">
      <LandingNavbar />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
