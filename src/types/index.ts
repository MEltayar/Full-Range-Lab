// ── Subscriptions & Plans ─────────────────────────────────────────────────────

export type ProfileType = 'physio' | 'gym';

export type PlanType = 'trial' | 'pro_monthly' | 'pro_yearly';
export type PlanStatus = 'active' | 'expired';

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: PlanStatus;
  trialStartedAt: string;
  currentPeriodEnd: string | null;
  clientsCreated: number;
  createdAt: string;
}

export type PaymentMethod = 'vodafone_cash' | 'instapay' | 'other';
export type PaymentProofStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentProof {
  id: string;
  userId: string;
  storagePath: string;
  method: PaymentMethod;
  amountPaid: number | null;
  referenceNote: string | null;
  requestedPlan: 'pro_monthly' | 'pro_yearly';
  status: PaymentProofStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  createdAt: string;
}

export interface PlanLimits {
  maxClients: number;
  maxProgramsPerClient: number;
  /** Max clients that can be invited to the branded portal. 0 = portal disabled. */
  maxClientsInvited: number;
  canPreview: boolean;
  canExportPDF: boolean;
  canExportExcel: boolean;
  canAddCustomExercise: boolean;
  canSaveTemplate: boolean;
  canAccessConfig: boolean;
  canShare: boolean;
  canAccessDietPlans: boolean;
  canManageFood: boolean;
  canAccessClientAnalytics: boolean;
  canUseExportTemplates: boolean;
}

// ── Exercise ──────────────────────────────────────────────────────────────────

// Physio categories
export type RehabExerciseCategory =
  | 'mobility' | 'stability' | 'strength' | 'stretching' | 'balance' | 'functional';

// Gym categories (muscle groups)
export type GymExerciseCategory =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'legs' | 'glutes' | 'core' | 'cardio' | 'full_body';

export type ExerciseCategory = RehabExerciseCategory | GymExerciseCategory;

export type EquipmentType =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine'
  | 'bodyweight' | 'kettlebell' | 'resistance_band' | 'ez_bar' | 'other';

export type ProgressionLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  tags: string[];
  progressionLevel?: ProgressionLevel;
  progressionGroupId?: string;
  muscleGroup?: string;
  equipment?: EquipmentType;
  notes?: string;
  createdAt: string;
  isCustom: boolean;
  userId?: string;
}

export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'rehab' | 'endurance' | 'flexibility' | 'general';
export type PlanItemStatus = 'active' | 'completed' | 'paused';

