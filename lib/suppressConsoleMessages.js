// Script para suprimir mensajes específicos de la consola
// Esto debe importarse en _app.js o en un componente que se cargue temprano

export function setupConsoleSuppression() {
  if (typeof window !== "undefined") {
    // Guardar las funciones originales de console
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Patrones a suprimir
    const suppressPatterns = [
      /unreachable code after return statement/,
      /Tiptap Error: SSR has been detected/,
      /\[tiptap warn\]: Duplicate extension names found/,
      /Source map error/,
      /\[zustand persist middleware\] Unable to update item/,
    ];

    // Reemplazar console.error
    console.error = function filterError(...args) {
      // Verificar si el mensaje coincide con alguno de los patrones a suprimir
      if (args.length > 0 && typeof args[0] === "string") {
        for (const pattern of suppressPatterns) {
          if (pattern.test(args[0])) {
            return; // Suprimir el mensaje
          }
        }
      }
      // Pasar el mensaje a la función original si no debe suprimirse
      originalConsoleError.apply(console, args);
    };

    // Reemplazar console.warn
    console.warn = function filterWarning(...args) {
      // Verificar si el mensaje coincide con alguno de los patrones a suprimir
      if (args.length > 0 && typeof args[0] === "string") {
        for (const pattern of suppressPatterns) {
          if (pattern.test(args[0])) {
            return; // Suprimir el mensaje
          }
        }
      }
      // Pasar el mensaje a la función original si no debe suprimirse
      originalConsoleWarn.apply(console, args);
    };

    // Función para restaurar el comportamiento original si es necesario
    window.__restoreConsole = function () {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.log("Console behavior restored to original");
    };
  }
}
