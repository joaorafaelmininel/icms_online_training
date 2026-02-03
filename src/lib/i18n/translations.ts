// src/lib/i18n/translations.ts
// Static UI translations (texts not from database)

import type { BilingualText } from '@/lib/types/database';

// ==========================================
// COMMON / GENERAL
// ==========================================

export const common = {
  loading: { en: 'Loading...', es: 'Cargando...' } as BilingualText,
  save: { en: 'Save', es: 'Guardar' } as BilingualText,
  cancel: { en: 'Cancel', es: 'Cancelar' } as BilingualText,
  edit: { en: 'Edit', es: 'Editar' } as BilingualText,
  delete: { en: 'Delete', es: 'Eliminar' } as BilingualText,
  confirm: { en: 'Confirm', es: 'Confirmar' } as BilingualText,
  back: { en: 'Back', es: 'Volver' } as BilingualText,
  next: { en: 'Next', es: 'Siguiente' } as BilingualText,
  previous: { en: 'Previous', es: 'Anterior' } as BilingualText,
  continue: { en: 'Continue', es: 'Continuar' } as BilingualText,
  submit: { en: 'Submit', es: 'Enviar' } as BilingualText,
  close: { en: 'Close', es: 'Cerrar' } as BilingualText,
  search: { en: 'Search', es: 'Buscar' } as BilingualText,
  learnMore: { en: 'Learn More', es: 'Saber Más' } as BilingualText,
  enrollNow: { en: 'Enroll Now', es: 'Inscribirse Ahora' } as BilingualText,
  getStarted: { en: 'Get Started', es: 'Comenzar' } as BilingualText,
};

// ==========================================
// AUTH
// ==========================================

export const auth = {
  signIn: { en: 'Sign In', es: 'Iniciar Sesión' } as BilingualText,
  signUp: { en: 'Sign Up', es: 'Registrarse' } as BilingualText,
  signInSignUp: { en: 'Sign In | Sign Up', es: 'Iniciar Sesión | Registrarse' } as BilingualText,
  logout: { en: 'Logout', es: 'Cerrar Sesión' } as BilingualText,
  email: { en: 'Email', es: 'Correo Electrónico' } as BilingualText,
  password: { en: 'Password', es: 'Contraseña' } as BilingualText,
  confirmPassword: { en: 'Confirm Password', es: 'Confirmar Contraseña' } as BilingualText,
  forgotPassword: { en: 'Forgot your password?', es: '¿Olvidaste tu contraseña?' } as BilingualText,
  resetPassword: { en: 'Reset Password', es: 'Restablecer Contraseña' } as BilingualText,
  createAccount: { en: 'Create account', es: 'Crear cuenta' } as BilingualText,
  welcomeBack: { en: 'Welcome back!', es: '¡Bienvenido de nuevo!' } as BilingualText,
  welcomeMessage: { en: 'Please enter your credentials', es: 'Por favor ingresa tus credenciales' } as BilingualText,
  joinPlatform: { en: 'Join the Online INSARAG Training Platform', es: 'Únete a la Plataforma de Capacitación en Línea de INSARAG' } as BilingualText,
  backToHome: { en: 'Back to home', es: 'Volver al inicio' } as BilingualText,
  termsAgree: { en: 'I accept the Terms of Use', es: 'Acepto los Términos de Uso' } as BilingualText,
  signingIn: { en: 'Signing in...', es: 'Iniciando sesión...' } as BilingualText,
  creatingAccount: { en: 'Creating account...', es: 'Creando cuenta...' } as BilingualText,
};

// ==========================================
// LANDING PAGE
// ==========================================

