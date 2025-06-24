import { elizaLogger } from "@elizaos/core";
import { 
  UserProfile, 
  NutritionPlan, 
  SampleMeal, 
  HydrationPlan, 
  WorkoutNutrition,
  FitnessGoal
} from "./types";

// Constants for nutrition calculations
const NUTRITION_CONSTANTS = {
  DEFAULT_WEIGHT: 70, // kg
  DEFAULT_HEIGHT: 170, // cm
  DEFAULT_AGE: 30,
  CALORIE_ADJUSTMENTS: {
    "weight loss": 0.8,  // 20% deficit
    "muscle gain": 1.15, // 15% surplus
    "endurance": 1.1,    // 10% surplus
    "flexibility": 1.0,  // Maintenance
    "general fitness": 1.0 // Maintenance
  },
  MACRO_SPLITS: {
    "weight loss": { protein: 35, carbs: 30, fat: 35 },
    "muscle gain": { protein: 30, carbs: 50, fat: 20 },
    "endurance": { protein: 20, carbs: 60, fat: 20 },
    "flexibility": { protein: 25, carbs: 45, fat: 30 },
    "general fitness": { protein: 25, carbs: 50, fat: 25 }
  },
  MEAL_FREQUENCY: {
    "weight loss": 3,
    "muscle gain": 5,
    "endurance": 4,
    "flexibility": 3,
    "general fitness": 3
  },
  DIETARY_RECOMMENDATIONS: {
    "weight loss": [
      "Focus on lean proteins and fibrous vegetables",
      "Limit starchy carbs to earlier in the day",
      "Stay hydrated with at least 3 liters of water daily",
      "Consider intermittent fasting (16/8) if it fits your schedule"
    ],
    "muscle gain": [
      "Consume protein with every meal (25-30g)",
      "Eat carbs before and after workouts",
      "Include a protein-rich meal before bed",
      "Consider a post-workout shake with protein and fast-digesting carbs"
    ],
    "endurance": [
      "Focus on complex carbohydrates like whole grains",
      "Consume easily digestible carbs 1-2 hours before workouts",
      "Hydrate with electrolyte drinks during longer sessions",
      "Include anti-inflammatory foods like berries and fatty fish"
    ],
    "flexibility": [
      "Include anti-inflammatory foods like turmeric and ginger",
      "Stay well-hydrated to support joint and muscle health",
      "Consider collagen supplementation",
      "Include plenty of omega-3 fatty acids from fish or plant sources"
    ],
    "general fitness": [
      "Focus on whole foods with minimal processing",
      "Include a variety of colorful fruits and vegetables",
      "Balance your plate with protein, complex carbs, and healthy fats",
      "Stay hydrated throughout the day"
    ]
  },
  RESTRICTION_RECOMMENDATIONS: {
    "vegetarian": [
      "Focus on plant-based proteins like legumes, tofu, and tempeh",
      "Consider protein complementation (combining foods to get complete proteins)",
      "Monitor vitamin B12, iron, and zinc intake"
    ],
    "vegan": [
      "Include a variety of plant proteins like legumes, nuts, seeds, and soy products",
      "Consider supplementing with vitamin B12, vitamin D, and omega-3s",
      "Use fortified plant milks and nutritional yeast for additional nutrients"
    ],
    "gluten-free": [
      "Focus on naturally gluten-free grains like rice, quinoa, and buckwheat",
      "Be cautious of cross-contamination in packaged foods",
      "Get fiber from fruits, vegetables, and gluten-free whole grains"
    ]
  }
};

/**
 * Generate sample meals based on dietary requirements
 * @param dailyCalories Total daily calorie target
 * @param macroSplit Macronutrient ratio targets
 * @param mealFrequency Number of meals per day
 * @param dietaryRestrictions Any dietary restrictions
 * @returns Sample meal plan
 */
