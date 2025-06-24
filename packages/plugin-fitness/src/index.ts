// index.ts - Main entry point for the fitness plugin
import { elizaLogger } from "@elizaos/core";

// Export all types from the central type definition file
export * from "./types";

// Import specific types needed in this file
import {
  UserProfile,
  WorkoutPlan,
  NutritionPlan,
  ProgressData,
  Exercise
} from "./types";

// Import module functionality
import { workoutPlanner } from "./workout-planner";
import { nutritionPlanner } from "./nutrition-planner";
import { progressTracker } from "./progress-tracker";

// Export module functionality
export { workoutPlanner };
export { nutritionPlanner };
export { progressTracker };

// Private data storage
const userProfiles: Record<string, UserProfile> = {};
const workoutPlans: Record<string, WorkoutPlan> = {};
const nutritionPlans: Record<string, NutritionPlan> = {};

/**
 * FitCoach Fitness Trainer Plugin
 */
export const fitnessPlugin = {
  id: "fitness-trainer",
  name: "FitCoach Fitness Trainer",
  description: "AI fitness trainer for personalized workouts and fitness tracking",
  version: "1.0.0",
  
  /**
   * Initialize the plugin
   */
  async initialize(runtime: any): Promise<void> {
    elizaLogger.info("FitCoach Fitness Trainer Plugin initialized");
  },
  
  /**
   * User Profile Management
   */
  async createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      fitnessLevel: "beginner",
      dietaryRestrictions: [],
      medicalConditions: [],
      goals: [],
      workoutPreferences: {
        preferredDays: ["Monday", "Wednesday", "Friday"],
        preferredTime: "morning",
        preferredDuration: 45,
        preferredExerciseTypes: ["strength", "cardio"]
      },
      progressData: [] // Always initialize as empty array since it's required
    };
    
    userProfiles[userId] = { 
      ...defaultProfile,
      ...profileData 
    };
    
    elizaLogger.info(`Created user profile for ${userId}`);
    return userProfiles[userId];
  },
  
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return userProfiles[userId] || null;
  },
  
  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    if (!userProfiles[userId]) {
      return this.createUserProfile(userId, profileData);
    }
    
    userProfiles[userId] = {
      ...userProfiles[userId],
      ...profileData
    };
    
    elizaLogger.info(`Updated user profile for ${userId}`);
    return userProfiles[userId];
  },
  
  /**
   * Workout Plan Management - delegated to workout-planner module
   */
  async createWorkoutPlan(userId: string, goalType: string): Promise<WorkoutPlan> {
    const profile = userProfiles[userId];
    
    if (!profile) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }
    
    const plan = workoutPlanner.generateWorkoutPlan(profile, goalType);
    workoutPlans[userId] = plan;
    
    return plan;
  },
  
  async getWorkoutPlan(userId: string): Promise<WorkoutPlan | null> {
    return workoutPlans[userId] || null;
  },
  
  async getWeeklySchedule(userId: string): Promise<Record<string, string>> {
    const plan = workoutPlans[userId];
    const profile = userProfiles[userId];
    
    if (!plan) {
      throw new Error(`No workout plan found for userId: ${userId}`);
    }
    
    return workoutPlanner.generateWeeklySchedule(plan, profile?.workoutPreferences?.preferredDays);
  },
  
  async getExercises(type?: string, muscleGroup?: string, difficulty?: string): Promise<Exercise[]> {
    if (type) {
      return workoutPlanner.getExercisesByType(type);
    }
    
    if (muscleGroup) {
      return workoutPlanner.getExercisesByMuscleGroup(muscleGroup);
    }
    
    if (difficulty) {
      return workoutPlanner.getExercisesByDifficulty(difficulty);
    }
    
    return workoutPlanner.getExercises();
  },
  
  /**
   * Nutrition Plan Management - delegated to nutrition-planner module
   */
  async createNutritionPlan(userId: string): Promise<NutritionPlan> {
    const profile = userProfiles[userId];
    
    if (!profile) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }
    
    const plan = nutritionPlanner.generateNutritionPlan(profile);
    nutritionPlans[userId] = plan;
    
    return plan;
  },
  
  async getNutritionPlan(userId: string): Promise<NutritionPlan | null> {
    return nutritionPlans[userId] || null;
  },
  
  async getHydrationPlan(userId: string): Promise<any> {
    const profile = userProfiles[userId];
    
    if (!profile) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }
    
    const weight = profile.weight || 70;
    const activityLevel = profile.workoutPreferences?.preferredDays?.length && 
                        profile.workoutPreferences?.preferredDays.length > 4 ? "high" : "moderate";
    
    return nutritionPlanner.generateHydrationPlan(weight, activityLevel);
  },
  
  /**
   * Progress Tracking - delegated to progress-tracker module
   */
  async logProgress(userId: string, data: ProgressData): Promise<void> {
    const profile = userProfiles[userId];
    
    if (!profile) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }
    
    return progressTracker.logProgress(userId, profile, data);
  },
  
  async getProgressSummary(userId: string): Promise<any> {
    const profile = userProfiles[userId];
    
    if (!profile) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }
    
    return progressTracker.getProgressSummary(profile);
  },
  
  async getMotivationalMessage(userId: string): Promise<string> {
    const profile = userProfiles[userId];
    
    if (!profile) {
      return "Every fitness journey begins with a single step. Let's create your profile to get started!";
    }
    
    return progressTracker.generateMotivationalMessage(profile);
  }
};

// Export the plugin as default
export default fitnessPlugin;