import Navbar from '../Components/dashboard/Navbar';
import Sidebar from '../Components/Sidebar/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-app-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto min-w-0">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
