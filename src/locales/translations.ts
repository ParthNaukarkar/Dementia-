// SmritiNER / NeuroSaathi 4-Language Localization Dictionary
// Covers Assamese (as), Bengali (bn), Hindi (hi), and English (en)

export type SupportedLanguage = 'as' | 'bn' | 'hi' | 'en';

export interface TranslationSchema {
  // Brand & Portal
  appTitle: string;
  caregiverSupport: string;
  patientPortal: string;
  caregiverPortal: string;
  switchPortal: string;
  switchToCaregiver: string;
  switchToPatient: string;
  primaryCaregiver: string;
  navigation: string;

  // Navigation Items
  dashboard: string;
  cognitiveGames: string;
  medications: string;
  dailyRoutine: string;
  alerts: string;
  patientProfile: string;
  settings: string;
  brainAnalytics: string;
  gameLibrary: string;
  todaysWorkout: string;

  // Dashboard Metrics & Headers
  cognitiveScore: string;
  baseline: string;
  aboveBaseline: string;
  belowBaseline: string;
  unplayedExcluded: string;
  gamesPlayedToday: string;
  dailyAdherence: string;
  routineAdherence: string;
  activeAlertsCount: string;
  recentSessions: string;
  sevenDayTrend: string;
  downloadPdf: string;
  viewFullReport: string;
  clinicalSessionReport: string;
  activityFeed: string;
  scoreVsBaseline: string;

  // Patient Profile
  fullName: string;
  age: string;
  gender: string;
  female: string;
  male: string;
  caregiver: string;
  phone: string;
  patientId: string;
  medicalReports: string;
  uploadMonthlyReport: string;
  chooseFile: string;
  noFileChosen: string;
  uploadReport: string;
  previousReports: string;
  download: string;
  clinicalNotes: string;
  emergencyContact: string;
  dementiaStaging: string;
  mocaRange: string;
  attendingPhysician: string;

  // Medications
  addMedication: string;
  editMedication: string;
  deleteMedication: string;
  medicineName: string;
  dosage: string;
  timing: string;
  morning: string;
  afternoon: string;
  evening: string;
  bedtime: string;
  instructions: string;
  prescribedBy: string;
  markTaken: string;
  markPending: string;
  taken: string;
  pending: string;
  noMedications: string;
  save: string;
  cancel: string;
  deleteConfirm: string;
  medicineAdded: string;

  // Daily Routine
  addRoutine: string;
  editRoutine: string;
  deleteRoutine: string;
  activityName: string;
  time: string;
  category: string;
  exercise: string;
  cognitiveCategory: string;
  meal: string;
  rest: string;
  social: string;
  completed: string;
  markCompleted: string;
  noRoutines: string;
  routineAdded: string;

  // Alerts
  systemAlerts: string;
  criticalAlert: string;
  warningAlert: string;
  infoAlert: string;
  noAlerts: string;

  // Settings
  platformSettings: string;
  platformSettingsDesc: string;
  selectLanguage: string;
  soundEffects: string;
  tremorFilter: string;
  highContrast: string;
  syncStatus: string;
  realtimeSyncActive: string;
  portInfo: string;

  // Patient Portal Specific
  greeting: string;
  workoutTitle: string;
  workoutSubtitle: string;
  beginWorkout: string;
  continueWorkout: string;
  workoutCompleted: string;
  dayStreak: string;
  myMedsToday: string;
  myRoutineToday: string;
  allDoneForToday: string;
  calmExercisePrompt: string;

