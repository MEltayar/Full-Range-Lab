import type { Exercise, Client, Program, Template, AppSettings, Subscription, PlanType, PlanStatus, ProfileType, EquipmentType, FoodItem, FoodCategory, DietPlan, ClientCheckIn, ClientMood, ClientProgressPhoto, ClientSessionLog, LoggedExercise, FitnessGoal, PlanItemStatus, DietLog } from '../types';

// ── Exercise ──────────────────────────────────────────────────────────────────

export function dbRowToExercise(row: Record<string, unknown>): Exercise {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as Exercise['category'],
    description: row.description as string,
    imageUrl: row.image_url as string | undefined,
    videoUrl: row.video_url as string | undefined,
    tags: row.tags as string[],
    progressionLevel: row.progression_level as Exercise['progressionLevel'] | undefined,
    progressionGroupId: row.progression_group_id as string | undefined,
    muscleGroup: row.muscle_group as string | undefined,
    equipment: row.equipment as EquipmentType | undefined,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    isCustom: (row.is_custom as boolean) ?? false,
    userId: row.user_id as string | undefined,
  };
}

export function exerciseToDbRow(e: Exercise): Record<string, unknown> {
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    description: e.description,
    image_url: e.imageUrl,
    video_url: e.videoUrl,
    tags: e.tags,
    progression_level: e.progressionLevel,
    progression_group_id: e.progressionGroupId,
    muscle_group: e.muscleGroup,
    equipment: e.equipment,
    notes: e.notes,
    created_at: e.createdAt,
    is_custom: e.isCustom,
    user_id: e.userId,
  };
}

export function exercisePatchToDbRow(patch: Partial<Exercise>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.description !== undefined) row.description = patch.description;
  if ('imageUrl' in patch) row.image_url = patch.imageUrl;
  if ('videoUrl' in patch) row.video_url = patch.videoUrl;
  if (patch.tags !== undefined) row.tags = patch.tags;
  if ('progressionLevel' in patch) row.progression_level = patch.progressionLevel;
  if ('progressionGroupId' in patch) row.progression_group_id = patch.progressionGroupId;
  if ('muscleGroup' in patch) row.muscle_group = patch.muscleGroup;
  if ('equipment' in patch) row.equipment = patch.equipment;
  if ('notes' in patch) row.notes = patch.notes;
  return row;
}

// ── Client ────────────────────────────────────────────────────────────────────

export function dbRowToClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    age: row.age as number | undefined,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    createdAt: row.created_at as string,
    heightCm: row.height_cm as number | undefined,
    weightKg: row.weight_kg as number | undefined,
    fitnessGoal: row.fitness_goal as FitnessGoal | undefined,
    medicalHistory: row.medical_history as string | undefined,
    foodPreferences: row.food_preferences as string | undefined,
    foodDislikes: row.food_dislikes as string | undefined,
    exercisePreferences: row.exercise_preferences as string | undefined,
    exerciseDislikes: row.exercise_dislikes as string | undefined,
    allergies: row.allergies as string | undefined,
    healthAlerts: row.health_alerts as string | undefined,
    generalNotes: row.general_notes as string | undefined,
    trainerMessage: row.trainer_message as string | undefined,
    clientUserId: row.client_user_id as string | undefined,
    invitedAt: row.invited_at as string | undefined,
    inviteAcceptedAt: row.invite_accepted_at as string | undefined,
    subscriptionStartDate: row.subscription_start_date as string | undefined,
    subscriptionEndDate: row.subscription_end_date as string | undefined,
  };
}

export function clientToDbRow(c: Client): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    age: c.age,
    email: c.email,
    phone: c.phone,
    created_at: c.createdAt,
    height_cm: c.heightCm,
    weight_kg: c.weightKg,
    fitness_goal: c.fitnessGoal,
    medical_history: c.medicalHistory,
    food_preferences: c.foodPreferences,
    food_dislikes: c.foodDislikes,
    exercise_preferences: c.exercisePreferences,
    exercise_dislikes: c.exerciseDislikes,
    allergies: c.allergies,
    health_alerts: c.healthAlerts,
    general_notes: c.generalNotes,
    trainer_message: c.trainerMessage,
    subscription_start_date: c.subscriptionStartDate,
    subscription_end_date: c.subscriptionEndDate,
  };
}

