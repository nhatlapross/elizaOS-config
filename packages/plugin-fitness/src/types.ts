// types.ts - Central definition for all fitness plugin types

export interface UserProfile {
    age?: number;
    weight?: number;
    height?: number;
    fitnessLevel?: "beginner" | "intermediate" | "advanced";
    dietaryRestrictions?: string[];
    medicalConditions?: string[];
    goals?: FitnessGoal[];
    workoutPreferences?: {
      preferredDays?: string[];
      preferredTime?: string;
      preferredDuration?: number;
      preferredExerciseTypes?: string[];
    };
    progressData: ProgressData[];
  }
  
  export interface FitnessGoal {
    type: "weight loss" | "muscle gain" | "endurance" | "flexibility" | "general fitness";
    targetValue?: number;
    timeFrame?: string;
    currentStatus?: string;
  }
  
  export interface Exercise {
    name: string;
    type: "cardio" | "strength" | "flexibility";
    difficulty: "beginner" | "intermediate" | "advanced";
    muscleGroups: string[];
    description: string;
    instructions: string[];
    durationOrReps: string;
    restTime?: string;
    equipment?: string[];
  }
  
  export interface WorkoutPlan {
    name: string;
    targetGoal: "weight loss" | "muscle gain" | "endurance" | "flexibility" | "general fitness";
    difficulty: "beginner" | "intermediate" | "advanced";
    frequency: number; // workouts per week
    duration: number; // minutes per session
    exercises: Exercise[];
  }
  
  export interface ProgressData {
    date: string;
    weight?: number;
    bodyFat?: number;
    measurements?: {
      chest?: number;
      waist?: number;
      hips?: number;
      thighs?: number;
      arms?: number;
    };
    workout?: {
      completed: boolean;
      type?: string;
      duration?: number;
      exercises?: {
        name: string;
        sets?: number;
        reps?: number;
        weight?: number;
        duration?: string;
        notes?: string;
      }[];
      difficulty?: number; // 1-10 scale
      energyLevel?: number; // 1-10 scale
      notes?: string;
    };
    nutrition?: {
      caloriesConsumed?: number;
      proteinConsumed?: number;
      carbsConsumed?: number;
      fatConsumed?: number;
      waterConsumed?: number;
      mealCompliance?: number; // 1-10 scale
      notes?: string;
    };
    mood?: number; // 1-10 scale
    sleep?: {
      duration?: number; // hours
      quality?: number; // 1-10 scale
    };
  }
  
  export interface NutritionPlan {
    dailyCalories: number;
    macroSplit: { protein: number; carbs: number; fat: number };
    mealFrequency: number;
    recommendations: string[];
    mealPlan: SampleMeal[];
  }
  
  export interface SampleMeal {
    name: string;
    description: string;
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    ingredients: string[];
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
  }
  
  export interface HydrationPlan {
    dailyWaterIntake: number;
    recommendations: string[];
  }
  
  export interface WorkoutNutrition {
    preWorkout: SampleMeal;
    postWorkout: SampleMeal;
    recommendations: string[];
  }
  
  export interface ProgressSummary {
    period: string;
    metrics: {
      weightChange?: number;
      totalWorkouts: number;
      workoutCompliance: number;
    };
    insights: string[];
    recommendations: string[];
  }
  
  export interface GoalProgress {
    onTrack: boolean;
    percentComplete?: number;
    timeRemaining?: number;
    adjustments?: string[];
  }
  
  export interface WorkoutFeedback {
    tooEasy?: boolean;
    tooHard?: boolean;
    boringExercises?: boolean;
    timeTooLong?: boolean;
    painfulExercises?: string[];
    enjoyedExercises?: string[];
  }