function generateSampleMealPlan(
  dailyCalories: number,
  macroSplit: { protein: number; carbs: number; fat: number },
  mealFrequency: number,
  dietaryRestrictions: string[] = []
): SampleMeal[] {
  const caloriesPerMeal = Math.round(dailyCalories / mealFrequency);
  const isVegan = dietaryRestrictions.includes("vegan");
  const isVegetarian = isVegan || dietaryRestrictions.includes("vegetarian");
  const isGlutenFree = dietaryRestrictions.includes("gluten-free");
  
  const mealPlan: SampleMeal[] = [];
  
  for (let i = 1; i <= mealFrequency; i++) {
    let mealType: "breakfast" | "lunch" | "dinner" | "snack";
    let name: string;
    
    // Assign meal type based on meal number and frequency
    if (i === 1) {
      mealType = "breakfast";
      name = "Breakfast";
    } else if (i === mealFrequency) {
      mealType = "dinner";
      name = "Dinner";
    } else if (i === 2 && mealFrequency >= 3) {
      mealType = "lunch";
      name = "Lunch";
    } else {
      mealType = "snack";
      name = `Snack ${i - (mealFrequency > 3 ? 3 : 2)}`;
    }
    
    // Create some simple meal suggestions based on restrictions
    let proteinOptions = isVegan 
      ? ["tofu", "tempeh", "lentils", "chickpeas", "black beans"] 
      : isVegetarian 
        ? ["eggs", "Greek yogurt", "cottage cheese", "tofu", "tempeh"] 
        : ["chicken breast", "salmon", "lean beef", "tuna", "turkey"];
        
    let carbOptions = isGlutenFree 
      ? ["rice", "quinoa", "sweet potatoes", "gluten-free oats", "buckwheat"] 
      : ["whole grain bread", "oats", "brown rice", "whole wheat pasta", "barley"];
    
    let fatOptions = ["avocado", "olive oil", "almonds", "walnuts", "chia seeds"];
    
    // Pick random options from each category
    const protein = proteinOptions[Math.floor(Math.random() * proteinOptions.length)];
    const carb = carbOptions[Math.floor(Math.random() * carbOptions.length)];
    const fat = fatOptions[Math.floor(Math.random() * fatOptions.length)];
    
    // Create meal description based on meal type
    let description = "";
    if (mealType === "breakfast") {
      description = isVegan 
        ? `${protein} scramble with vegetables and ${fat}, served with ${carb}` 
        : isVegetarian 
          ? `${protein} with ${carb} and ${fat}`
          : `${protein} omelette with vegetables and ${carb}, topped with ${fat}`;
    } else if (mealType === "lunch" || mealType === "dinner") {
      description = `${protein} with ${carb} and mixed vegetables, dressed with ${fat}`;
    } else { // snack
      description = `${carb} with ${protein} and ${fat}`;
    }
    
    // Calculate macros for this meal
    const mealProtein = Math.round(caloriesPerMeal * (macroSplit.protein / 100) / 4); // 4 cal/g for protein
    const mealCarbs = Math.round(caloriesPerMeal * (macroSplit.carbs / 100) / 4);     // 4 cal/g for carbs
    const mealFat = Math.round(caloriesPerMeal * (macroSplit.fat / 100) / 9);         // 9 cal/g for fat
    
    mealPlan.push({
      name,
      description,
      mealType,
      ingredients: [protein, carb, fat, "mixed vegetables", "seasonings"],
      macros: {
        calories: caloriesPerMeal,
        protein: mealProtein,
        carbs: mealCarbs,
        fat: mealFat
      }
    });
  }
  
  return mealPlan;
}

/**
 * Calculate nutrition requirements based on user profile
 * @param profile User profile with physical attributes and goals
 * @returns Calculated nutrition requirements
 */
function calculateNutritionRequirements(profile: UserProfile): {
  dailyCalories: number;
  macroSplit: { protein: number; carbs: number; fat: number };
  mealFrequency: number;
  recommendations: string[];
} {
  // Get user data with defaults if missing
  const weight = profile.weight || NUTRITION_CONSTANTS.DEFAULT_WEIGHT;
  const height = profile.height || NUTRITION_CONSTANTS.DEFAULT_HEIGHT;
  const age = profile.age || NUTRITION_CONSTANTS.DEFAULT_AGE;
  
  // Base metabolic rate calculation (simplified)
  let baseCals = (10 * weight) + (6.25 * height) - (5 * age);
  
  // Get user's main goal or default to general fitness
  const mainGoal = profile.goals?.[0]?.type || "general fitness";
  
  // Apply calorie adjustment based on goal
  const calorieAdjustment = NUTRITION_CONSTANTS.CALORIE_ADJUSTMENTS[mainGoal] || 1.0;
  baseCals = baseCals * calorieAdjustment;
  
  // Get appropriate macro split and meal frequency based on goal
  const macroSplit = NUTRITION_CONSTANTS.MACRO_SPLITS[mainGoal] || 
                     NUTRITION_CONSTANTS.MACRO_SPLITS["general fitness"];
                     
  const mealFrequency = NUTRITION_CONSTANTS.MEAL_FREQUENCY[mainGoal] || 
                        NUTRITION_CONSTANTS.MEAL_FREQUENCY["general fitness"];
  
  // Start with goal-specific recommendations
  const recommendations = [
    ...(NUTRITION_CONSTANTS.DIETARY_RECOMMENDATIONS[mainGoal] || 
       NUTRITION_CONSTANTS.DIETARY_RECOMMENDATIONS["general fitness"])
  ];
  
  // Add recommendations for dietary restrictions
  if (profile.dietaryRestrictions) {
    for (const restriction of profile.dietaryRestrictions) {
      const restrictionRecs = NUTRITION_CONSTANTS.RESTRICTION_RECOMMENDATIONS[restriction];
      if (restrictionRecs) {
        recommendations.push(...restrictionRecs);
      }
    }
  }
  
  return {
    dailyCalories: Math.round(baseCals),
    macroSplit,
    mealFrequency,
    recommendations
  };
}