export function clientPatchToDbRow(patch: Partial<Omit<Client, 'id' | 'createdAt'>>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if ('age' in patch) row.age = patch.age;
  if ('email' in patch) row.email = patch.email;
  if ('phone' in patch) row.phone = patch.phone;
  if ('heightCm' in patch) row.height_cm = patch.heightCm;
  if ('weightKg' in patch) row.weight_kg = patch.weightKg;
  if ('fitnessGoal' in patch) row.fitness_goal = patch.fitnessGoal;
  if ('medicalHistory' in patch) row.medical_history = patch.medicalHistory;
  if ('foodPreferences' in patch) row.food_preferences = patch.foodPreferences;
  if ('foodDislikes' in patch) row.food_dislikes = patch.foodDislikes;
  if ('exercisePreferences' in patch) row.exercise_preferences = patch.exercisePreferences;
  if ('exerciseDislikes' in patch) row.exercise_dislikes = patch.exerciseDislikes;
  if ('allergies' in patch) row.allergies = patch.allergies;
  if ('healthAlerts' in patch) row.health_alerts = patch.healthAlerts;
  if ('generalNotes' in patch) row.general_notes = patch.generalNotes;
  if ('trainerMessage' in patch) row.trainer_message = patch.trainerMessage;
  if ('subscriptionStartDate' in patch) row.subscription_start_date = patch.subscriptionStartDate;
  if ('subscriptionEndDate' in patch) row.subscription_end_date = patch.subscriptionEndDate;
  return row;
}

export function dbRowToClientCheckIn(row: Record<string, unknown>): ClientCheckIn {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    date: row.date as string,
    weightKg: row.weight_kg as number | undefined,
    bodyFatPct: row.body_fat_pct as number | undefined,
    muscleMassPct: row.muscle_mass_pct as number | undefined,
    waistCm: row.waist_cm as number | undefined,
    chestCm: row.chest_cm as number | undefined,
    hipCm: row.hip_cm as number | undefined,
    thighCm: row.thigh_cm as number | undefined,
    armCm: row.arm_cm as number | undefined,
    mood: row.mood as ClientMood | undefined,
    energyLevel: row.energy_level as number | undefined,
    weeklyNotes: row.weekly_notes as string | undefined,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  };
}

export function clientCheckInToDbRow(c: ClientCheckIn): Record<string, unknown> {
  return {
    id: c.id,
    client_id: c.clientId,
    date: c.date,
    weight_kg: c.weightKg ?? null,
    body_fat_pct: c.bodyFatPct ?? null,
    muscle_mass_pct: c.muscleMassPct ?? null,
    waist_cm: c.waistCm ?? null,
    chest_cm: c.chestCm ?? null,
    hip_cm: c.hipCm ?? null,
    thigh_cm: c.thighCm ?? null,
    arm_cm: c.armCm ?? null,
    mood: c.mood ?? null,
    energy_level: c.energyLevel ?? null,
    weekly_notes: c.weeklyNotes ?? null,
    notes: c.notes ?? null,
    created_at: c.createdAt,
  };
}

// ── Client Progress Photo ─────────────────────────────────────────────────────

export function dbRowToProgressPhoto(row: Record<string, unknown>): ClientProgressPhoto {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    checkInId: row.check_in_id as string | undefined,
    photoPath: row.photo_url as string,
    takenAt: row.taken_at as string,
    caption: row.caption as string | undefined,
    pose: row.pose as ClientProgressPhoto['pose'] | undefined,
    createdAt: row.created_at as string,
  };
}

export function progressPhotoToDbRow(p: ClientProgressPhoto): Record<string, unknown> {
  return {
    id: p.id,
    client_id: p.clientId,
    check_in_id: p.checkInId ?? null,
    photo_url: p.photoPath,
    taken_at: p.takenAt,
    caption: p.caption ?? null,
    pose: p.pose ?? null,
    created_at: p.createdAt,
  };
}

// ── Client Session Log ────────────────────────────────────────────────────────

export function dbRowToSessionLog(row: Record<string, unknown>): ClientSessionLog {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    programId: row.program_id as string | undefined,
    programSessionId: row.program_session_id as string | undefined,
    loggedAt: row.logged_at as string,
    exercises: (row.exercises as LoggedExercise[] | null) ?? [],
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  };
}

export function sessionLogToDbRow(log: ClientSessionLog): Record<string, unknown> {
  return {
    id: log.id,
    client_id: log.clientId,
    program_id: log.programId ?? null,
    program_session_id: log.programSessionId ?? null,
    logged_at: log.loggedAt,
    exercises: log.exercises,
    notes: log.notes ?? null,
    created_at: log.createdAt,
  };
}

// ── Diet Log ──────────────────────────────────────────────────────────────────