export interface Client {
  id: string;
  name: string;
  age?: number;
  email?: string;
  phone?: string;
  createdAt: string;
  // Physical profile
  heightCm?: number;
  weightKg?: number;
  fitnessGoal?: FitnessGoal;
  medicalHistory?: string;
  // Trainer notes
  foodPreferences?: string;
  foodDislikes?: string;
  exercisePreferences?: string;
  exerciseDislikes?: string;
  allergies?: string;
  healthAlerts?: string;
  generalNotes?: string;
  // Public-to-client message — shown on the client portal. `generalNotes` stays trainer-only.
  trainerMessage?: string;
  // Phase 2: linked Supabase auth user for the client's own login. Null until invited.
  clientUserId?: string;
  invitedAt?: string;
  inviteAcceptedAt?: string;
  // Engagement window with the trainer. When `subscriptionEndDate` is in the past,
  // the client portal shows an expired wall. Both null = open-ended (no expiry).
  // ISO date strings (YYYY-MM-DD) — date-only, no timezone.
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

export type ClientMood = 'great' | 'good' | 'okay' | 'tired' | 'bad';

export interface LoggedSet {
  weightKg?: number;
  reps?: number;
  rpe?: number;          // 1..10 optional
}

export interface LoggedExercise {
  exerciseId: string;
  sets: LoggedSet[];
  notes?: string;
}

export interface ClientSessionLog {
  id: string;
  clientId: string;
  programId?: string;
  programSessionId?: string;
  loggedAt: string;          // YYYY-MM-DD
  exercises: LoggedExercise[];
  notes?: string;
  createdAt: string;
}

export type PhotoPose = 'front' | 'side' | 'back' | 'other';

export interface ClientProgressPhoto {
  id: string;
  clientId: string;
  checkInId?: string;
  photoPath: string;     // path inside the `progress-photos` bucket
  takenAt: string;
  caption?: string;
  pose?: PhotoPose;
  createdAt: string;
}

export interface ClientCheckIn {
  id: string;
  clientId: string;
  date: string;
  weightKg?: number;
  bodyFatPct?: number;
  muscleMassPct?: number;
  waistCm?: number;
  chestCm?: number;
  hipCm?: number;
  thighCm?: number;
  armCm?: number;
  mood?: ClientMood;
  energyLevel?: number;  // 1..5
  weeklyNotes?: string;
  notes?: string;
  createdAt: string;
}

export interface ProgramExercise {
  id: string;
  exerciseId: string;
  sets?: number;
  reps?: string;
  holdTime?: number;
  weightKg?: number;
  restSeconds?: number;
  notes?: string;
  order: number;
}

export interface Session {
  id: string;
  label: string;
  /** Day-of-week (0=Sun, 1=Mon, …, 6=Sat) — matches `Date.getDay()`. Optional. */
  dayOfWeek?: number;
  exercises: ProgramExercise[];
}

export interface Program {
  id: string;
  clientId: string;
  name: string;
  condition: string;
  goal: string;
  durationWeeks: number;
  startDate: string;
  sessions: Session[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
  status?: PlanItemStatus;
}

export interface Template {
  id: string;
  name: string;
  condition: string;
  description?: string;
  tags: string[];
  sessions: Session[];
  isBuiltIn: boolean;
  createdAt: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  light: string;
  text: string;
  darkText: string;
}

export type LayoutVariant =
  | 'professional' | 'patient'    | 'checklist' | 'clinical'  | 'modern'
  | 'minimal'      | 'bold'       | 'executive' | 'compact'   | 'twoColumn'
  | 'ledger'       | 'timeline'   | 'handout'   | 'report'    | 'card'
  | 'striped'      | 'magazine'   | 'sidebar'   | 'academic'  | 'outline'
  | 'receipt'      | 'notebook'   | 'poster'    | 'plain'     | 'rounded'
  | 'highlight'    | 'columns'    | 'divider'   | 'schedule'  | 'compactCard';
export type HeaderStyle = 'logo-left' | 'centered';

export interface ExportTemplate {
  id: string;
  name: string;
  colorScheme: ColorScheme;
  layoutVariant: LayoutVariant;
  headerStyle: HeaderStyle;
}

export interface ColorPalette {
  id: string;
  name: string;
  colorScheme: ColorScheme;
}

// ── Diet / Food Library ───────────────────────────────────────────────────────

export interface AltServing {
  label: string;      // e.g. "1 egg", "1 cup (240ml)", "1 oz (28g)"
  multiplier: number; // scale factor applied to base macros (base = servingSize / servingUnit)
}

export type FoodCategory =
  | 'protein' | 'dairy' | 'grains' | 'vegetables' | 'fruits'
  | 'nuts_seeds' | 'legumes' | 'fats_oils' | 'beverages'
  | 'condiments' | 'snacks' | 'other';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  servingSize: number;    // amount per serving (e.g. 100)
  servingUnit: string;    // unit label (e.g. 'g', 'ml', 'piece')
  calories: number;       // kcal per serving
  protein: number;        // g per serving
  carbs: number;          // g per serving
  fat: number;            // g per serving
  fiber?: number;         // g per serving
  sugar?: number;         // g per serving
  sodium?: number;        // mg per serving
  notes?: string;
  customCategory?: string;  // user-typed label when category === 'other'
  altServings?: AltServing[];
  gramsPerUnit?: number;    // for unit-based foods: weight of 1 unit in grams (e.g. 60 for 1 egg)
  isCustom: boolean;
  createdAt: string;
  userId?: string;
}

// ── Diet Plans ──────────────────────────────────────────────────────────────��─

export interface DietMealItem {
  id: string;
  foodItemId: string;
  quantity: number;          // how many of the chosen serving (e.g. 2 eggs)
  servingMultiplier?: number; // AltServing.multiplier for the chosen option (default 1)
  servingLabel?: string;      // human-readable label, e.g. "1 egg (50g)"
  notes?: string;
}

export interface DietMeal {
  id: string;
  label: string;      // e.g. "Breakfast", "Lunch"
  items: DietMealItem[];
}

export interface DietDay {
  id: string;
  label: string;      // e.g. "Day 1", "Monday"
  /** Day-of-week (0=Sun, 1=Mon, …, 6=Sat) — matches `Date.getDay()`. Optional. */
  dayOfWeek?: number;
  meals: DietMeal[];
}

export interface DietPlan {
  id: string;
  clientId: string;
  name: string;
  goal: string;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  durationWeeks: number;
  startDate: string;
  days: DietDay[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  status?: PlanItemStatus;
}

export interface DietLog {
  id: string;
  clientId: string;
  planId: string;
  dayId: string;
  mealId: string;
  date: string;        // YYYY-MM-DD
  eaten: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HelpAnnouncement {
  id: string;
  title: string;
  body: string;
  date: string;
}

export interface AppSettings {
  profileType?: ProfileType;
  clinicName: string;
  clinicLogo?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicAddress?: string;
  clinicWebsite?: string;
  therapistName?: string;
  darkMode: boolean;
  whatsappTemplate?: string;
  emailTemplate?: string;
  emailSubject?: string;
  favouriteTemplateIds?: string[];
  clinicInstagram?: string;
  clinicFacebook?: string;
  clinicGmail?: string;
  clinicWhatsApp?: string;
  exportTemplateId?: string;
  exportTemplateFavorites?: string[];
  exportPaletteId?: string;
  helpAnnouncements?: HelpAnnouncement[];
  hiddenExerciseIds?: string[];
  hiddenFoodIds?: string[];
}