  // Authentication & Login
  login: string;
  logout: string;
  patientLogin: string;
  caregiverLogin: string;
  selectRole: string;
  welcomeBack: string;
  loginAsPatient: string;
  loginAsCaregiver: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationSchema> = {
  // ─── ENGLISH ─────────────────────────────────────────────────────────────
  en: {
    appTitle: 'NeuroSaathi',
    caregiverSupport: 'Caregiver Support',
    patientPortal: 'Patient Portal',
    caregiverPortal: 'Caregiver Portal',
    switchPortal: 'Switch Portal',
    switchToCaregiver: 'Open Caregiver Portal (Port 5174)',
    switchToPatient: 'Open Patient Portal (Port 5173)',
    primaryCaregiver: 'Primary Caregiver',
    navigation: 'Navigation',

    dashboard: 'Dashboard',
    cognitiveGames: 'Cognitive Games',
    medications: 'Medications',
    dailyRoutine: 'Daily Routine',
    alerts: 'Alerts',
    patientProfile: 'Patient Profile',
    settings: 'Settings',
    brainAnalytics: 'Brain Analytics',
    gameLibrary: 'Game Library',
    todaysWorkout: "Today's Workout",

    cognitiveScore: 'Cognitive Score',
    baseline: 'Baseline',
    aboveBaseline: 'Above Baseline',
    belowBaseline: 'Below Baseline',
    unplayedExcluded: 'Unplayed games excluded from composite score',
    gamesPlayedToday: 'Games Played Today',
    dailyAdherence: 'Medications Taken',
    routineAdherence: 'Routine Done',
    activeAlertsCount: 'Active Alerts',
    recentSessions: 'Recent Cognitive Telemetry',
    sevenDayTrend: '7-Day Cognitive Performance',
    downloadPdf: 'Download Clinical PDF Report',
    viewFullReport: 'View Full Session Report',
    clinicalSessionReport: 'Clinical Neuropsychological Session Report',
    activityFeed: 'Daily Activity Feed',
    scoreVsBaseline: 'vs baseline',

    fullName: 'Full Name',
    age: 'Age',
    gender: 'Gender',
    female: 'Female',
    male: 'Male',
    caregiver: 'Caregiver',
    phone: 'Phone',
    patientId: 'Patient ID',
    medicalReports: 'Medical Reports',
    uploadMonthlyReport: 'Upload Monthly Medical Report (PDF)',
    chooseFile: 'Choose file',
    noFileChosen: 'No file chosen',
    uploadReport: 'Upload Report',
    previousReports: 'Previous Uploaded Reports',
    download: 'Download',
    clinicalNotes: 'Physician Notes & Reminiscence History',
    emergencyContact: 'Emergency Contact',
    dementiaStaging: 'Clinical Dementia Staging',
    mocaRange: 'Estimated MoCA Range',
    attendingPhysician: 'Attending Physician',

    addMedication: 'Add Medication',
    editMedication: 'Edit Medication',
    deleteMedication: 'Delete',
    medicineName: 'Medicine Name',
    dosage: 'Dosage',
    timing: 'Timing',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    bedtime: 'Bedtime',
    instructions: 'Clinical Instructions',
    prescribedBy: 'Prescribed By',
    markTaken: 'Mark Taken',
    markPending: 'Mark Pending',
    taken: 'Taken',
    pending: 'Pending',
    noMedications: 'No medications currently scheduled.',
    save: 'Save Medication',
    cancel: 'Cancel',
    deleteConfirm: 'Are you sure you want to delete this medication?',
    medicineAdded: 'Medication updated successfully.',

    addRoutine: 'Add Routine Activity',
    editRoutine: 'Edit Activity',
    deleteRoutine: 'Delete',
    activityName: 'Activity Name',
    time: 'Time',
    category: 'Category',
    exercise: 'Physical Exercise',
    cognitiveCategory: 'Cognitive Therapy',
    meal: 'Meal & Nutrition',
    rest: 'Rest & Relaxation',
    social: 'Family & Social',
    completed: 'Completed',
    markCompleted: 'Mark Completed',
    noRoutines: 'No daily routine activities configured.',
    routineAdded: 'Routine updated successfully.',

    systemAlerts: 'Caregiver Alerts & Observations',
    criticalAlert: 'High Priority Alert',
    warningAlert: 'Clinical Advisory',
    infoAlert: 'Daily Progress Note',
    noAlerts: 'All parameters stable. No urgent alerts.',

    platformSettings: 'Platform Settings & Regionalization',
    platformSettingsDesc: 'Configure language, audio synthesizers, and real-time portal synchronization.',
    selectLanguage: 'Primary Interface Language',
    soundEffects: 'Audio Guidance & Cues',
    tremorFilter: 'Motor Tremor Debounce (400ms)',
    highContrast: 'High Contrast Display',
    syncStatus: 'Cross-Port Real-Time Sync',
    realtimeSyncActive: 'Active (BroadcastChannel & Storage Bridge connected)',
    portInfo: 'Port Status',

    greeting: 'Welcome back',
    workoutTitle: "Today's Brain Workout",
    workoutSubtitle: "Each exercise stimulates a specific cognitive domain. Take your time comfortably.",
    beginWorkout: 'Begin Workout',
    continueWorkout: 'Continue Workout',
    workoutCompleted: 'Workout Complete for Today!',
    dayStreak: 'Day Cognitive Streak',
    myMedsToday: 'My Medicines Today',
    myRoutineToday: 'My Schedule Today',
    allDoneForToday: 'All scheduled exercises finished for today. Wonderful work!',
    calmExercisePrompt: 'Select any game below to play at your own pace.',

    login: 'Log In',
    logout: 'Log Out',
    patientLogin: 'Patient Login',
    caregiverLogin: 'Caregiver Login',
    selectRole: 'Select Portal Access',
    welcomeBack: 'Welcome to SmritiNER',
    loginAsPatient: 'Log In as Patient (Meera Joshi)',
    loginAsCaregiver: 'Log In as Caregiver (Anita Joshi)',
  },

  // ─── ASSAMESE ────────────────────────────────────────────────────────────
  as: {
    appTitle: 'নিউৰোসাথী',
    caregiverSupport: 'যত্নশীল সহায় (Caregiver Support)',
    patientPortal: 'ৰোগী পৰ্টেল (Patient Portal)',
    caregiverPortal: 'যত্নশীল পৰ্টেল (Caregiver Portal)',
    switchPortal: 'পৰ্টেল সলনি কৰক',
    switchToCaregiver: 'যত্নশীল পৰ্টেল খোলক (Port 5174)',
    switchToPatient: 'ৰোগী পৰ্টেল খোলক (Port 5173)',
    primaryCaregiver: 'প্ৰধান যত্নশীল (Primary Caregiver)',
    navigation: 'তালিকা (Navigation)',

    dashboard: 'ডেচবৰ্ড (Dashboard)',
    cognitiveGames: 'জ্ঞানমূলক খেল (Cognitive Games)',
    medications: 'ঔষধসমূহ (Medications)',
    dailyRoutine: 'দৈনন্দিন নিয়ম (Daily Routine)',
    alerts: 'সতৰ্কবাৰ্তা (Alerts)',
    patientProfile: 'ৰোগীৰ পৰিচয় (Patient Profile)',
    settings: 'ছেটিংছ (Settings)',
    brainAnalytics: 'মগজু বিশ্লেষণ (Brain Analytics)',
    gameLibrary: 'খেল সংগ্ৰহ (Game Library)',
    todaysWorkout: 'আজিৰ অনুশীলন (Today\'s Workout)',

    cognitiveScore: 'জ্ঞানমূলক নম্বৰ (Cognitive Score)',
    baseline: 'পূৰ্ব নিৰ্ধাৰিত মান (Baseline)',
    aboveBaseline: 'মানতকৈ উন্নত',
    belowBaseline: 'মানতকৈ কম',
    unplayedExcluded: 'নেখেলা খেলসমূহ গণনাৰ পৰা বাদ দিয়া হৈছে',
    gamesPlayedToday: 'আজি খেলা খেলসমূহ',
    dailyAdherence: 'খোৱা ঔষধ',
    routineAdherence: 'সম্পূৰ্ণ নিয়ম',
    activeAlertsCount: 'সক্ৰিয় সতৰ্কতা',
    recentSessions: 'শেহতীয়া বিশ্লেষণ তথ্য',
    sevenDayTrend: '৭ দিনৰ মগজুৰ অগ্ৰগতি',
    downloadPdf: 'চিকিৎসা PDF প্ৰতিবেদন ডাউনল\'ড কৰক',
    viewFullReport: 'সম্পূৰ্ণ প্ৰতিবেদন চাওক',
    clinicalSessionReport: 'চিকিৎসা বিজ্ঞান সন্মত সবিশেষ প্ৰতিবেদন',
    activityFeed: 'দৈনিক কাৰ্যসূচীৰ বিৱৰণ',
    scoreVsBaseline: 'মানৰ তুলনাত',

    fullName: 'সম্পূৰ্ণ নাম',
    age: 'বয়স',
    gender: 'লিংগ',
    female: 'মহিলা',
    male: 'পুৰুষ',
    caregiver: 'যত্নশীল',
    phone: 'ফোন নম্বৰ',
    patientId: 'ৰোগী আই.ডি.',
    medicalReports: 'চিকিৎসা প্ৰতিবেদন (Medical Reports)',
    uploadMonthlyReport: 'মাহেকীয়া চিকিৎসা প্ৰতিবেদন আপল\'ড কৰক (PDF)',
    chooseFile: 'নথি নিৰ্বাচন কৰক',
    noFileChosen: 'কোনো নথি নিৰ্বাচন কৰা নাই',
    uploadReport: 'প্ৰতিবেদন আপল\'ড কৰক',
    previousReports: 'পূৰ্বতে আপল\'ড কৰা প্ৰতিবেদনসমূহ',
    download: 'ডাউনল\'ড',
    clinicalNotes: 'চিকিৎসকৰ মন্তব্য আৰু পুৰণি স্মৃতি',
    emergencyContact: 'জৰুৰীকালীন যোগাযোগ',
    dementiaStaging: 'ডিমেনচিয়াৰ পৰ্যায়',
    mocaRange: 'সম্ভাব্য MoCA নম্বৰ',
    attendingPhysician: 'দায়িত্বপ্ৰাপ্ত চিকিৎসক',

    addMedication: 'নতুন ঔষধ যোগ কৰক',
    editMedication: 'ঔষধ সম্পাদনা কৰক',
    deleteMedication: 'মচি পেলাওক',
    medicineName: 'ঔষধৰ নাম',
    dosage: 'পৰিমাণ (Dosage)',
    timing: 'সময়সূচী',
    morning: 'ৰাতিপুৱা',
    afternoon: 'দুপৰীয়া',
    evening: 'গধূলি',
    bedtime: 'শুবৰ সময়ত',
    instructions: 'ব্যৱহাৰ বিধি',
    prescribedBy: 'পৰামৰ্শদাতা চিকিৎসক',
    markTaken: 'খোৱা বুলি চিহ্নিত কৰক',
    markPending: 'বাকী বুলি চিহ্নিত কৰক',
    taken: 'খোৱা হ\'ল',
    pending: 'বাকী আছে',
    noMedications: 'কোনো ঔষধৰ তালিকা নাই।',
    save: 'সংৰক্ষণ কৰক',
    cancel: 'বাতিল কৰক',
    deleteConfirm: 'আপুনি এই ঔষধটো মচি পেলাব বিচাৰে নেকি?',
    medicineAdded: 'ঔষধ সফলতাৰে সংৰক্ষণ কৰা হ\'ল।',

    addRoutine: 'নতুন কাৰ্যসূচী যোগ কৰক',
    editRoutine: 'কাৰ্যসূচী সম্পাদনা কৰক',
    deleteRoutine: 'মচি পেলাওক',
    activityName: 'কাৰ্যৰ নাম',
    time: 'নিৰ্ধাৰিত সময়',
    category: 'শ্ৰেণী',
    exercise: 'শাৰীৰিক ব্যায়াম',
    cognitiveCategory: 'জ্ঞানমূলক থেরাপী',
    meal: 'আহাৰ আৰু পুষ্টি',
    rest: 'বিৰতি আৰু জিৰণি',
    social: 'পাৰিবাৰিক আৰু সামাজিক',
    completed: 'সম্পূৰ্ণ',
    markCompleted: 'সম্পূৰ্ণ বুলি চিহ্নিত কৰক',
    noRoutines: 'কোনো দৈনন্দিন কাৰ্যসূচী নাই।',
    routineAdded: 'কাৰ্যসূচী সফলতাৰে সংৰক্ষণ কৰা হ\'ল।',

    systemAlerts: 'সতৰ্কবাৰ্তা আৰু পৰ্যবেক্ষণসমূহ',
    criticalAlert: 'জৰুৰী সতৰ্কবাৰ্তা',
    warningAlert: 'সতৰ্কতামূলক পৰামৰ্শ',
    infoAlert: 'দৈনিক অগ্ৰগতিৰ টোকা',
    noAlerts: 'সকলো স্বাভাৱিক আছে। কোনো জৰুৰী সতৰ্কবাৰ্তা নাই।',

    platformSettings: 'প্লেটফৰ্ম ছেটিংছ আৰু ভাষা নিৰ্বাচন',
    platformSettingsDesc: 'ভাষা, মাতৰ নিৰ্দেশনা আৰু দুই পৰ্টেলৰ সংযোগ নিয়ন্ত্ৰণ কৰক।',
    selectLanguage: 'প্ৰাথমিক ভাষা বাছক',
    soundEffects: 'শব্দ আৰু নিৰ্দেশনা',
    tremorFilter: 'হাত কঁপনি ফিল্টাৰ (৪০০ মি.ছে.)',
    highContrast: 'উচ্চ স্পষ্টতা দৃশ্য (High Contrast)',
    syncStatus: 'ৰিয়েল-টাইম সংযোগ অৱস্থা',
    realtimeSyncActive: 'সক্ৰিয় (দুয়োটা পৰ্টেল সংযুক্ত)',
    portInfo: 'পৰ্ট স্থিতি',

    greeting: 'নমস্কাৰ',
    workoutTitle: 'আজিৰ মানসিক অনুশীলন',
    workoutSubtitle: 'প্ৰতিটো খেলে মগজুৰ বিশেষ অংশ সজীৱ কৰে। শান্তভাৱে খেলক।',
    beginWorkout: 'অনুশীলন আৰম্ভ কৰক',
    continueWorkout: 'অনুশীলন চলাই যাওক',
    workoutCompleted: 'আজিৰ অনুশীলন সম্পূৰ্ণ হ\'ল!',
    dayStreak: 'দিনৰ নিয়মীয়া ধাৰা',
    myMedsToday: 'আজিৰ ঔষধসমূহ',
    myRoutineToday: 'আজিৰ কামৰ তালিকা',
    allDoneForToday: 'আজিৰ বাবে সকলো অনুশীলন শেষ হ\'ল। খুব ভাল কাম কৰিলে!',
    calmExercisePrompt: 'তলৰ যিকোনো খেল নিজৰ সুবিধা অনুসৰি খেলিব পাৰে।',

    login: 'লগ ইন',
    logout: 'লগ আউট',
    patientLogin: 'ৰোগীৰ প্ৰৱেশ (Patient Login)',
    caregiverLogin: 'যত্নশীলৰ প্ৰৱেশ (Caregiver Login)',
    selectRole: 'পৰ্টেল বাছনি কৰক',
    welcomeBack: 'স্মৃতি-NER লৈ স্বাগতম',
    loginAsPatient: 'ৰোগী হিচাপে প্ৰৱেশ (মীৰা যোশী)',
    loginAsCaregiver: 'যত্নশীল হিচাপে প্ৰৱেশ (অনিতা যোশী)',
  },

  // ─── BENGALI ─────────────────────────────────────────────────────────────
  bn: {
    appTitle: 'নিউরোসাথী',
    caregiverSupport: 'কেয়ারগিভার সাপোর্ট (Caregiver Support)',
    patientPortal: 'পেশেন্ট পোর্টাল (Patient Portal)',
    caregiverPortal: 'কেয়ারগিভার পোর্টাল (Caregiver Portal)',
    switchPortal: 'পোর্টাল পরিবর্তন করুন',
    switchToCaregiver: 'কেয়ারগিভার পোর্টাল খুলুন (Port 5174)',
    switchToPatient: 'পেশেন্ট পোর্টাল খুলুন (Port 5173)',
    primaryCaregiver: 'প্রধান পরিচর্যাকারী',
    navigation: 'মেনু তালিকা',

    dashboard: 'ড্যাশবোর্ড (Dashboard)',
    cognitiveGames: 'জ্ঞানমূলক খেলা (Cognitive Games)',
    medications: 'ওষুধের তালিকা (Medications)',
    dailyRoutine: 'দৈনন্দিন রুটিন (Daily Routine)',
    alerts: 'সতর্কবার্তা (Alerts)',
    patientProfile: 'রোগীর প্রোফাইল (Patient Profile)',
    settings: 'সেটিংস (Settings)',
    brainAnalytics: 'মস্তিষ্ক বিশ্লেষণ (Brain Analytics)',
    gameLibrary: 'খেলার লাইব্রেরি (Game Library)',
    todaysWorkout: 'আজকের অনুশীলন (Today\'s Workout)',

    cognitiveScore: 'কগনিটিভ স্কোর (Cognitive Score)',
    baseline: 'বেসলাইন মান (Baseline)',
    aboveBaseline: 'বেসলাইনের চেয়ে ভালো',
    belowBaseline: 'বেসলাইনের চেয়ে কম',
    unplayedExcluded: 'না খেলা গেমগুলি মোট স্কোর থেকে বাদ রাখা হয়েছে',
    gamesPlayedToday: 'আজকে খেলা গেমগুলি',
    dailyAdherence: 'নেওয়া ওষুধ',
    routineAdherence: 'সম্পন্ন রুটিন',
    activeAlertsCount: 'সক্রিয় সতর্কতা',
    recentSessions: 'সাম্প্রতিক সেশন রিপোর্ট',
    sevenDayTrend: '৭ দিনের মানসিক অগ্রগতি',
    downloadPdf: 'ক্লিনিকাল PDF রিপোর্ট ডাউনলোড',
    viewFullReport: 'সম্পূর্ণ সেশন রিপোর্ট দেখুন',
    clinicalSessionReport: 'ক্লিনিকাল নিউরোসাইকোলজিকাল সেশন রিপোর্ট',
    activityFeed: 'দৈনিক কার্যক্রমের তালিকা',
    scoreVsBaseline: 'বেসলাইনের তুলনায়',

    fullName: 'পুরো নাম',
    age: 'বয়স',
    gender: 'লিঙ্গ',
    female: 'মহিলা',
    male: 'পুরুষ',
    caregiver: 'পরিচর্যাকারী',
    phone: 'ফোন নম্বর',
    patientId: 'রোগীর আইডি',
    medicalReports: 'মেডিকেল রিপোর্ট (Medical Reports)',
    uploadMonthlyReport: 'মাসিক মেডিকেল রিপোর্ট আপলোড করুন (PDF)',
    chooseFile: 'ফাইল বেছে নিন',
    noFileChosen: 'কোনো ফাইল বাছা হয়নি',
    uploadReport: 'রিপোর্ট আপলোড করুন',
    previousReports: 'পূর্ববর্তী আপলোড করা রিপোর্ট',
    download: 'ডাউনলোড',
    clinicalNotes: 'চিকিৎসকের মন্তব্য ও স্মৃতি রোমন্থন',
    emergencyContact: 'জরুরী যোগাযোগ',
    dementiaStaging: 'ডিমেনশিয়ার পর্যায়',
    mocaRange: 'সম্ভাব্য MoCA স্কোর রেঞ্জ',
    attendingPhysician: 'দায়িত্বপ্রাপ্ত চিকিৎসক',

    addMedication: 'নতুন ওষুধ যুক্ত করুন',
    editMedication: 'ওষুধ সম্পাদনা করুন',
    deleteMedication: 'মুছে ফেলুন',
    medicineName: 'ওষুধের নাম',
    dosage: 'মাত্রা (Dosage)',
    timing: 'সময়',
    morning: 'সকাল',
    afternoon: 'দুপুর',
    evening: 'সন্ধ্যা',
    bedtime: 'শোবার আগে',
    instructions: 'ব্যবহারের নির্দেশিকা',
    prescribedBy: 'প্রেসক্রাইবার চিকিৎসক',
    markTaken: 'নেওয়া হয়েছে হিসেবে চিহ্নিত করুন',
    markPending: 'বাকি হিসেবে চিহ্নিত করুন',
    taken: 'নেওয়া হয়েছে',
    pending: 'বাকি আছে',
    noMedications: 'কোনো ওষুধের তালিকা নেই।',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল করুন',
    deleteConfirm: 'আপনি কি নিশ্চিত এই ওষুধটি মুছে ফেলতে চান?',
    medicineAdded: 'ওষুধ সফলভাবে সংরক্ষিত হয়েছে।',

    addRoutine: 'নতুন রুটিন যুক্ত করুন',
    editRoutine: 'রুটিন সম্পাদনা করুন',
    deleteRoutine: 'মুছে ফেলুন',
    activityName: 'কাজের নাম',
    time: 'সময়',
    category: 'বিভাগ',
    exercise: 'শারীরিক ব্যায়াম',
    cognitiveCategory: 'জ্ঞানমূলক থেরাপি',
    meal: 'খাবার ও পুষ্টি',
    rest: 'বিশ্রাম ও ঘুম',
    social: 'পারিবারিক ও সামাজিক মেলবন্ধন',
    completed: 'সম্পন্ন',
    markCompleted: 'সম্পন্ন হয়েছে হিসেবে চিহ্নিত করুন',
    noRoutines: 'কোনো দৈনন্দিন রুটিন পাওয়া যায়নি।',
    routineAdded: 'রুটিন সফলভাবে সংরক্ষিত হয়েছে।',

    systemAlerts: 'সতর্কতা ও পর্যবেক্ষণ',
    criticalAlert: 'জরুরী সতর্কতা',
    warningAlert: 'সতর্কতামূলক পরামর্শ',
    infoAlert: 'অগ্রগতির বিবরণ',
    noAlerts: 'সবকিছু স্থিতিশীল। কোনো জরুরী সতর্কতা নেই।',

    platformSettings: 'প্ল্যাটফর্ম সেটিংস ও ভাষা',
    platformSettingsDesc: 'ভাষা, ভয়েস নির্দেশনা এবং দুই পোর্টালের সিঙ্ক কনফিগার করুন।',
    selectLanguage: 'ইন্টারফেস ভাষা নির্বাচন করুন',
    soundEffects: 'অডিও সাউন্ড ও নির্দেশিকা',
    tremorFilter: 'হাত কাঁপুনি ফিল্টার (৪০০ মি.সে.)',
    highContrast: 'উচ্চ কনট্রাস্ট ডিসপ্লে',
    syncStatus: 'রিয়েল-টাইম পোর্টাল সিঙ্ক',
    realtimeSyncActive: 'সক্রিয় (উভয় পোর্টাল সংযুক্ত)',
    portInfo: 'পোর্ট স্ট্যাটাস',

    greeting: 'স্বাগতম',
    workoutTitle: 'আজকের ব্রেন ওয়ার্কআউট',
    workoutSubtitle: 'প্রতিটি ব্যায়াম মস্তিষ্কের একটি নির্দিষ্ট অংশ সক্রিয় করে। ধীরে সুস্থে খেলুন।',
    beginWorkout: 'ওয়ার্কআউট শুরু করুন',
    continueWorkout: 'অনুশীলন চালিয়ে যান',
    workoutCompleted: 'আজকের অনুশীলন সমাপ্ত!',
    dayStreak: 'দিনের স্ট্রিক',
    myMedsToday: 'আজকের ওষুধ',
    myRoutineToday: 'আজকের রুটিন',
    allDoneForToday: 'আজকের সমস্ত মানসিক ব্যায়াম সম্পন্ন হয়েছে। দুর্দান্ত কাজ!',
    calmExercisePrompt: 'নিচের যে কোনো খেলা আপনার সুবিধামত বেছে নিয়ে খেলুন।',

    login: 'লগ ইন',
    logout: 'লগ আউট',
    patientLogin: 'রোগীর প্রবেশ (Patient Login)',
    caregiverLogin: 'কেয়ারগিভারের প্রবেশ (Caregiver Login)',
    selectRole: 'পোর্টাল নির্বাচন করুন',
    welcomeBack: 'স্মৃতি-NER এ স্বাগতম',
    loginAsPatient: 'রোগী হিসেবে প্রবেশ (মীরা জোশী)',
    loginAsCaregiver: 'কেয়ারগিভার হিসেবে প্রবেশ (অনিতা জোশী)',
  },

  // ─── HINDI ───────────────────────────────────────────────────────────────
  hi: {
    appTitle: 'न्यूरोसाथी',
    caregiverSupport: 'देखभालकर्ता सहायता (Caregiver Support)',
    patientPortal: 'मरीज पोर्टल (Patient Portal)',
    caregiverPortal: 'देखभालकर्ता पोर्टल (Caregiver Portal)',
    switchPortal: 'पोर्टल बदलें',
    switchToCaregiver: 'देखभालकर्ता पोर्टल खोलें (Port 5174)',
    switchToPatient: 'मरीज पोर्टल खोलें (Port 5173)',
    primaryCaregiver: 'प्राथमिक देखभालकर्ता',
    navigation: 'नेविगेशन',

    dashboard: 'डैशबोर्ड (Dashboard)',
    cognitiveGames: 'संज्ञानात्मक खेल (Cognitive Games)',
    medications: 'दवाइयां (Medications)',
    dailyRoutine: 'दैनिक दिनचर्या (Daily Routine)',
    alerts: 'अलर्ट व चेतावनियां (Alerts)',
    patientProfile: 'मरीज प्रोफ़ाइल (Patient Profile)',
    settings: 'सेटिंग्स (Settings)',
    brainAnalytics: 'मस्तिष्क विश्लेषण (Brain Analytics)',
    gameLibrary: 'गेम लाइब्रेरी (Game Library)',
    todaysWorkout: 'आज का अभ्यास (Today\'s Workout)',

    cognitiveScore: 'संज्ञानात्मक स्कोर (Cognitive Score)',
    baseline: 'आधारभूत स्तर (Baseline)',
    aboveBaseline: 'आधारभूत स्तर से बेहतर',
    belowBaseline: 'आधारभूत स्तर से नीचे',
    unplayedExcluded: 'न खेले गए खेलों को समग्र स्कोर से बाहर रखा गया है',
    gamesPlayedToday: 'आज खेले गए खेल',
    dailyAdherence: 'ली गई दवाएं',
    routineAdherence: 'पूरी दिनचर्या',
    activeAlertsCount: 'सक्रिय चेतावनियां',
    recentSessions: 'हालिया संज्ञानात्मक विश्लेषण',
    sevenDayTrend: '७-दिवसीय संज्ञानात्मक प्रदर्शन',
    downloadPdf: 'चिकित्सीय PDF रिपोर्ट डाउनलोड करें',
    viewFullReport: 'पूरी सत्र रिपोर्ट देखें',
    clinicalSessionReport: 'चिकित्सीय न्यूरोसाइकोलॉजिकल सत्र रिपोर्ट',
    activityFeed: 'दैनिक गतिविधि विवरण',
    scoreVsBaseline: 'आधारभूत की तुलना में',

    fullName: 'पूरा नाम',
    age: 'आयु',
    gender: 'लिंग',
    female: 'महिला',
    male: 'पुरुष',
    caregiver: 'देखभालकर्ता',
    phone: 'फ़ोन नंबर',
    patientId: 'मरीज आईडी',
    medicalReports: 'चिकित्सा रिपोर्ट (Medical Reports)',
    uploadMonthlyReport: 'मासिक चिकित्सा रिपोर्ट अपलोड करें (PDF)',
    chooseFile: 'फ़ाइल चुनें',
    noFileChosen: 'कोई फ़ाइल नहीं चुनी गई',
    uploadReport: 'रिपोर्ट अपलोड करें',
    previousReports: 'पहले अपलोड की गई रिपोर्टें',
    download: 'डाउनलोड',
    clinicalNotes: 'चिकित्सक टिप्पणियां व स्मृति इतिहास',
    emergencyContact: 'आपातकालीन संपर्क',
    dementiaStaging: 'डिमेंशिया की अवस्था',
    mocaRange: 'अनुमानित MoCA स्कोर श्रेणी',
    attendingPhysician: 'उपचारक चिकित्सक',

    addMedication: 'नई दवा जोड़ें',
    editMedication: 'दवा संपादित करें',
    deleteMedication: 'हटाएं',
    medicineName: 'दवा का नाम',
    dosage: 'मात्रा (Dosage)',
    timing: 'समय',
    morning: 'सुबह',
    afternoon: 'दोपहर',
    evening: 'शाम',
    bedtime: 'सोने से पहले',
    instructions: 'चिकित्सीय निर्देश',
    prescribedBy: 'परामर्शदाता डॉक्टर',
    markTaken: 'ली गई के रूप में चिह्नित करें',
    markPending: 'लंबित के रूप में चिह्नित करें',
    taken: 'ली गई',
    pending: 'लंबित',
    noMedications: 'वर्तमान में कोई दवा निर्धारित नहीं है।',
    save: 'दवा सहेजें',
    cancel: 'रद्द करें',
    deleteConfirm: 'क्या आप वाकई इस दवा को हटाना चाहते हैं?',
    medicineAdded: 'दवा सफलतापूर्वक सहेजी गई।',

    addRoutine: 'नई दिनचर्या गतिविधि जोड़ें',
    editRoutine: 'गतिविधि संपादित करें',
    deleteRoutine: 'हटाएं',
    activityName: 'गतिविधि का नाम',
    time: 'समय',
    category: 'श्रेणी',
    exercise: 'शारीरिक व्यायाम',
    cognitiveCategory: 'संज्ञानात्मक थेरेपी',
    meal: 'भोजन एवं पोषण',
    rest: 'विश्राम व शांति',
    social: 'पारिवारिक व सामाजिक',
    completed: 'पूर्ण',
    markCompleted: 'पूर्ण के रूप में चिह्नित करें',
    noRoutines: 'कोई दैनिक गतिविधि निर्धारित नहीं है।',
    routineAdded: 'दिनचर्या सफलतापूर्वक सहेजी गई।',

    systemAlerts: 'देखभालकर्ता अलर्ट व अवलोकन',
    criticalAlert: 'उच्च प्राथमिकता चेतावनी',
    warningAlert: 'चिकित्सीय परामर्श',
    infoAlert: 'दैनिक प्रगति नोट',
    noAlerts: 'सभी स्वास्थ्य मानक स्थिर हैं। कोई आपातकालीन चेतावनी नहीं।',

    platformSettings: 'प्लेटफ़ॉर्म सेटिंग्स एवं भाषा',
    platformSettingsDesc: 'भाषा, ध्वनि मार्गदर्शन और दोहरे पोर्टल का रीयल-टाइम समन्वय प्रबंधित करें।',
    selectLanguage: 'प्राथमिक इंटरफ़ेस भाषा चुनें',
    soundEffects: 'ऑडियो मार्गदर्शन व संकेत',
    tremorFilter: 'कंपन नियंत्रण फ़िल्टर (४०० मि.से.)',
    highContrast: 'उच्च कंट्रास्ट दृश्य',
    syncStatus: 'रीयल-टाइम पोर्टल सिंक स्थिति',
    realtimeSyncActive: 'सक्रिय (दोनों पोर्टल जुड़े हुए हैं)',
    portInfo: 'पोर्ट स्थिति',

    greeting: 'नमस्ते',
    workoutTitle: 'आज का मानसिक व्यायाम',
    workoutSubtitle: 'प्रत्येक खेल मस्तिष्क के एक विशेष हिस्से को सक्रिय करता है। बिना किसी जल्दबाजी के खेलें।',
    beginWorkout: 'अभ्यास शुरू करें',
    continueWorkout: 'अभ्यास जारी रखें',
    workoutCompleted: 'आज का अभ्यास पूर्ण हुआ!',
    dayStreak: 'दिनों का नियमित क्रम',
    myMedsToday: 'आज की दवाइयां',
    myRoutineToday: 'आज की दिनचर्या',
    allDoneForToday: 'आज के सभी निर्धारित मानसिक अभ्यास समाप्त हो चुके हैं। बहुत खूब!',
    calmExercisePrompt: 'नीचे दिए गए किसी भी खेल को अपनी गति से खेलें।',

    login: 'लॉग इन',
    logout: 'लॉग आउट',
    patientLogin: 'मरीज लॉगिन (Patient Login)',
    caregiverLogin: 'देखभालकर्ता लॉगिन (Caregiver Login)',
    selectRole: 'पोर्टल चुनें',
    welcomeBack: 'स्मृति-NER में आपका स्वागत है',
    loginAsPatient: 'मरीज के रूप में प्रवेश (मीरा जोशी)',
    loginAsCaregiver: 'देखभालकर्ता के रूप में प्रवेश (अनीता जोशी)',
  }
};

export function getTranslation(lang: SupportedLanguage = 'en'): TranslationSchema {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
