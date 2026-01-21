import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Dumbbell } from "lucide-react";

const upcomingWorkouts = [
  {
    id: 1,
    name: "Upper Body Strength",
    type: "Strength Training",
    scheduledDate: "Today",
    scheduledTime: "5:30 PM",
    duration: "45 min",
    color: "primary"
  },
  {
    id: 2,
    name: "HIIT Cardio",
    type: "Cardio",
    scheduledDate: "Tomorrow",
    scheduledTime: "7:00 AM",
    duration: "30 min",
    color: "secondary"
  },
  {
    id: 3,
    name: "Lower Body Power",
    type: "Strength Training",
    scheduledDate: "Wed, Jan 22",
    scheduledTime: "6:00 PM",
    duration: "50 min",
    color: "primary"
  },
  {
    id: 4,
    name: "Yoga & Mobility",
    type: "Flexibility",
    scheduledDate: "Thu, Jan 23",
    scheduledTime: "8:00 AM",
    duration: "40 min",
    color: "accent"
  },
  {
    id: 5,
    name: "Full Body Circuit",
    type: "Strength Training",
    scheduledDate: "Fri, Jan 24",
    scheduledTime: "5:30 PM",
    duration: "55 min",
    color: "primary"
  }
];

export function UpcomingWorkouts() {
  return (
    <Card className="border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Upcoming Workouts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingWorkouts.map((workout) => (
          <div
            key={workout.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${workout.color}/10`}>
                <Dumbbell className={`h-6 w-6 text-${workout.color}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{workout.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {workout.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium">{workout.scheduledDate}</span>
                  <span>•</span>
                  <span>{workout.scheduledTime}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{workout.duration}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="text-sm font-medium text-primary hover:underline">
              Start
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
