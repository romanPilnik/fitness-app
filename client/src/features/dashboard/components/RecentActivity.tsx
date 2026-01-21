import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Trophy, Flame } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'workout',
    icon: CheckCircle2,
    title: 'Push Day - Upper Body',
    description: 'Completed 45 min workout',
    time: '2 hours ago',
    color: 'primary',
  },
  {
    id: 2,
    type: 'pr',
    icon: Trophy,
    title: 'New Personal Record!',
    description: 'Bench Press: 185 lbs x 5 reps',
    time: 'Yesterday',
    color: 'chart-2',
  },
  {
    id: 3,
    type: 'streak',
    icon: Flame,
    title: '10 Day Streak!',
    description: 'Keep up the great work',
    time: '2 days ago',
    color: 'destructive',
  },
  {
    id: 4,
    type: 'workout',
    icon: CheckCircle2,
    title: 'Cardio Session',
    description: 'Completed 30 min HIIT',
    time: '3 days ago',
    color: 'primary',
  },
  {
    id: 5,
    type: 'pr',
    icon: Trophy,
    title: 'New Personal Record!',
    description: 'Squat: 225 lbs x 8 reps',
    time: '4 days ago',
    color: 'chart-2',
  },
  {
    id: 6,
    type: 'workout',
    icon: CheckCircle2,
    title: 'Leg Day',
    description: 'Completed 50 min workout',
    time: '5 days ago',
    color: 'primary',
  },
];

export function RecentActivity() {
  return (
    <Card className="border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-${activity.color}/10 shrink-0`}
                >
                  <Icon className={`h-5 w-5 text-${activity.color}`} />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-tight">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-border space-y-2">
          <p className="text-sm font-semibold text-foreground">Quick Actions</p>
          <div className="flex flex-col gap-2">
            <button className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors text-left">
              Log Manual Workout
            </button>
            <button className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors text-left">
              View All History
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
