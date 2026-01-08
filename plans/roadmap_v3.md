# Roadmap V3: Next Level Improvements 🚀

Dado que la base técnica V2 es ahora sólida, modular y escalable (Array-based), podemos construir features avanzadas que antes eran imposibles o muy difíciles.

## 1. Drag & Drop (Alta Prioridad)

- **Por qué ahora?**: La estructura de datos V2 (`Array`) permite reordenar índices fácilmente (antes con objetos era un infierno).
- **Feature**: Permitir arrastrar leads entre carpetas y reordenar carpetas a gusto.
- **Impacto**: UX masiva. Vuelve la extensión "táctil" y profesional.
- **Tech**: Ya tenemos `@dnd-kit/core` instalado (vi referencias en el código), solo falta implementarlo en `FolderList`.

## 2. Shortcuts de Teclado ("Power User Mode")

- **Por qué ahora?**: Con `chromeService` aislado, podemos escuchar eventos globales limpiamente.
- **Feature**:
  - `Alt + S`: Guardar tab actual en la última carpeta usada (Quick Save).
  - `Alt + N`: Nueva carpeta.
- **Impacto**: Velocidad. Los usuarios de productividad aman no tocar el ratón.

## 3. Buscador Global ("Spotlight")

- **Por qué ahora?**: `useLeadsV2` tiene todos los datos centralizados en memoria.
- **Feature**: Una barra de búsqueda instantánea arriba. Escribes "react" y filtra _todos_ los leads de _todas_ las carpetas.
- **Impacto**: Indispensable cuando tienes +50 leads guardados.

## 4. Cloud Sync (Google Drive / GitHub Gist)

- **Por qué ahora?**: Tenemos un `storageService` modular. Podemos añadir un "adapter" nuevo sin romper nada.
- **Feature**: Botón "Sync" que guarda tus leads en un JSON en Google Drive.
- **Impacto**: Acceso a tus leads desde el ordenador del trabajo y de casa. Backup real en la nube.

## 5. Exportar/Importar JSON Avanzado

- **Por qué ahora?**: La estructura es limpia y tipada.
- **Feature**: Botón para descargar `backup_leads.json` y poder cargarlo en otro navegador.
- **Impacto**: Portabilidad total. "Tus datos son tuyos".

---

### Recomendación Personal

Yo iría a por el **Drag & Drop** primero. Es lo que visualmente separa una app "amateur" de una "pro", y la arquitectura V2 grita pidiéndolo.
