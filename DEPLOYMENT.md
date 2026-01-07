# Guía de Publicación en Chrome Web Store

¡Todo está listo para el lanzamiento! Sigue estos pasos para publicar tu extensión **Link Saver**.

## 1. Archivos Preparados

Los archivos que necesitas están en tu carpeta de proyecto:

| Archivo/Carpeta  | Ubicación                          | Uso                                   |
| ---------------- | ---------------------------------- | ------------------------------------- |
| **Archivo Zip**  | `./link-saver-extension.zip`       | El archivo principal que subirás.     |
| **Icono Tienda** | `./public/icon-128.png`            | Icono principal para el listado.      |
| **Capturas**     | `./store-assets/final-promo-1.png` | Captura promocional 1 (1280x800).     |
| **Capturas**     | `./store-assets/final-promo-2.png` | Captura promocional 2 (1280x800).     |
| **Privacidad**   | `./PRIVACY_POLICY.md`              | Texto para la política de privacidad. |

## 2. Pasos de Subida

1.  **Accede al Panel**: Ve al [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
    - _Nota: Si es tu primera vez, Google cobra una tasa única de $5 USD._

2.  **Nueva Extensión**:
    - Haz clic en el botón azul **+ Nuevo elemento**.
    - Sube el archivo `link-saver-extension.zip`.

3.  **Completa la Ficha "Store Listing"**:
    - **Description**: Copia la descripción de tu `manifest.json` o escribe una más detallada.
    - **Category**: Elige `Productivity` o `Workflow`.
    - **Language**: `English` (o tu idioma preferido).
    - **Graphic Assets**:
      - **Store Icon**: Sube `public/icon-128.png`.
      - **Screenshots**: Sube las dos imágenes de `store-assets/`.

4.  **Privacidad (Privacy)**:
    - En la pestaña "Privacy", pega el contenido de `PRIVACY_POLICY.md`.
    - Si piden una justificación de permisos:
      - `storage`: "To save the user's links and folder preferences locally."
      - `tabs`: "To allow the user to save the current tab URL and title."
      - `activeTab`: "To access the current active page information for saving."

5.  **Publicar**:
    - Haz clic en **"Submit for Review"** (Enviar para revisión).

## 3. Post-Lanzamiento

La revisión puede tardar de **24 a 48 horas**. Recibirás un correo cuando esté publicada.

¡Mucha suerte! 🚀
