import { elizaLogger } from "@elizaos/core";
import { 
  UserProfile, 
  Exercise, 
  WorkoutPlan, 
  WorkoutFeedback 
} from "./types";

// Sample exercise database - this would be expanded in a real implementation
const exerciseDatabase: Exercise[] = [
  // Beginner cardio exercises
  {
    name: "Brisk Walking",
    type: "cardio",
    difficulty: "beginner",
    muscleGroups: ["legs", "cardiovascular"],
    description: "Walking at a pace that increases your heart rate",
    instructions: [
      "Stand tall with good posture",
      "Look forward, not at the ground",
      "Bend your arms at 90 degrees",
      "Walk at a pace where you can still talk but are breathing heavier than normal"
    ],
    durationOrReps: "20-30 minutes",
    equipment: []
  },
  {
    name: "Step-Ups",
    type: "cardio",
    difficulty: "beginner",
    muscleGroups: ["legs", "glutes", "cardiovascular"],
    description: "Stepping up and down on a raised platform",
    instructions: [
      "Stand facing a sturdy step or bench",
      "Step up with your right foot, then your left foot",
      "Step down with your right foot, then your left foot",
      "Alternate the leading foot every set"
    ],
    durationOrReps: "3 sets of 1 minute each",
    equipment: ["step", "bench"]
  },
  
  // Beginner strength exercises
  {
    name: "Push-Up",
    type: "strength",
    difficulty: "beginner",
    muscleGroups: ["chest", "shoulders", "triceps", "core"],
    description: "A classic bodyweight exercise that targets the upper body and core.",
    instructions: [
      "Start in a plank position with hands shoulder-width apart",
      "Keep your body in a straight line from head to heels",
      "Lower your body until your chest nearly touches the floor",
      "Push back up to the starting position"
    ],
    durationOrReps: "3 sets of 10-15 reps",
    restTime: "60 seconds between sets"
  },
  {
    name: "Bodyweight Squat",
    type: "strength",
    difficulty: "beginner",
    muscleGroups: ["quadriceps", "hamstrings", "glutes", "core"],
    description: "A fundamental lower body exercise that builds strength and stability.",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower your body by bending knees and pushing hips back",
      "Keep chest up and knees tracking over toes",
      "Descend until thighs are parallel to ground (or as low as comfortable)",
      "Push through heels to return to standing"
    ],
    durationOrReps: "3 sets of 15-20 reps",
    restTime: "60 seconds between sets"
  },
  {
    name: "Plank",
    type: "strength",
    difficulty: "beginner",
    muscleGroups: ["core", "shoulders", "back"],
    description: "An isometric core strengthening exercise",
    instructions: [
      "Start in a push-up position, but with forearms on the ground",
      "Keep elbows directly under shoulders",
      "Maintain a straight line from head to heels",
      "Engage your core and hold the position"
    ],
    durationOrReps: "3 sets of 20-30 seconds",
    restTime: "30 seconds between sets"
  },
  
  // Beginner flexibility exercises
  {
    name: "Standing Hamstring Stretch",
    type: "flexibility",
    difficulty: "beginner",
    muscleGroups: ["hamstrings", "lower back"],
    description: "A gentle stretch for the back of the legs",
    instructions: [
      "Stand with feet hip-width apart",
      "Bend forward at the hips, keeping your back straight",
      "Reach toward your toes as far as comfortable",
      "Hold the position, feeling the stretch in your hamstrings"
    ],
    durationOrReps: "Hold for 20-30 seconds, repeat 3 times",
    equipment: []
  },
  {
    name: "Shoulder Stretch",
    type: "flexibility",
    difficulty: "beginner",
    muscleGroups: ["shoulders", "chest"],
    description: "A stretch for the shoulder and chest muscles",
    instructions: [
      "Bring one arm across your chest",
      "Use the opposite hand to gently pull the elbow toward your chest",
      "Hold the stretch feeling tension in the shoulder",
      "Switch sides and repeat"
    ],
    durationOrReps: "Hold for 20-30 seconds each side",
    equipment: []
  }
];

/**
 * Generate a personalized workout plan for a user
 */
