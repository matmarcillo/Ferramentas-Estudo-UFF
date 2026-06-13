export const courseMetricsMapping = {
  dificuldade: {
    label: "Dificuldade",
    options: {
      1: "Muito Difícil",
      2: "Difícil",
      3: "Moderada",
      4: "Fácil",
      5: "Muito Fácil",
    },
  },
  utilidade: {
    label: "Utilidade",
    options: {
      1: "Inútil",
      2: "Pouco Útil",
      3: "Razoável",
      4: "Útil",
      5: "Muito Útil",
    },
  },
  interesse: {
    label: "Interesse",
    options: {
      1: "Desinteressante",
      2: "Pouco Interessante",
      3: "Razoável",
      4: "Interessante",
      5: "Muito Interessante",
    },
  },
  carga_trabalho: {
    label: "Carga de Trabalho",
    options: {
      1: "Muito Pesada",
      2: "Pesada",
      3: "Moderada",
      4: "Leve",
      5: "Muito Leve",
    },
  },
};

export const professorMetricsMapping = {
  pedagogia: {
    label: "Pedagogia",
    options: {
      1: "Péssima",
      2: "Ruim",
      3: "Regular",
      4: "Boa",
      5: "Excelente",
    },
  },
  organizacao: {
    label: "Organização",
    options: {
      1: "Muito Desorganizado",
      2: "Desorganizado",
      3: "Regular",
      4: "Organizado",
      5: "Muito Organizado",
    },
  },
  rigidez: {
    label: "Rigidez",
    options: {
      1: "Muito Rígido",
      2: "Rígido",
      3: "Moderado",
      4: "Flexível",
      5: "Muito Flexível",
    },
  },
};

export type CourseMetricKey = keyof typeof courseMetricsMapping;
export type ProfessorMetricKey = keyof typeof professorMetricsMapping;
