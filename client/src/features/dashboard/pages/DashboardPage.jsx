import { StatsCards } from '../components/StatsCards';
import { UpcomingWorkouts } from '../components/UpcomingWorkouts';
import { RecentActivity } from '../components/RecentActivity';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your fitness overview.</p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingWorkouts />
        <RecentActivity />
      </div>
    </div>
  );
}