function generateWorkoutPlan(profile: UserProfile, goalType: string): WorkoutPlan {
  elizaLogger.info(`Generating ${goalType} workout plan for user`);
  
  // Determine user's fitness level
  const fitnessLevel = profile.fitnessLevel || "beginner";
  
  // Filter exercises based on fitness level
  const exercisesForLevel = exerciseDatabase.filter(ex => ex.difficulty === fitnessLevel);
  
  // Group exercises by type
  const cardioExercises = exercisesForLevel.filter(ex => ex.type === "cardio");
  const strengthExercises = exercisesForLevel.filter(ex => ex.type === "strength");
  const flexibilityExercises = exercisesForLevel.filter(ex => ex.type === "flexibility");
  
  // Select exercises based on goal type
  let selectedExercises: Exercise[] = [];
  
  switch (goalType) {
    case "weight loss":
      // For weight loss, focus on cardio with some strength
      selectedExercises = [
        ...cardioExercises,
        ...strengthExercises.slice(0, 2),
        ...flexibilityExercises.slice(0, 1)
      ];
      break;
      
    case "muscle gain":
      // For muscle gain, focus on strength with some cardio
      selectedExercises = [
        ...cardioExercises.slice(0, 1),
        ...strengthExercises,
        ...flexibilityExercises.slice(0, 1)
      ];
      break;
      
    case "endurance":
      // For endurance, prioritize cardio
      selectedExercises = [
        ...cardioExercises,
        ...strengthExercises.slice(0, 1),
        ...flexibilityExercises.slice(0, 1)
      ];
      break;
      
    case "flexibility":
      // For flexibility, focus on flexibility exercises with some strength
      selectedExercises = [
        ...flexibilityExercises,
        ...strengthExercises.slice(0, 1),
        ...cardioExercises.slice(0, 1)
      ];
      break;
      
    case "general fitness":
    default:
      // For general fitness, include a balance of all types
      selectedExercises = [
        ...cardioExercises.slice(0, 1),
        ...strengthExercises.slice(0, 2),
        ...flexibilityExercises.slice(0, 1)
      ];
      break;
  }
  
  // Determine workout frequency based on preferences or default to 3 days/week
  const frequency = profile.workoutPreferences?.preferredDays?.length || 3;
  
  // Determine workout duration based on preferences or default to 45 minutes
  const duration = profile.workoutPreferences?.preferredDuration || 45;
  
  // Create the workout plan
  const workoutPlan: WorkoutPlan = {
    name: `${goalType.charAt(0).toUpperCase() + goalType.slice(1)} Workout Plan`,
    targetGoal: goalType as any,
    difficulty: fitnessLevel as any,
    frequency,
    duration,
    exercises: selectedExercises
  };
  
  return workoutPlan;
}

/**
 * Adjust a workout plan based on user feedback
 */
function adjustWorkoutPlan(
  plan: WorkoutPlan, 
  feedback: WorkoutFeedback
): WorkoutPlan {
  elizaLogger.info("Adjusting workout plan based on user feedback");
  
  const adjustedPlan = { ...plan };
  
  // Adjust difficulty if needed
  if (feedback.tooEasy) {
    adjustedPlan.difficulty = incrementDifficulty(plan.difficulty);
    // Could replace exercises with more challenging versions
  } else if (feedback.tooHard) {
    adjustedPlan.difficulty = decrementDifficulty(plan.difficulty);
    // Could replace exercises with easier versions
  }
  
  // Adjust duration if needed
  if (feedback.timeTooLong) {
    adjustedPlan.duration = Math.max(plan.duration - 10, 20); // Reduce by 10 mins, min 20 mins
  }
  
  // Remove painful exercises if specified
  if (feedback.painfulExercises && feedback.painfulExercises.length > 0) {
    adjustedPlan.exercises = plan.exercises.filter(
      ex => !feedback.painfulExercises?.includes(ex.name)
    );
    
    // Make sure we still have enough exercises
    if (adjustedPlan.exercises.length < 3) {
      // Add replacement exercises
      const replacementExercises = exerciseDatabase.filter(
        ex => 
          ex.difficulty === adjustedPlan.difficulty && 
          !adjustedPlan.exercises.some(planEx => planEx.name === ex.name) &&
          !(feedback.painfulExercises?.includes(ex.name))
      );
      
      // Add enough to get back to at least 3 exercises
      const neededCount = Math.max(0, 3 - adjustedPlan.exercises.length);
      adjustedPlan.exercises = [
        ...adjustedPlan.exercises,
        ...replacementExercises.slice(0, neededCount)
      ];
    }
  }
  
  // Add variety if boring
  if (feedback.boringExercises) {
    // Keep enjoyed exercises if specified
    const keptExercises = feedback.enjoyedExercises && feedback.enjoyedExercises.length > 0
      ? adjustedPlan.exercises.filter(ex => feedback.enjoyedExercises?.includes(ex.name))
      : [];
    
    // Find new exercises to add variety
    const newExercises = exerciseDatabase.filter(
      ex => 
        ex.difficulty === adjustedPlan.difficulty && 
        !adjustedPlan.exercises.some(planEx => planEx.name === ex.name)
    );
    
    // Replace some exercises but keep enjoyed ones
    adjustedPlan.exercises = [
      ...keptExercises,
      ...newExercises.slice(0, Math.max(3, plan.exercises.length) - keptExercises.length)
    ];
  }
  
  return adjustedPlan;
}

