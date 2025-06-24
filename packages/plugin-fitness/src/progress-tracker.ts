import { elizaLogger } from "@elizaos/core";
import { 
  UserProfile, 
  ProgressData,
  ProgressSummary,
  GoalProgress
} from "./types";

/**
 * Log a new progress entry for the user
 */
function logProgress(userId: string, profile: UserProfile, data: ProgressData): void {
  // Ensure we have a date on the progress data
  const progressEntry: ProgressData = {
    ...data,
    date: data.date || new Date().toISOString().split('T')[0]
  };
  
  // Add the progress data to the profile
  profile.progressData.push(progressEntry);
  
  // Sort progress data by date
  profile.progressData.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  elizaLogger.info(`Logged progress for user ${userId} on ${progressEntry.date}`);
}

/**
 * Get a summary of progress over time
 */
function getProgressSummary(profile: UserProfile): ProgressSummary {
  // Safety check for progress data
  if (profile.progressData.length === 0) {
    return {
      period: "No data",
      metrics: {
        totalWorkouts: 0,
        workoutCompliance: 0
      },
      insights: ["Not enough data to generate insights"],
      recommendations: ["Start logging your workouts and measurements"]
    };
  }
  
  // Sort progress data by date
  const sortedData = [...profile.progressData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Date range
  const startDate = sortedData[0]?.date || "Unknown";
  const currentDate = sortedData[sortedData.length - 1]?.date || "Unknown";
  
  // Calculate duration in days
  const start = new Date(startDate);
  const end = new Date(currentDate);
  const durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate weight change
  let weightChange: number | undefined;
  if (typeof sortedData[0]?.weight === 'number' && 
      typeof sortedData[sortedData.length - 1]?.weight === 'number') {
    weightChange = sortedData[sortedData.length - 1].weight! - sortedData[0].weight!;
  }
  
  // Calculate workout metrics
  const totalWorkouts = sortedData.filter(d => d.workout?.completed === true).length;
  
  // Estimate expected workouts (assuming 3 per week if not specified)
  const workoutFrequency = profile.workoutPreferences?.preferredDays?.length || 3;
  const expectedWorkouts = Math.ceil(durationDays / 7 * workoutFrequency);
  
  // Calculate compliance percentage (cap at 100%)
  const workoutCompliance = Math.min(100, Math.round((totalWorkouts / Math.max(1, expectedWorkouts)) * 100));
  
  // Generate insights
  const insights: string[] = [];
  
  // Time-based insights
  if (durationDays < 7) {
    insights.push("You're just getting started! Consistency is key in the early days.");
  } else if (durationDays >= 30) {
    insights.push("You've been tracking for a month or more - great job maintaining your program!");
  }
  
  // Weight-based insights
  if (weightChange !== undefined) {
    const weightChangePerWeek = (weightChange / durationDays) * 7;
    
    if (Math.abs(weightChangePerWeek) > 1) {
      insights.push(`Your weight is changing at ${Math.abs(weightChangePerWeek).toFixed(1)} pounds per week, which is faster than the recommended 0.5-1 pound per week for sustainable results.`);
    } else if (Math.abs(weightChangePerWeek) >= 0.5 && Math.abs(weightChangePerWeek) <= 1) {
      insights.push(`Your weight is changing at an ideal pace of about ${Math.abs(weightChangePerWeek).toFixed(1)} pounds per week, which is sustainable and healthy.`);
    }
  }
  
  // Workout-based insights
  if (workoutCompliance >= 90) {
    insights.push(`Excellent workout consistency at ${workoutCompliance}%! Your commitment is outstanding.`);
  } else if (workoutCompliance >= 70) {
    insights.push(`Good workout compliance at ${workoutCompliance}%. You're building a solid routine.`);
  } else if (workoutCompliance < 50 && durationDays > 14) {
    insights.push(`Your workout compliance is ${workoutCompliance}%. Finding ways to improve consistency would help you reach your goals faster.`);
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  // If no insights were generated, add a default one
  if (insights.length === 0) {
    insights.push("Keep tracking your progress to generate more personalized insights.");
  }
  
  // Recommendations based on workout compliance
  if (workoutCompliance < 70) {
    recommendations.push("Try scheduling workouts at consistent times each week to build a sustainable routine.");
    recommendations.push("Consider shorter, more frequent workouts if time is a limiting factor.");
  }
  
  // Recommendations based on weight trends
  if (weightChange !== undefined) {
    const mainGoal = profile.goals?.[0]?.type || "";
    
    if (mainGoal === "weight loss" && weightChange >= 0) {
      recommendations.push("For weight loss, consider tracking calories more closely and adjusting portion sizes.");
      recommendations.push("Add 1-2 additional cardio sessions per week to increase your calorie deficit.");
    } else if (mainGoal === "muscle gain" && weightChange <= 0) {
      recommendations.push("For muscle gain, try increasing your caloric intake by 200-300 calories per day.");
      recommendations.push("Focus on protein-rich foods and prioritize strength training for muscle growth.");
    }
  }
  
  // Add a general recommendation
  recommendations.push("Continue logging your progress consistently to get more accurate insights and recommendations.");
  
  return {
    period: `${startDate} to ${currentDate} (${durationDays} days)`,
    metrics: {
      weightChange,
      totalWorkouts,
      workoutCompliance
    },
    insights,
    recommendations
  };
}

/**
 * Evaluate if user is making progress toward a specific goal
 */
function evaluateGoalProgress(profile: UserProfile, targetGoal: string): GoalProgress {
  // If no progress data, can't evaluate
  if (profile.progressData.length < 2) {
    return {
      onTrack: false,
      adjustments: ["Not enough data yet to evaluate progress. Continue logging your workouts and measurements."]
    };
  }
  
  // Find the specific goal
  const goal = profile.goals?.find(g => g.type === targetGoal);
  
  if (!goal) {
    return {
      onTrack: false,
      adjustments: [`No "${targetGoal}" goal found in your profile. Set specific goals to track progress.`]
    };
  }
  
  // Sort progress data by date
  const sortedData = [...profile.progressData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate duration in days
  const startDate = new Date(sortedData[0].date);
  const currentDate = new Date(sortedData[sortedData.length - 1].date);
  const elapsedDays = Math.round((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // For weight-based goals
  if (targetGoal === "weight loss" || targetGoal === "muscle gain") {
    // Check if we have weight data
    if (typeof sortedData[0].weight !== 'number' || 
        typeof sortedData[sortedData.length - 1].weight !== 'number') {
      return {
        onTrack: false,
        adjustments: ["Weight measurements are missing. Regular weigh-ins help track progress."]
      };
    }
    
    const startWeight = sortedData[0].weight!;
    const currentWeight = sortedData[sortedData.length - 1].weight!;
    const weightChange = currentWeight - startWeight;
    const weeklyChange = (weightChange / elapsedDays) * 7;
    
    // If goal has a target value
    if (goal.targetValue) {
      const targetChange = goal.targetValue - startWeight;
      const currentChange = currentWeight - startWeight;
      const percentComplete = Math.round((currentChange / targetChange) * 100);
      
      // For weight loss (targetChange is negative)
      if (targetGoal === "weight loss") {
        // Check if on track
        const onTrack = weeklyChange < 0;
        const timeRemaining = onTrack ? Math.ceil((goal.targetValue! - currentWeight) / Math.abs(weeklyChange) * 7) : undefined;
        
        return {
          onTrack,
          percentComplete: onTrack ? Math.min(100, Math.max(0, Math.abs(percentComplete))) : 0,
          timeRemaining,
          adjustments: onTrack 
            ? ["You're making progress toward your weight loss goal. Keep up the good work!"] 
            : ["You're not currently losing weight. Consider adjusting your nutrition and exercise plan."]
        };
      }
      // For muscle gain (targetChange is positive)
      else if (targetGoal === "muscle gain") {
        // Check if on track
        const onTrack = weeklyChange > 0;
        const timeRemaining = onTrack ? Math.ceil((goal.targetValue! - currentWeight) / weeklyChange * 7) : undefined;
        
        return {
          onTrack,
          percentComplete: onTrack ? Math.min(100, Math.max(0, percentComplete)) : 0,
          timeRemaining,
          adjustments: onTrack 
            ? ["You're making progress toward your muscle gain goal. Keep up the good work!"] 
            : ["You're not currently gaining weight. Consider increasing calories and focusing on strength training."]
        };
      }
    }
    
    // If no target value, just check if trend is in right direction
    return {
      onTrack: (targetGoal === "weight loss" && weeklyChange < 0) || 
               (targetGoal === "muscle gain" && weeklyChange > 0),
      adjustments: [
        `Your weight is changing by approximately ${Math.abs(weeklyChange).toFixed(1)} pounds per week.`,
        "Set a specific target weight in your goals for more detailed progress tracking."
      ]
    };
  }
  
  // For workout-based goals (endurance, flexibility, general fitness)
  const workouts = sortedData.filter(d => d.workout?.completed === true);
  
  if (workouts.length < 2) {
    return {
      onTrack: false,
      adjustments: ["Not enough workout data to evaluate progress."]
    };
  }
  
  // Check workout frequency
  const workoutFrequency = profile.workoutPreferences?.preferredDays?.length || 3;
  const expectedWorkouts = Math.ceil(elapsedDays / 7 * workoutFrequency);
  const complianceRate = Math.round((workouts.length / Math.max(1, expectedWorkouts)) * 100);
  
  // For endurance goals
  if (targetGoal === "endurance") {
    // Check for cardio workouts
    const cardioWorkouts = workouts.filter(d => 
      d.workout?.type?.toLowerCase().includes("cardio")
    );
    
    const hasEnoughCardio = cardioWorkouts.length >= workouts.length * 0.6; // At least 60% should be cardio
    
    return {
      onTrack: complianceRate >= 70 && hasEnoughCardio,
      percentComplete: complianceRate,
      adjustments: [
        complianceRate < 70 
          ? "Try to increase your workout consistency for better endurance improvements." 
          : "Your workout consistency is good for endurance improvements.",
        !hasEnoughCardio
          ? "Include more cardio-focused workouts to improve endurance."
          : "Good job including cardio workouts in your routine."
      ]
    };
  }
  
  // For flexibility goals
  if (targetGoal === "flexibility") {
    // Check for flexibility workouts
    const flexibilityWorkouts = workouts.filter(d => 
      d.workout?.type?.toLowerCase().includes("flex") || 
      d.workout?.type?.toLowerCase().includes("yoga") ||
      d.workout?.type?.toLowerCase().includes("stretch")
    );
    
    const hasEnoughFlexibility = flexibilityWorkouts.length >= workouts.length * 0.5; // At least 50% should be flexibility
    
    return {
      onTrack: complianceRate >= 70 && hasEnoughFlexibility,
      percentComplete: complianceRate,
      adjustments: [
        complianceRate < 70 
          ? "Try to increase your workout consistency for better flexibility improvements." 
          : "Your workout consistency is good for flexibility improvements.",
        !hasEnoughFlexibility
          ? "Include more flexibility-focused workouts like yoga or stretching sessions."
          : "Good job focusing on flexibility in your routine."
      ]
    };
  }
  
  // For general fitness
  return {
    onTrack: complianceRate >= 70,
    percentComplete: complianceRate,
    adjustments: [
      complianceRate < 70 
        ? "Try to increase your workout consistency for better general fitness improvements." 
        : "Your workout consistency is good for general fitness.",
      "Include a variety of workout types for balanced fitness development."
    ]
  };
}

/**
 * Generate a motivational message based on user's progress
 */
function generateMotivationalMessage(profile: UserProfile): string {
  // If no progress data, provide a starting message
  if (profile.progressData.length === 0) {
    return "Every fitness journey begins with a single step. Today is your day to start!";
  }
  
  // Sort progress data by date
  const sortedData = [...profile.progressData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate workout compliance
  const workouts = sortedData.filter(d => d.workout?.completed === true);
  const recentWorkouts = sortedData
    .filter(d => 
      d.workout?.completed === true && 
      new Date(d.date) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // Last 2 weeks
    );
  
  // Generate message based on data
  if (workouts.length === 1) {
    return "Congratulations on completing your first workout! The journey of a thousand miles begins with a single step.";
  } else if (workouts.length >= 10 && recentWorkouts.length === 0) {
    return "It's been a while since your last workout. Remember: it's not about being perfect, it's about being consistent. Let's get back on track!";
  } else if (recentWorkouts.length >= 4) {
    return "Your recent consistency is impressive! Keep this momentum going - you're building habits that will last a lifetime.";
  } else if (workouts.length >= 20) {
    return "You've completed over 20 workouts! Your dedication is paying off in ways you can see and feel.";
  }
  
  // Default motivational messages
  const defaultMessages = [
    "Small steps every day lead to big results over time.",
    "Focus on progress, not perfection. Every workout counts!",
    "The only bad workout is the one that didn't happen. Show up for yourself today!",
    "Your future self is thanking you for the effort you're putting in now.",
    "Consistency beats intensity. Keep showing up and results will follow."
  ];
  
  return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
}

// Export module functions
export const progressTracker = {
  logProgress,
  getProgressSummary,
  evaluateGoalProgress,
  generateMotivationalMessage
};

// Default export
export default progressTracker;