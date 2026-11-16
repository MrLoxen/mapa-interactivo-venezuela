# Mapa Interactivo de Venezuela

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Turf.js](https://img.shields.io/badge/Turf.js-%234F5D95?style=for-the-badge)

Aplicación web front-end interactiva diseñada para explorar la división político-territorial, la riqueza cultural, los destinos turísticos y los datos curiosos de cada uno de los estados de Venezuela. 

El proyecto destaca por implementar un motor de cálculo espacial para detectar automáticamente la posición geográfica del usuario dentro del territorio nacional.

## Características principales

*   **Renderizado vectorial:** Visualización de polígonos estatales mediante **Leaflet.js** y datos geográficos en formato GeoJSON (`ve.json`).
*   **Geolocalización espacial avanzada:** Uso de **Turf.js** para realizar operaciones matemáticas de geometría analítica (*Point in Polygon*), detectando con precisión si las coordenadas GPS del navegador se encuentran dentro de un estado venezolano.
*   **Panel de información dinámica:** Inyección de datos estructurados desde una base de datos local en JavaScript (`estadosInfo.js`), mostrando capitales, reseñas culturales y atractivos turísticos.
*   **Reproductor de audio integrado:** Controles flotantes personalizados para ambientar la experiencia de navegación con música tradicional.
*   **Diseño responsivo y moderno:** Interfaz desarrollada con un enfoque visual limpio y componentes interactivos basados en maquetación modular.

## Tecnologías utilizadas

*   **HTML5 y CSS3:** Estructura semántica y diseño de interfaces con variables tipográficas y animaciones fluidas.
*   **JavaScript (ES6+):** Lógica asíncrona, manipulación del DOM y gestión de eventos del mapa.
*   **Leaflet.js:** Biblioteca de mapas interactivos de código abierto.
*   **Turf.js:** Biblioteca de análisis espacial para JavaScript.

## Instalación y uso local

Al tratarse de una aplicación estática basada en peticiones asíncronas (`fetch`), se requiere un servidor local para evitar restricciones de seguridad CORS del navegador al cargar el archivo JSON.

1. **Clona este repositorio:**
   ```bash
   git clone [https://github.com/MrLoxen/mapa-interactivo-venezuela.git](https://github.com/MrLoxen/mapa-interactivo-venezuela.git)
   cd mapa-interactivo-venezuela
   ```

2. **Inicia un servidor local:**
    Si tienes Python instalado en tu equipo, ejecuta:
    ```bash
    python -m http.server
    ```
    Si utilizas Node.js, puedes usar http-server u otra alternativa equivalente.

3. **Abre el proyecto en tu navegador:**
    Ingresa a http://localhost:8000 en la barra de direcciones.

## Arquitectura del proyecto
*   **index.html**: Estructura principal y puntos de montaje de las librerías.

*   **styles.css**: Hoja de estilos global, paleta cromática y diseño de componentes flotantes.

*   **app.js**: Lógica principal del mapa, eventos de interacción y algoritmo de geolocalización.

*   **estadosInfo.js**: Diccionario estructurado con la información descriptiva de cada estado.

*   **ve.json**: Archivo GeoJSON con la delimitación poligonal del país.

Autor
Manuel Fereira

Desarrollador Full-stack y estudiante de ingeniería en sistemas.