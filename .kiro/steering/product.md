# Product Overview

A workout tracking app that automatically generates your next training session based on your performance.

**Core Feature**: Users log workouts with RIR (Reps in Reserve - how many more reps you could've done), and the app uses progression algorithms to determine what weights, reps, and volume to use in the next session.

**How Progression Works**:

- Track performance per exercise (weight, reps, sets, RIR, user feedback)
- Algorithm analyzes recent trends: hitting targets = progression, missing targets = maintain or reduce
- Applies periodization: follows programmed RIR progression by week (e.g., weeks 1-8 go from RIR 4 → 0)
- Auto-triggers deload weeks when fatigue accumulates or consecutive failures occur
- Adjusts individual exercise progressions based on movement pattern, equipment, and user history

**User Flow**:

1. User selects or creates a program template (e.g., "PPL 6x/week, 8-week mesocycle")
2. App shows today's workout with target weights/reps/RIR per exercise
3. User completes workout and logs actual performance + feedback
4. Algorithm generates next session with appropriate progressions or deloads

**Target Audience**: Analytical gym-goers who want data-driven training without manually calculating progressive overload.

**Key Concept**: Instead of generic "add 5lbs every week," the algorithm considers current training phase, recent success/failure rate, accumulated fatigue, and exercise-specific progression patterns to make intelligent adjustments.
