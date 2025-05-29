// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    debug: false,
    resources: {
      en: {
        translation: {
          inicio: "Home",
          categorias: "Categories",
          productos: "Products",
          catalogo: "Catalog",
          libros: "Books",
          pronunciacion: "Pronunciation",
          estadisticas: "Statistics",
          cerrar_sesion: "Logout",
          iniciar_sesion: "Login",
          idioma: "Language",
          ingles: "English",
        }
      },
      es: {
        translation: {
          inicio: "Inicio",
          categorias: "Categorías",
          productos: "Productos",
          catalogo: "Catálogo",
          libros: "Libros",
          pronunciacion: "Pronunciación",
          estadisticas: "Estadísticas",
          cerrar_sesion: "Cerrar sesión",
          iniciar_sesion: "Iniciar sesión",
          idioma: "Idioma",
          español: "Español",
          ingles: "Inglés",
        }
      }
    }
  });

export default i18n;
