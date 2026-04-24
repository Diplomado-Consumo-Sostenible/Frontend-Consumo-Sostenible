import Sidebar from '../Components/Sidebar/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