export function dbRowToDietLog(row: Record<string, unknown>): DietLog {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    planId: row.plan_id as string,
    dayId: row.day_id as string,
    mealId: row.meal_id as string,
    date: row.date as string,
    eaten: Boolean(row.eaten),
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function dietLogToDbRow(log: DietLog): Record<string, unknown> {
  return {
    id: log.id,
    client_id: log.clientId,
    plan_id: log.planId,
    day_id: log.dayId,
    meal_id: log.mealId,
    date: log.date,
    eaten: log.eaten,
    notes: log.notes ?? null,
    created_at: log.createdAt,
    updated_at: log.updatedAt,
  };
}

// ── Program ───────────────────────────────────────────────────────────────────

export function dbRowToProgram(row: Record<string, unknown>): Program {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    name: row.name as string,
    condition: row.condition as string,
    goal: row.goal as string,
    durationWeeks: row.duration_weeks as number,
    startDate: row.start_date as string,
    sessions: (row.sessions as Program['sessions'] | null) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    userId: row.user_id as string | undefined,
    status: (row.status as PlanItemStatus | undefined) ?? 'active',
  };
}

export function programToDbRow(p: Program): Record<string, unknown> {
  return {
    id: p.id,
    client_id: p.clientId,
    name: p.name,
    condition: p.condition,
    goal: p.goal,
    duration_weeks: p.durationWeeks,
    start_date: p.startDate,
    sessions: p.sessions,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    user_id: p.userId,
    status: p.status ?? 'active',
  };
}

export function programPatchToDbRow(patch: Partial<Program>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.clientId !== undefined) row.client_id = patch.clientId;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.condition !== undefined) row.condition = patch.condition;
  if (patch.goal !== undefined) row.goal = patch.goal;
  if (patch.durationWeeks !== undefined) row.duration_weeks = patch.durationWeeks;
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.sessions !== undefined) row.sessions = patch.sessions;
  if (patch.updatedAt !== undefined) row.updated_at = patch.updatedAt;
  if (patch.status !== undefined) row.status = patch.status;
  return row;
}

// ── Template ──────────────────────────────────────────────────────────────────

export function dbRowToTemplate(row: Record<string, unknown>): Template {
  return {
    id: row.id as string,
    name: row.name as string,
    condition: row.condition as string,
    description: row.description as string | undefined,
    tags: (row.tags as string[] | null) ?? [],
    sessions: (row.sessions as Template['sessions'] | null) ?? [],
    isBuiltIn: row.is_built_in as boolean,
    createdAt: row.created_at as string,
  };
}

export function templateToDbRow(t: Template): Record<string, unknown> {
  return {
    id: t.id,
    name: t.name,
    condition: t.condition,
    description: t.description,
    tags: t.tags,
    sessions: t.sessions,
    is_built_in: t.isBuiltIn,
    created_at: t.createdAt,
  };
}

export function templatePatchToDbRow(patch: Partial<Template>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.condition !== undefined) row.condition = patch.condition;
  if ('description' in patch) row.description = patch.description;
  if (patch.tags !== undefined) row.tags = patch.tags;
  if (patch.sessions !== undefined) row.sessions = patch.sessions;
  if (patch.isBuiltIn !== undefined) row.is_built_in = patch.isBuiltIn;
  return row;
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function dbRowToSettings(row: Record<string, unknown>): AppSettings {
  return {
    profileType: (row.profile_type as ProfileType | undefined) ?? 'physio',
    clinicName: (row.clinic_name as string) ?? '',
    clinicLogo: row.clinic_logo as string | undefined,
    clinicPhone: row.clinic_phone as string | undefined,
    clinicEmail: row.clinic_email as string | undefined,
    clinicAddress: row.clinic_address as string | undefined,
    clinicWebsite: row.clinic_website as string | undefined,
    therapistName: row.therapist_name as string | undefined,
    darkMode: (row.dark_mode as boolean) ?? false,
    whatsappTemplate: row.whatsapp_template as string | undefined,
    emailTemplate: row.email_template as string | undefined,
    emailSubject: row.email_subject as string | undefined,
    favouriteTemplateIds: row.favourite_template_ids as string[] | undefined,
    clinicInstagram: row.clinic_instagram as string | undefined,
    clinicFacebook: row.clinic_facebook as string | undefined,
    clinicGmail: row.clinic_gmail as string | undefined,
    clinicWhatsApp: row.clinic_whatsapp as string | undefined,
    exportTemplateId: row.export_template_id as string | undefined,
    exportTemplateFavorites: (row.export_template_favorites as string[]) ?? [],
    exportPaletteId: row.export_palette_id as string | undefined,
    helpAnnouncements: (row.help_announcements as import('../types').HelpAnnouncement[]) ?? [],
    hiddenExerciseIds: (row.hidden_exercise_ids as string[]) ?? [],
    hiddenFoodIds: (row.hidden_food_ids as string[]) ?? [],
  };
}

