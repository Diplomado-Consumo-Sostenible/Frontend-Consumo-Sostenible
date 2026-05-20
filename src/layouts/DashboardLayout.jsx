import Navbar from '../Components/dashboard/Navbar';
import Sidebar from '../Components/Sidebar/Sidebar';
import WeeklySummaryModal from '../Components/business/stats/WeeklySummaryModal';
import { useNotificationsContext } from '../context/NotificationsContext';

export default function DashboardLayout({ children }) {
  const notifications     = useNotificationsContext();
  const weeklySummary     = notifications?.weeklySummary     ?? null;
  const dismissWeeklySummary = notifications?.dismissWeeklySummary ?? null;

  return (
    <div className="flex min-h-screen bg-app-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto min-w-0">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>

      {weeklySummary && dismissWeeklySummary && (
        <WeeklySummaryModal summary={weeklySummary} onClose={dismissWeeklySummary} />
      )}
    </div>
  );
}