/**
 * Generate a hydration plan based on user weight and activity level
 * @param weight User weight in kg
 * @param activityLevel User activity level
 * @returns Hydration plan with daily targets
 */
function generateHydrationPlan(weight: number, activityLevel: string): HydrationPlan {
  // Base hydration is 35ml per kg of bodyweight
  let baseHydration = weight * 35;
  
  // Adjust for activity level
  if (activityLevel === "high") {
    baseHydration += 500; // Add 500ml for high activity
  } else if (activityLevel === "moderate") {
    baseHydration += 250; // Add 250ml for moderate activity
  }
  
  // Convert to liters
  const dailyWaterIntake = Math.round(baseHydration / 100) / 10;
  
  return {
    dailyWaterIntake,
    recommendations: [
      `Drink approximately ${dailyWaterIntake} liters of water daily`,
      "Start your day with a glass of water before breakfast",
      "Carry a water bottle with you throughout the day",
      "Drink a glass of water before each meal",
      "Set reminders if you frequently forget to drink water",
      "Adjust intake based on climate, workout intensity, and individual needs",
      "Reduce slightly in the evening to avoid disrupting sleep"
    ]
  };
}

/**
 * Generate workout nutrition recommendations
 * @param workoutType Type of workout
 * @param workoutDuration Duration in minutes
 * @param userGoal User's primary fitness goal
 * @returns Workout nutrition recommendations
 */
function generateWorkoutNutrition(
  workoutType: string,
  workoutDuration: number,
  userGoal: string
): WorkoutNutrition {
  // Determine pre-workout meal
  const preWorkoutMeal: SampleMeal = {
    name: "Pre-Workout Meal",
    mealType: "snack",
    description: generatePreWorkoutMealDescription(workoutType, workoutDuration, userGoal),
    ingredients: generatePreWorkoutIngredients(workoutType, userGoal),
    macros: {
      calories: userGoal === "muscle gain" ? 300 : 200,
      protein: userGoal === "muscle gain" ? 20 : 15,
      carbs: userGoal === "muscle gain" ? 45 : (workoutType === "cardio" ? 35 : 25),
      fat: userGoal === "muscle gain" ? 5 : 5
    }
  };
  
  // Determine post-workout meal
  const postWorkoutMeal: SampleMeal = {
    name: "Post-Workout Meal",
    mealType: "snack",
    description: generatePostWorkoutMealDescription(workoutType, workoutDuration, userGoal),
    ingredients: generatePostWorkoutIngredients(workoutType, userGoal),
    macros: {
      calories: userGoal === "muscle gain" ? 400 : 250,
      protein: userGoal === "muscle gain" ? 30 : 25,
      carbs: userGoal === "muscle gain" ? 50 : (userGoal === "weight loss" ? 15 : 40),
      fat: userGoal === "muscle gain" ? 5 : (userGoal === "weight loss" ? 10 : 5)
    }
  };
  
  // Generate workout nutrition recommendations
  const recommendations: string[] = [
    // Basic recommendations for all users
    "Stay hydrated before, during, and after your workout",
    "Listen to your body and adjust nutrition based on how you feel",
    
    // Workout type specific recommendations
    ...(workoutType === "cardio" ? [
      "For longer cardio sessions, consider electrolyte replacement",
      "Carbohydrates are especially important for endurance activities"
    ] : []),
    
    ...(workoutType === "strength" ? [
      "Protein is crucial for muscle repair and growth",
      "Consider creatine supplementation for strength training"
    ] : []),
    
    // Goal specific recommendations
    ...(userGoal === "weight loss" ? [
      "Focus on timing your calories around your workout for optimal results",
      "Protein is essential to preserve muscle mass during weight loss"
    ] : []),
    
    ...(userGoal === "muscle gain" ? [
      "Ensure you're in a caloric surplus on training days",
      "Prioritize post-workout nutrition for optimal recovery"
    ] : [])
  ];
  
  return {
    preWorkout: preWorkoutMeal,
    postWorkout: postWorkoutMeal,
    recommendations
  };
}

