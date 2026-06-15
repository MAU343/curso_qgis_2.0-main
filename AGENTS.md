# Contexto del Proyecto: Curso de QGIS Aplicado a Proyectos de Ingeniería Civil

Este archivo contiene el contexto y las reglas principales para el desarrollo y mantenimiento de la página web interactiva del curso.

## Reglas de Desarrollo y Estilo

1. **Estética y Diseño (`SKILL.md`)**:
   - **Estilo:** Técnico-Industrial Moderno.
   - **Tipografía:** Fuentes distintivas (ej. `Outfit` para títulos, `JetBrains Mono` para detalles). Evitar fuentes genéricas como Arial.
   - **Composición:** Romper la monotonía. Uso de espacios en blanco controlados, superposiciones y layouts no convencionales pero funcionales.

2. **Paleta de Colores Oficial (QGIS)**:
   - Verde Principal: `#93C038`
   - Verde Oscuro: `#589632`
   - Amarillo Acento: `#FEE028`
   - Fondos: Tonos oscuros técnicos (ej. `#121212`, `#1e1e1e`, `#252525`) para generar contraste y dar sensación "premium".

3. **Restricciones de Contenido**:
   - **CERO EMOJIS:** No utilizar emojis en ningún elemento de la interfaz a menos que el usuario lo solicite explícitamente.
   - **Iconografía:** Utilizar intensivamente iconos para acompañar el texto (Bootstrap Icons).

4. **Regla Principal: Responsividad**:
   - **Mobile-First / Fully Responsive:** Toda la web y sus componentes (incluyendo las presentaciones) deben ser 100% responsivos y adaptarse perfectamente a pantallas de móviles, tablets y monitores.

5. **Tecnologías (Stack)**:
   - HTML5, CSS3, y JavaScript Vanilla.
   - Bootstrap (CDN) únicamente para estructura de cuadrícula (grid), botones, y componentes base como formularios, pero siempre sobreescribiendo los estilos para alinearse con la dirección estética.

## Temario y Contenido (Referencia de `qgis.md`)

- **Objetivo:** 20 Horas de curso especializado en proyectos de ingeniería civil (Modelado MDE, GNSS, Volumetría, Potree).
- **Instructores:** Lic. Nelson Eduardo Ruiz Ibarra, Ing. Carlos Daniel Espinosa Montejo, Ing. Carlos Yahir Fuentes Morales.
- **Fechas:** Junio 2026.
- **Sede:** Colegio de Ingenieros Civiles.

## Estado Actual del Proyecto y Patrones de Código (Actualizado)

Para continuar el desarrollo de forma fluida, ten en cuenta las siguientes convenciones que se han establecido en la construcción de la página:

1. **Estructura de Presentaciones (`pages/diaX.html`)**:
   - Cada presentación utiliza un sistema de diapositivas con `<section class="slide">`.
   - Las diapositivas se agrupan temáticamente (Ej: 1.1, 1.2 para teoría; Slide 4 para ejercicios prácticos).
   - Existen controles de navegación en el pie de la página, gestionados por `assets/js/script.js`.

2. **Manejo de Componentes y Clases CSS**:
   - **Tarjetas/Cards:** Evitar el uso directo de la clase `.card` de Bootstrap si no se sobreescribe el fondo blanco por defecto, ya que causa problemas de legibilidad con textos claros. Preferir la estructura: `<div class="p-4 bg-dark bg-darker border border-secondary rounded">`.
   - **Tipografía:** Utilizar extensivamente `.font-mono` para código, especificaciones técnicas y listados, y `.text-muted-light` o `.text-light` para descripciones largas sobre fondos oscuros.
   - **Acentos Visuales:** Hacer uso de las clases personalizadas `.text-qgis-yellow`, `.text-qgis-light`, `.border-qgis`, `.border-left-qgis` para resaltar elementos importantes, y bordes Bootstrap (`border-success`, `border-warning`, etc.) para agrupar visualmente la información.

3. **Bloques de Código SQL (Calculadora de Campos QGIS)**:
   - Se ha implementado un patrón visual para mostrar código SQL (Ej: cálculos de rumbos, distancias, ángulos, reordenación de vértices) usando:
     ```html
     <div class="code-container bg-dark border border-secondary rounded p-3 position-relative overflow-auto" style="max-height: 250px;">
         <pre><code class="text-qgis-yellow font-mono small">...</code></pre>
     </div>
     ```
   - Este patrón asegura que el código largo no rompa el layout en pantallas pequeñas.

4. **Ejercicios Prácticos**:
   - Las diapositivas de "Ejercicio Práctico" siempre se colocan al final de la presentación de cada día.
   - Incluyen listados ordenados con iconos (`bi-1-circle-fill`, etc.).
   - Contienen un contenedor destacado en la parte inferior con un botón de descarga (.btn-qgis-primary) que enlaza a los insumos en Google Drive (abriendo en `target="_blank"`).

5. **Consistencia Temática**:
   - Se intentó usar un tema claro en una ocasión, pero se **revirtió** debido a que rompía la estética premium del curso. **Mantener siempre el tema oscuro general** (`bg-dark`, fondos oscuros) a menos que se indique estrictamente lo contrario para un elemento aislado.
