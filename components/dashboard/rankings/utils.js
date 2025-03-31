// Función para generar datos aleatorios
export const generateRandomData = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Función para generar estadísticas de usuario
export const mockUserStats = (user) => ({
  // Estadísticas Generales
  level: generateRandomData(1, 50),
  totalXP: generateRandomData(1000, 50000),
  achievements: generateRandomData(5, 30),
  rank: generateRandomData(1, 100),

  // Estadísticas de Estudio
  cardsStudied: generateRandomData(100, 5000),
  studyTimeMinutes: generateRandomData(60, 3000),
  accuracy: generateRandomData(70, 100),
  perfectReviews: generateRandomData(10, 200),
  correctAnswers: generateRandomData(500, 10000),
  wrongAnswers: generateRandomData(50, 1000),
  averageResponseTime: generateRandomData(5, 30),
  reviewsPerDay: generateRandomData(10, 100),

  // Estadísticas de Constancia
  currentStreak: generateRandomData(1, 30),
  bestStreak: generateRandomData(10, 60),
  totalStudyDays: generateRandomData(10, 200),
  dailyGoalsCompleted: generateRandomData(5, 100),
  studySessionsCompleted: generateRandomData(20, 500),
  averageStudyTime: generateRandomData(30, 180),
  weeklyStudyDays: generateRandomData(1, 7),
  monthlyCompletionRate: generateRandomData(50, 100),

  // Estadísticas de Creación
  cardsCreated: generateRandomData(10, 500),
  collections: generateRandomData(1, 20),
  sharedContent: generateRandomData(1, 50),
  totalEdits: generateRandomData(50, 1000),
  qualityRating: generateRandomData(1, 5),
  cardsReused: generateRandomData(0, 200),
  templatesCreated: generateRandomData(0, 10),
  averageCardQuality: generateRandomData(70, 100),

  // Estadísticas Sociales
  studyGroups: generateRandomData(1, 10),
  collaborations: generateRandomData(1, 30),
  helpedUsers: generateRandomData(1, 100),
  reputation: generateRandomData(0, 1000),
  followers: generateRandomData(0, 50),
  following: generateRandomData(0, 50),
  contributions: generateRandomData(0, 200),
  communityRating: generateRandomData(1, 5),
});

// Función para obtener el badge de posición
export const getPositionBadge = (index) => {
  switch (index) {
    case 0:
      return {
        icon: "Trophy",
        color: "text-yellow-500",
        text: "1º"
      };
    case 1:
      return {
        icon: "Medal",
        color: "text-gray-400",
        text: "2º"
      };
    case 2:
      return {
        icon: "Medal",
        color: "text-amber-700",
        text: "3º"
      };
    default:
      return {
        text: `${index + 1}º`,
        color: "text-gray-500"
      };
  }
};