export function settingsPatchToDbRow(patch: Partial<AppSettings>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ('profileType' in patch) row.profile_type = patch.profileType;
  if ('clinicName' in patch) row.clinic_name = patch.clinicName;
  if ('clinicLogo' in patch) row.clinic_logo = patch.clinicLogo;
  if ('clinicPhone' in patch) row.clinic_phone = patch.clinicPhone;
  if ('clinicEmail' in patch) row.clinic_email = patch.clinicEmail;
  if ('clinicAddress' in patch) row.clinic_address = patch.clinicAddress;
  if ('clinicWebsite' in patch) row.clinic_website = patch.clinicWebsite;
  if ('therapistName' in patch) row.therapist_name = patch.therapistName;
  if ('darkMode' in patch) row.dark_mode = patch.darkMode;
  if ('whatsappTemplate' in patch) row.whatsapp_template = patch.whatsappTemplate;
  if ('emailTemplate' in patch) row.email_template = patch.emailTemplate;
  if ('emailSubject' in patch) row.email_subject = patch.emailSubject;
  if ('favouriteTemplateIds' in patch) row.favourite_template_ids = patch.favouriteTemplateIds;
  if ('clinicInstagram' in patch) row.clinic_instagram = patch.clinicInstagram;
  if ('clinicFacebook' in patch) row.clinic_facebook = patch.clinicFacebook;
  if ('clinicGmail' in patch) row.clinic_gmail = patch.clinicGmail;
  if ('clinicWhatsApp' in patch) row.clinic_whatsapp = patch.clinicWhatsApp;
  if ('exportTemplateId' in patch) row.export_template_id = patch.exportTemplateId;
  if ('exportTemplateFavorites' in patch) row.export_template_favorites = patch.exportTemplateFavorites;
  if ('exportPaletteId' in patch) row.export_palette_id = patch.exportPaletteId;
  if ('helpAnnouncements' in patch) row.help_announcements = patch.helpAnnouncements;
  if ('hiddenExerciseIds' in patch) row.hidden_exercise_ids = patch.hiddenExerciseIds;
  if ('hiddenFoodIds' in patch) row.hidden_food_ids = patch.hiddenFoodIds;
  return row;
}

export function settingsToDbRow(s: AppSettings): Record<string, unknown> {
  return {
    profile_type: s.profileType ?? 'physio',
    clinic_name: s.clinicName,
    clinic_logo: s.clinicLogo ?? null,
    clinic_phone: s.clinicPhone,
    clinic_email: s.clinicEmail,
    clinic_address: s.clinicAddress,
    clinic_website: s.clinicWebsite,
    therapist_name: s.therapistName,
    dark_mode: s.darkMode,
    whatsapp_template: s.whatsappTemplate,
    email_template: s.emailTemplate,
    email_subject: s.emailSubject,
    favourite_template_ids: s.favouriteTemplateIds,
    clinic_instagram: s.clinicInstagram,
    clinic_facebook: s.clinicFacebook,
    clinic_gmail: s.clinicGmail,
    clinic_whatsapp: s.clinicWhatsApp,
    export_template_id: s.exportTemplateId,
    export_template_favorites: s.exportTemplateFavorites,
    export_palette_id: s.exportPaletteId,
    help_announcements: s.helpAnnouncements,
    hidden_exercise_ids: s.hiddenExerciseIds ?? [],
    hidden_food_ids: s.hiddenFoodIds ?? [],
  };
}

// ── Food Item ─────────────────────────────────────────────────────────────────

export function dbRowToFoodItem(row: Record<string, unknown>): FoodItem {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as FoodCategory,
    servingSize: row.serving_size as number,
    servingUnit: row.serving_unit as string,
    calories: row.calories as number,
    protein: row.protein as number,
    carbs: row.carbs as number,
    fat: row.fat as number,
    fiber: row.fiber as number | undefined,
    sugar: row.sugar as number | undefined,
    sodium: row.sodium as number | undefined,
    notes: row.notes as string | undefined,
    customCategory: row.custom_category as string | undefined,
    gramsPerUnit: row.grams_per_unit as number | undefined,
    isCustom: row.is_custom as boolean,
    createdAt: row.created_at as string,
    userId: row.user_id as string | undefined,
  };
}

