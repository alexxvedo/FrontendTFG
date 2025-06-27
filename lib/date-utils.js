/**
 * Formatea una fecha que puede venir en diferentes formatos desde el backend
 * @param {*} dateInput - Puede ser array de Java LocalDateTime, timestamp, string, etc.
 * @param {Object} options - Opciones de formateo para toLocaleDateString
 * @returns {string} - Fecha formateada o mensaje de error
 */
export const formatDate = (dateInput, options = {}) => {
  if (!dateInput) {
    return "Fecha no disponible";
  }

  try {
    let date;

    // Si es un array (formato LocalDateTime de Java: [año, mes, día, hora, minuto, segundo, nanosegundos])
    if (Array.isArray(dateInput) && dateInput.length >= 6) {
      // Java mes es 1-indexado, JavaScript es 0-indexado, así que restamos 1 al mes
      const [year, month, day, hour, minute, second] = dateInput;
      date = new Date(year, month - 1, day, hour, minute, second);
    }
    // Si es un timestamp en milisegundos (número)
    else if (typeof dateInput === "number") {
      date = new Date(dateInput);
    }
    // Si es una string de timestamp en milisegundos
    else if (!isNaN(dateInput) && dateInput.toString().length === 13) {
      date = new Date(parseInt(dateInput));
    }
    // Si es una string de timestamp en segundos (convertir a milisegundos)
    else if (!isNaN(dateInput) && dateInput.toString().length === 10) {
      date = new Date(parseInt(dateInput) * 1000);
    }
    // Si es una string de fecha ISO o similar
    else {
      date = new Date(dateInput);
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn("Fecha inválida:", dateInput);
      return "Fecha inválida";
    }

    // Opciones por defecto
    const defaultOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleDateString("es-ES", { ...defaultOptions, ...options });
  } catch (error) {
    console.error("Error al formatear fecha:", error, "Valor:", dateInput);
    return "Error en fecha";
  }
};

/**
 * Formatea una fecha solo con día, mes y año
 * @param {*} dateInput - Fecha en cualquier formato
 * @returns {string} - Fecha formateada como "dd/mm/aaaa"
 */
export const formatDateShort = (dateInput) => {
  return formatDate(dateInput, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formatea una fecha con día, mes, año, hora y minutos
 * @param {*} dateInput - Fecha en cualquier formato
 * @returns {string} - Fecha formateada como "dd/mm/aaaa, hh:mm"
 */
export const formatDateTime = (dateInput) => {
  return formatDate(dateInput, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
