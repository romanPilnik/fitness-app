import { Card, CardContent } from "@/components/ui/card";
import { Target, Calendar, Flame } from "lucide-react";

const stats = [
  {
    label: "Active Programs",
    value: "3",
    icon: Target,
    description: "In progress",
    trend: "+1 this month"
  },
  {
    label: "Workouts This Week",
    value: "4",
    icon: Calendar,
    description: "Out of 5 planned",
    trend: "80% complete"
  },
  {
    label: "Current Streak",
    value: "12",
    icon: Flame,
    description: "Days",
    trend: "Personal best!"
  }
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-border shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <span className="text-sm text-muted-foreground">{stat.description}</span>
                  </div>
                  <p className="text-xs font-medium text-primary">{stat.trend}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