export function foodItemToDbRow(f: FoodItem): Record<string, unknown> {
  return {
    id: f.id,
    name: f.name,
    category: f.category,
    serving_size: f.servingSize,
    serving_unit: f.servingUnit,
    calories: f.calories,
    protein: f.protein,
    carbs: f.carbs,
    fat: f.fat,
    fiber: f.fiber,
    sugar: f.sugar,
    sodium: f.sodium,
    notes: f.notes,
    custom_category: f.customCategory ?? null,
    grams_per_unit: f.gramsPerUnit ?? null,
    is_custom: f.isCustom,
    created_at: f.createdAt,
    user_id: f.userId,
  };
}

export function foodItemPatchToDbRow(patch: Partial<FoodItem>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.servingSize !== undefined) row.serving_size = patch.servingSize;
  if (patch.servingUnit !== undefined) row.serving_unit = patch.servingUnit;
  if (patch.calories !== undefined) row.calories = patch.calories;
  if (patch.protein !== undefined) row.protein = patch.protein;
  if (patch.carbs !== undefined) row.carbs = patch.carbs;
  if (patch.fat !== undefined) row.fat = patch.fat;
  if ('fiber' in patch) row.fiber = patch.fiber;
  if ('sugar' in patch) row.sugar = patch.sugar;
  if ('sodium' in patch) row.sodium = patch.sodium;
  if ('notes' in patch) row.notes = patch.notes;
  if ('customCategory' in patch) row.custom_category = patch.customCategory ?? null;
  if ('gramsPerUnit' in patch) row.grams_per_unit = patch.gramsPerUnit ?? null;
  return row;
}

// ── Diet Plan ─────────────────────────────────────────────────────────────────

/** Backfill `dayOfWeek` on diet days whose label matches a weekday name (for plans saved before the field existed). */
function weekdayLabelToIndex(label: string): number | undefined {
  switch (label.trim().toLowerCase()) {
    case 'sunday':    return 0;
    case 'monday':    return 1;
    case 'tuesday':   return 2;
    case 'wednesday': return 3;
    case 'thursday':  return 4;
    case 'friday':    return 5;
    case 'saturday':  return 6;
    default:          return undefined;
  }
}

export function dbRowToDietPlan(row: Record<string, unknown>): DietPlan {
  const rawDays = (row.days as DietPlan['days'] | null) ?? [];
  const days = rawDays.map((d) =>
    d.dayOfWeek === undefined ? { ...d, dayOfWeek: weekdayLabelToIndex(d.label) } : d,
  );
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    name: row.name as string,
    goal: row.goal as string,
    targetCalories: row.target_calories as number | undefined,
    targetProtein: row.target_protein as number | undefined,
    targetCarbs: row.target_carbs as number | undefined,
    targetFat: row.target_fat as number | undefined,
    durationWeeks: row.duration_weeks as number,
    startDate: row.start_date as string,
    days,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    userId: row.user_id as string | undefined,
    status: (row.status as PlanItemStatus | undefined) ?? 'active',
  };
}

export function dietPlanToDbRow(p: DietPlan): Record<string, unknown> {
  return {
    id: p.id,
    client_id: p.clientId,
    name: p.name,
    goal: p.goal,
    target_calories: p.targetCalories,
    target_protein: p.targetProtein,
    target_carbs: p.targetCarbs,
    target_fat: p.targetFat,
    duration_weeks: p.durationWeeks,
    start_date: p.startDate,
    days: p.days,
    notes: p.notes,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    user_id: p.userId,
  };
}

export function dietPlanPatchToDbRow(patch: Partial<DietPlan>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.clientId !== undefined) row.client_id = patch.clientId;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.goal !== undefined) row.goal = patch.goal;
  if ('targetCalories' in patch) row.target_calories = patch.targetCalories;
  if ('targetProtein' in patch) row.target_protein = patch.targetProtein;
  if ('targetCarbs' in patch) row.target_carbs = patch.targetCarbs;
  if ('targetFat' in patch) row.target_fat = patch.targetFat;
  if (patch.durationWeeks !== undefined) row.duration_weeks = patch.durationWeeks;
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.days !== undefined) row.days = patch.days;
  if ('notes' in patch) row.notes = patch.notes;
  if (patch.updatedAt !== undefined) row.updated_at = patch.updatedAt;
  if (patch.status !== undefined) row.status = patch.status;
  return row;
}

// ── Subscription ──────────────────────────────────────────────────────────────

export function dbRowToSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    plan: row.plan as PlanType,
    status: row.status as PlanStatus,
    trialStartedAt: row.trial_started_at as string,
    currentPeriodEnd: row.current_period_end as string | null,
    clientsCreated: (row.clients_created as number) ?? 0,
    createdAt: row.created_at as string,
  };
}