/**
 * Generate a weekly schedule based on workout plan
 */
function generateWeeklySchedule(
  plan: WorkoutPlan, 
  preferredDays?: string[]
): Record<string, string> {
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  let workoutDays: string[];
  
  // Use preferred days if specified and enough for the frequency
  if (preferredDays && preferredDays.length >= plan.frequency) {
    workoutDays = preferredDays.slice(0, plan.frequency);
  } else {
    // Otherwise distribute evenly throughout the week
    workoutDays = distributeWorkoutDays(allDays, plan.frequency);
  }
  
  // Create the schedule
  const schedule: Record<string, string> = {};
  
  // For each day of the week
  for (const day of allDays) {
    if (workoutDays.includes(day)) {
      schedule[day] = generateWorkoutDescription(plan, workoutDays.indexOf(day));
    } else {
      schedule[day] = "Rest Day";
    }
  }
  
  return schedule;
}

/**
 * Distribute workout days evenly throughout the week
 */
function distributeWorkoutDays(allDays: string[], frequency: number): string[] {
  if (frequency >= allDays.length) {
    return [...allDays];
  }
  
  // For lower frequencies, distribute evenly
  const workoutDays: string[] = [];
  const gap = Math.floor(allDays.length / frequency);
  
  for (let i = 0; i < frequency; i++) {
    workoutDays.push(allDays[i * gap]);
  }
  
  return workoutDays;
}

/**
 * Generate a workout description for a specific day
 */
function generateWorkoutDescription(plan: WorkoutPlan, dayIndex: number): string {
  switch (plan.targetGoal) {
    case "weight loss":
      return ["Cardio Focus", "Full Body Circuit", "HIIT Training", "Active Recovery"][dayIndex % 4];
    case "muscle gain":
      return ["Upper Body", "Lower Body", "Full Body", "Hypertrophy Focus"][dayIndex % 4];
    case "endurance":
      return ["Long Duration Cardio", "Interval Training", "Tempo Training", "Active Recovery"][dayIndex % 4];
    case "flexibility":
      return ["Yoga Flow", "Mobility Work", "Dynamic Stretching", "Static Stretching"][dayIndex % 4];
    case "general fitness":
    default:
      return ["Full Body", "Cardio Focus", "Upper Body", "Lower Body", "Core Focus"][dayIndex % 5];
  }
}

/**
 * Increment difficulty level
 */
function incrementDifficulty(difficulty: "beginner" | "intermediate" | "advanced"): "beginner" | "intermediate" | "advanced" {
  if (difficulty === "beginner") return "intermediate";
  if (difficulty === "intermediate") return "advanced";
  return "advanced";
}

/**
 * Decrement difficulty level
 */
function decrementDifficulty(difficulty: "beginner" | "intermediate" | "advanced"): "beginner" | "intermediate" | "advanced" {
  if (difficulty === "advanced") return "intermediate";
  if (difficulty === "intermediate") return "beginner";
  return "beginner";
}

// Export module functions
export const workoutPlanner = {
  // Core workout plan functions
  generateWorkoutPlan,
  adjustWorkoutPlan,
  generateWeeklySchedule,
  
  // Exercise database access
  getExercises: () => exerciseDatabase,
  getExercisesByType: (type: string) => exerciseDatabase.filter(ex => ex.type === type),
  getExercisesByDifficulty: (difficulty: string) => exerciseDatabase.filter(ex => ex.difficulty === difficulty),
  getExercisesByMuscleGroup: (muscleGroup: string) => exerciseDatabase.filter(
    ex => ex.muscleGroups.some(group => group.toLowerCase() === muscleGroup.toLowerCase())
  )
};