/**
 * Helper function to generate pre-workout meal descriptions
 */
function generatePreWorkoutMealDescription(workoutType: string, workoutDuration: number, userGoal: string): string {
  if (workoutType === "strength" || workoutType === "hiit") {
    return userGoal === "muscle gain"
      ? "Protein shake with banana and oats (1-2 hours before workout)"
      : "Greek yogurt with berries and honey (1 hour before workout)";
  } else if (workoutType === "cardio" || workoutType === "endurance") {
    return workoutDuration > 60
      ? "Oatmeal with banana and honey (2-3 hours before workout)"
      : "Apple with almond butter (30-60 minutes before workout)";
  } else {
    return "Toast with avocado and egg (1-2 hours before workout)";
  }
}

/**
 * Helper function to generate pre-workout ingredients
 */
function generatePreWorkoutIngredients(workoutType: string, userGoal: string): string[] {
  if (workoutType === "strength" || workoutType === "hiit") {
    return userGoal === "muscle gain"
      ? ["protein powder", "banana", "oats", "almond milk", "honey"]
      : ["Greek yogurt", "mixed berries", "honey", "almonds"];
  } else if (workoutType === "cardio" || workoutType === "endurance") {
    return ["oatmeal", "banana", "honey", "cinnamon", "almond milk"];
  } else {
    return ["whole grain toast", "avocado", "egg", "salt", "pepper"];
  }
}

/**
 * Helper function to generate post-workout meal descriptions
 */
function generatePostWorkoutMealDescription(workoutType: string, workoutDuration: number, userGoal: string): string {
  if (userGoal === "muscle gain") {
    return "Protein shake with banana and a turkey sandwich on whole grain bread";
  } else if (userGoal === "weight loss") {
    return "Grilled chicken breast with steamed vegetables";
  } else if (userGoal === "endurance") {
    return "Chocolate milk and a banana with rice cakes";
  } else {
    return "Grilled salmon with sweet potato and broccoli";
  }
}

/**
 * Helper function to generate post-workout ingredients
 */
function generatePostWorkoutIngredients(workoutType: string, userGoal: string): string[] {
  if (userGoal === "muscle gain") {
    return ["protein powder", "banana", "turkey", "whole grain bread", "lettuce", "tomato"];
  } else if (userGoal === "weight loss") {
    return ["chicken breast", "broccoli", "cauliflower", "olive oil", "herbs"];
  } else if (userGoal === "endurance") {
    return ["chocolate milk", "banana", "rice cakes", "honey"];
  } else {
    return ["salmon", "sweet potato", "broccoli", "olive oil", "lemon", "herbs"];
  }
}

/**
 * Generate a complete nutrition plan based on user profile
 * @param profile User profile with physical attributes and goals
 * @returns Complete nutrition plan
 */
function generateNutritionPlan(profile: UserProfile): NutritionPlan {
  // Calculate base nutrition requirements
  const { dailyCalories, macroSplit, mealFrequency, recommendations } = calculateNutritionRequirements(profile);
  
  // Generate sample meals
  const mealPlan = generateSampleMealPlan(
    dailyCalories,
    macroSplit,
    mealFrequency,
    profile.dietaryRestrictions || []
  );
  
  const nutritionPlan: NutritionPlan = {
    dailyCalories,
    macroSplit,
    mealFrequency,
    recommendations,
    mealPlan
  };
  
  elizaLogger.info(`Generated nutrition plan with ${dailyCalories} calories`);
  
  return nutritionPlan;
}

// Export the nutrition planner module
export const nutritionPlanner = {
  generateNutritionPlan,
  generateHydrationPlan,
  generateWorkoutNutrition,
  calculateNutritionRequirements
};