export const landing = {
  heroTitle: { 
    en: 'INSARAG Online Training Platform', 
    es: 'Plataforma de Capacitación en Línea INSARAG' 
  } as BilingualText,
  heroSubtitle: { 
    en: 'ICMS 3.0 Online Training Platform', 
    es: 'Plataforma de Capacitación en Línea ICMS 3.0' 
  } as BilingualText,
  heroCta: { 
    en: 'Access your training', 
    es: 'Accede a tu capacitación' 
  } as BilingualText,
  aboutTitle: { 
    en: 'About the Training', 
    es: 'Sobre la Capacitación' 
  } as BilingualText,
  modulesTitle: { 
    en: 'Course Modules', 
    es: 'Módulos del Curso' 
  } as BilingualText,
  objectivesTitle: { 
    en: 'Learning Objectives', 
    es: 'Objetivos de Aprendizaje' 
  } as BilingualText,
  requirementsTitle: { 
    en: 'Requirements', 
    es: 'Requisitos' 
  } as BilingualText,
  statsTitle: { 
    en: 'About INSARAG', 
    es: 'Sobre INSARAG' 
  } as BilingualText,
  yearsOfExcellence: { 
    en: 'Years of Excellence', 
    es: 'Años de Excelencia' 
  } as BilingualText,
  memberTeams: { 
    en: 'Member Teams', 
    es: 'Equipos Miembro' 
  } as BilingualText,
  countries: { 
    en: 'Countries', 
    es: 'Países' 
  } as BilingualText,
  certifiedProfessionals: {
    en: 'Certified Professionals',
    es: 'Profesionales Certificados'
  } as BilingualText,
  duration: { en: 'Duration', es: 'Duración' } as BilingualText,
  format: { en: 'Format', es: 'Formato' } as BilingualText,
  language: { en: 'Language', es: 'Idioma' } as BilingualText,
  certificate: { en: 'Certificate', es: 'Certificado' } as BilingualText,
  durationValue: { 
    en: '8 hours of comprehensive training', 
    es: '8 horas de capacitación integral' 
  } as BilingualText,
  formatValue: { 
    en: '11 modules • Self-paced online', 
    es: '11 módulos • En línea a tu propio ritmo' 
  } as BilingualText,
  languageValue: { 
    en: 'Available in English and Spanish', 
    es: 'Disponible en inglés y español' 
  } as BilingualText,
  certificateValue: { 
    en: 'Upon successful completion', 
    es: 'Al completar exitosamente' 
  } as BilingualText,
  courseInfo: {
    en: 'Course Information',
    es: 'Información del Curso'
  } as BilingualText,
  selfPacedLearning: {
    en: 'Self-paced Learning',
    es: 'Aprendizaje a tu Ritmo'
  } as BilingualText,
  selfPacedDesc: {
    en: 'Study at your own pace, anytime, anywhere',
    es: 'Estudia a tu propio ritmo, en cualquier momento y lugar'
  } as BilingualText,
  interactiveQuizzes: {
    en: 'Interactive Quizzes',
    es: 'Cuestionarios Interactivos'
  } as BilingualText,
  interactiveQuizzesDesc: {
    en: 'Test your knowledge after each module',
    es: 'Evalúa tu conocimiento después de cada módulo'
  } as BilingualText,
  officialCertificate: {
    en: 'Official Certificate',
    es: 'Certificado Oficial'
  } as BilingualText,
  officialCertificateDesc: {
    en: 'Receive INSARAG certification upon completion',
    es: 'Recibe certificación INSARAG al completar'
  } as BilingualText,
  multilingualSupport: {
    en: 'Multilingual Support',
    es: 'Soporte Multilingüe'
  } as BilingualText,
  multilingualSupportDesc: {
    en: 'Available in English and Spanish',
    es: 'Disponible en inglés y español'
  } as BilingualText,
};

// ==========================================
// DASHBOARD
// ==========================================

export const dashboard = {
  welcomeBack: { en: 'Welcome back', es: 'Bienvenido de nuevo' } as BilingualText,
  subtitle: { 
    en: 'Continue your learning journey', 
    es: 'Continúa tu viaje de aprendizaje' 
  } as BilingualText,
  myCourses: { en: 'My Courses', es: 'Mis Cursos' } as BilingualText,
  availableCourses: { en: 'Available Courses', es: 'Cursos Disponibles' } as BilingualText,
  noCourses: { 
    en: 'No courses enrolled yet', 
    es: 'Aún no hay cursos inscritos' 
  } as BilingualText,
  enroll: { en: 'Enroll', es: 'Inscribirse' } as BilingualText,
  continue: { en: 'Continue', es: 'Continuar' } as BilingualText,
  startCourse: { en: 'Start Course', es: 'Iniciar Curso' } as BilingualText,
  progress: { en: 'Progress', es: 'Progreso' } as BilingualText,
  completed: { en: 'Completed', es: 'Completado' } as BilingualText,
  inProgress: { en: 'In Progress', es: 'En Progreso' } as BilingualText,
};

// ==========================================
// COURSE / MODULE
// ==========================================

