export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
  },

  // Auth
  auth: {
    signIn: 'Sign In',
    signOut: 'Sign Out',
    email: 'Email',
    emailPlaceholder: 'your-email@example.com',
    sendMagicLink: 'Send Magic Link',
    checkEmail: 'Check your email for a magic link',
    whitelistError: 'Access restricted. Your email is not on the allowed list. Contact the administrator for access.',
  },

  // Header
  header: {
    title: '52 Weeks🚀',
    signOut: 'Sign Out',
  },

  // Year Progress
  yearProgress: {
    week: 'Week',
    of: 'of',
    yearComplete: 'of the year complete',
  },

  // Navigation
  nav: {
    year: 'Year',
    quarter: 'Quarter',
    week: 'Week',
    backToYear: '← Back to Year',
    backToQuarter: '← Back to Quarter',
  },

  // Year View
  year: {
    weeks: 'weeks',
    currentYear: 'Current Year',
    previousYear: '← {{year}}',
    nextYear: '{{year}} →',
  },

  // Quarter View
  quarter: {
    q1: 'Q1',
    q2: 'Q2',
    q3: 'Q3',
    q4: 'Q4',
    weeks: 'Weeks {{start}}–{{end}}',
    openQuarter: 'Open Quarter →',
  },

  // Week View
  week: {
    title: 'Week {{number}}',
    currentWeek: 'Current Week',
    previous: '← Previous',
    next: 'Next →',
    notFound: 'Week not found',
    openConsole: 'Open browser console (F12) for details',
  },

  // Week Focus
  weekFocus: {
    title: 'Week Focus',
    placeholder: 'What are the main goals for this week?\n\n++ Complete task\n+- In progress\nImportant note',
    tasksCount_one: '{{count}} task',
    tasksCount_other: '{{count}} tasks',
    expand: 'Expand',
    collapse: 'Collapse',
  },

  // Day Card
  day: {
    today: 'Today',
    expand: 'Expand',
    collapse: 'Collapse',
    placeholder: 'What needs to be done today?\n\n++ Completed\n+- In progress\n10:00 Meeting',
    tasksCount_zero: 'No tasks',
    tasksCount_one: '{{count}} task',
    tasksCount_other: '{{count}} tasks',
    completedCount: '{{completed}} of {{total}} completed',
  },

  // Days of week
  days: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
  },

  // Login Page
  login: {
    title: '52 Weeks 🚀',
    subtitle: 'Weekly planning with focus on simplicity',
    emailLabel: 'Email address',
    signInButton: 'Get Code',
    checkEmailOtpTitle: 'Enter the code',
    checkEmailOtpMessage: 'We sent a 6-digit code to {{email}}',
    otpLabel: 'Verification code',
    otpPlaceholder: '000000',
    verifyButton: 'Verify',
    backButton: '← Back',
    wrongCode: 'Invalid code. Please try again.',
    expiredCode: 'Code expired. Request a new one.',
    features: {
      focus: 'Focus on one week at a time',
      simple: 'Simple text-based input',
      sync: 'Automatic sync across devices',
    },
  },

  // Errors
  errors: {
    generic: 'Something went wrong',
    network: 'Network error. Check your connection.',
    unauthorized: 'User not authorized',
    notFound: 'Not found',
  },
}

export type Translation = typeof en