export const course = {
  modules: { en: 'Modules', es: 'Módulos' } as BilingualText,
  module: { en: 'Module', es: 'Módulo' } as BilingualText,
  overview: { en: 'Overview', es: 'Visión General' } as BilingualText,
  slides: { en: 'Slides', es: 'Diapositivas' } as BilingualText,
  quiz: { en: 'Quiz', es: 'Cuestionario' } as BilingualText,
  viewSlides: { en: 'View slides', es: 'Ver diapositivas' } as BilingualText,
  takeQuiz: { en: 'Take quiz', es: 'Tomar cuestionario' } as BilingualText,
  startHere: { en: 'Start here', es: 'Comienza aquí' } as BilingualText,
  locked: { en: 'Locked', es: 'Bloqueado' } as BilingualText,
  unlocked: { en: 'Unlocked', es: 'Desbloqueado' } as BilingualText,
  available: { en: 'Available', es: 'Disponible' } as BilingualText,
  notStarted: { en: 'Not started', es: 'No iniciado' } as BilingualText,
  slidesViewed: { 
    en: 'slides viewed', 
    es: 'diapositivas vistas' 
  } as BilingualText,
  completedModules: { 
    en: 'modules completed', 
    es: 'módulos completados' 
  } as BilingualText,
};

// ==========================================
// QUIZ
// ==========================================

export const quiz = {
  questions: { en: 'questions', es: 'preguntas' } as BilingualText,
  question: { en: 'Question', es: 'Pregunta' } as BilingualText,
  passingScore: { en: 'Passing score', es: 'Puntuación de aprobación' } as BilingualText,
  yourScore: { en: 'Your score', es: 'Tu puntuación' } as BilingualText,
  correctAnswers: { en: 'correct answers', es: 'respuestas correctas' } as BilingualText,
  passed: { en: 'PASSED', es: 'APROBADO' } as BilingualText,
  failed: { en: 'FAILED', es: 'REPROBADO' } as BilingualText,
  tryAgain: { en: 'Try Again', es: 'Intentar de Nuevo' } as BilingualText,
  continueToNext: { 
    en: 'Continue to next module', 
    es: 'Continuar al siguiente módulo' 
  } as BilingualText,
  attempt: { en: 'Attempt', es: 'Intento' } as BilingualText,
  previousAttempts: { en: 'Previous attempts', es: 'Intentos anteriores' } as BilingualText,
  unlimitedAttempts: { 
    en: 'Unlimited attempts', 
    es: 'Intentos ilimitados' 
  } as BilingualText,
  submitQuiz: { en: 'Submit Quiz', es: 'Enviar Cuestionario' } as BilingualText,
  results: { en: 'Results', es: 'Resultados' } as BilingualText,
  correct: { en: 'Correct', es: 'Correcto' } as BilingualText,
  incorrect: { en: 'Incorrect', es: 'Incorrecto' } as BilingualText,
  explanation: { en: 'Explanation', es: 'Explicación' } as BilingualText,
};

// ==========================================
// FINAL EXAM
// ==========================================

export const exam = {
  finalExam: { en: 'Final Exam', es: 'Examen Final' } as BilingualText,
  examUnlocked: { 
    en: 'Final Exam Unlocked!', 
    es: '¡Examen Final Desbloqueado!' 
  } as BilingualText,
  startExam: { en: 'Start Exam', es: 'Iniciar Examen' } as BilingualText,
  randomQuestions: { 
    en: 'random questions from bank of', 
    es: 'preguntas aleatorias de un banco de' 
  } as BilingualText,
  examScore: { en: 'Exam Score', es: 'Puntuación del Examen' } as BilingualText,
};

// ==========================================
// CERTIFICATES
// ==========================================

export const certificates = {
  certificates: { en: 'Certificates', es: 'Certificados' } as BilingualText,
  yourCertificates: { 
    en: 'Your Certificates', 
    es: 'Tus Certificados' 
  } as BilingualText,
  issuedTo: { en: 'Issued to', es: 'Emitido a' } as BilingualText,
  issuedDate: { en: 'Issue Date', es: 'Fecha de Emisión' } as BilingualText,
  certificateNumber: { 
    en: 'Certificate Number', 
    es: 'Número de Certificado' 
  } as BilingualText,
  download: { en: 'Download PDF', es: 'Descargar PDF' } as BilingualText,
  print: { en: 'Print', es: 'Imprimir' } as BilingualText,
  share: { en: 'Share', es: 'Compartir' } as BilingualText,
  verify: { en: 'Verify', es: 'Verificar' } as BilingualText,
  noCertificates: { 
    en: 'Complete the final exam to earn your certificate', 
    es: 'Completa el examen final para obtener tu certificado' 
  } as BilingualText,
  certificateGenerated: { 
    en: 'Certificate generated successfully!', 
    es: '¡Certificado generado exitosamente!' 
  } as BilingualText,
};

// ==========================================
// PROFILE
// ==========================================

export const profile = {
  profile: { en: 'Profile', es: 'Perfil' } as BilingualText,
  myProfile: { en: 'My Profile', es: 'Mi Perfil' } as BilingualText,
  editProfile: { en: 'Edit Profile', es: 'Editar Perfil' } as BilingualText,
  personalInfo: { 
    en: 'Personal Information', 
    es: 'Información Personal' 
  } as BilingualText,
  accountSettings: { 
    en: 'Account Settings', 
    es: 'Configuración de Cuenta' 
  } as BilingualText,
  changePassword: { 
    en: 'Change Password', 
    es: 'Cambiar Contraseña' 
  } as BilingualText,
  username: { en: 'Username', es: 'Nombre de Usuario' } as BilingualText,
  firstName: { en: 'First Name', es: 'Nombre' } as BilingualText,
  middleName: { en: 'Middle Name', es: 'Segundo Nombre' } as BilingualText,
  lastName: { en: 'Last Name', es: 'Apellido' } as BilingualText,
  title: { en: 'Title', es: 'Título' } as BilingualText,
  country: { en: 'Country', es: 'País' } as BilingualText,
  organization: { en: 'Organization', es: 'Organización' } as BilingualText,
  jobTitle: { en: 'Job Title', es: 'Cargo' } as BilingualText,
  usarTeam: { en: 'USAR Team', es: 'Equipo USAR' } as BilingualText,
  teamType: { en: 'Team Type', es: 'Tipo de Equipo' } as BilingualText,
  preferredLanguage: { 
    en: 'Preferred Language', 
    es: 'Idioma Preferido' 
  } as BilingualText,
  optional: { en: 'optional', es: 'opcional' } as BilingualText,
};

// ==========================================
// FOOTER
// ==========================================

export const footer = {
  insaragFull: { 
    en: 'International Search and Rescue Advisory Group', 
    es: 'Grupo Asesor Internacional de Búsqueda y Rescate' 
  } as BilingualText,
  ocha: { 
    en: 'United Nations Office for the Coordination of Humanitarian Affairs', 
    es: 'Oficina de las Naciones Unidas para la Coordinación de Asuntos Humanitarios' 
  } as BilingualText,
  about: { en: 'About', es: 'Acerca de' } as BilingualText,
  contact: { en: 'Contact', es: 'Contacto' } as BilingualText,
  termsOfUse: { en: 'Terms of Use', es: 'Términos de Uso' } as BilingualText,
  privacyPolicy: { en: 'Privacy Policy', es: 'Política de Privacidad' } as BilingualText,
  allRightsReserved: { 
    en: 'All rights reserved', 
    es: 'Todos los derechos reservados' 
  } as BilingualText,
};

// ==========================================
// ERRORS
// ==========================================

export const errors = {
  genericError: { 
    en: 'An error occurred. Please try again.', 
    es: 'Ocurrió un error. Por favor intenta de nuevo.' 
  } as BilingualText,
  notFound: { en: 'Page not found', es: 'Página no encontrada' } as BilingualText,
  unauthorized: { 
    en: 'You must be logged in to access this page', 
    es: 'Debes iniciar sesión para acceder a esta página' 
  } as BilingualText,
  invalidCredentials: { 
    en: 'Invalid email or password', 
    es: 'Correo electrónico o contraseña inválidos' 
  } as BilingualText,
  emailRequired: { 
    en: 'Email is required', 
    es: 'El correo electrónico es requerido' 
  } as BilingualText,
  passwordRequired: { 
    en: 'Password is required', 
    es: 'La contraseña es requerida' 
  } as BilingualText,
  passwordsNotMatch: { 
    en: 'Passwords do not match', 
    es: 'Las contraseñas no coinciden' 
  } as BilingualText,
  usernameRequired: { 
    en: 'Username is required', 
    es: 'El nombre de usuario es requerido' 
  } as BilingualText,
  usernameInvalid: { 
    en: 'Username must be 3-30 characters, lowercase letters, numbers, and underscore only', 
    es: 'El nombre de usuario debe tener 3-30 caracteres, solo letras minúsculas, números y guión bajo' 
  } as BilingualText,
  usernameTaken: { 
    en: 'Username is already taken', 
    es: 'El nombre de usuario ya está en uso' 
  } as BilingualText,
};
