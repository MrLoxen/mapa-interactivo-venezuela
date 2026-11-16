/**
 * Proyecto: Mapa Interactivo de Venezuela
 * Autor: Manuel Fereira
 * Descripción: Archivo principal de lógica (Front-end). 
 * Se encarga de levantar el mapa con Leaflet, cargar los polígonos desde un GeoJSON,
 * gestionar el reproductor de audio nativo y calcular matemáticamente la posición 
 * del usuario usando Turf.js para una experiencia de geolocalización inmersiva.
 */

window.addEventListener('DOMContentLoaded', () => {
  // Referencias al DOM para la pantalla de carga y el tooltip
  const intro = document.getElementById("intro-screen");
  const enterBtn = document.getElementById("enter-btn");
  const mapElement = document.getElementById("map");
  const tooltip = document.getElementById('tooltip');

  // --- 1. LÓGICA DE LA PANTALLA DE INICIO ---
  // Desvanecemos la pantalla de bienvenida y quitamos el blur del mapa al hacer clic
  enterBtn.addEventListener("click", () => {
    intro.style.opacity = "0";
    intro.style.transition = "opacity 1s ease";
    setTimeout(() => {
      intro.style.display = "none";
      mapElement.style.filter = "blur(0)";
    }, 1000);
  });

  // --- 2. INICIALIZACIÓN DEL MAPA LEAFLET ---
  // Centramos la vista inicial en las coordenadas de Venezuela con un zoom nivel 6
  const map = L.map('map').setView([8, -66], 6);
  
  // Capa base de OpenStreetMap. 
  // Nota: Es obligatorio dejar la propiedad 'attribution' intacta para cumplir con 
  // las políticas del servidor de OSM y evitar bloqueos (Error 403 de acceso denegado).
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Restringimos el movimiento de la cámara para que el usuario no arrastre el mapa al vacío
  const bounds = [[0.6, -73.4], [12.2, -59.4]];
  map.setMaxBounds(bounds);
  map.fitBounds(bounds);

  // --- 3. REPRODUCTOR DE MÚSICA ---
  const backgroundMusic = document.getElementById('background-music');
  const musicToggle = document.getElementById('music-toggle');
  const volumeSlider = document.getElementById('volume-slider');
  let isMusicPlaying = true;
  
  // Sincronizamos el volumen inicial
  backgroundMusic.volume = volumeSlider.value;
  
  volumeSlider.addEventListener('input', function() { 
    backgroundMusic.volume = this.value; 
  });
  
  musicToggle.addEventListener('click', function() {
    if (isMusicPlaying) { 
      backgroundMusic.pause(); 
      musicToggle.textContent = '▶'; 
    } else { 
      // Usamos .catch(()=>{}) para atrapar el error que lanzan los navegadores modernos 
      // si intentan reproducir audio sin interacción previa.
      backgroundMusic.play().catch(()=>{}); 
      musicToggle.textContent = '❚❚'; 
    }
    isMusicPlaying = !isMusicPlaying;
  });

  // --- 4. PANEL DE INFORMACIÓN DINÁMICA ---
  /**
   * Inyecta la información del estado seleccionado en el panel lateral.
   * Lee los datos directamente de nuestro diccionario en estadosInfo.js.
   */
  function mostrarInfo(nombre) {
    const info = estadosInfo[nombre];
    if (info) {
      function generarListaConImagenes(items) {
        return items.map(item => {
          const contenido = typeof item === 'string' 
            ? item 
            : `${item.texto}${item.imagen ? `<br><img src="${item.imagen}" alt="" style="max-width: 100%; height: auto; margin: 5px 0; border-radius: 5px; border: 1px solid var(--venezuela-blue);">` : ''}`;
          return `<li>${contenido}</li>`;
        }).join("");
      }
      document.getElementById('info').innerHTML = `
        <h2>${nombre}</h2>
        <img src="${info.imagen}" alt="${nombre}">
        <p><b>Capital:</b> ${info.capital}</p>
        <p><b>Cultura:</b><ul>${generarListaConImagenes(info.cultura)}</ul></p>
        <p><b>Turismo:</b><ul>${generarListaConImagenes(info.turismo)}</ul></p>
        <p><b>Datos curiosos:</b><ul>${generarListaConImagenes(info.datosCuriosos)}</ul></p>
      `;
    } else {
      document.getElementById('info').innerHTML = `<h2>${nombre}</h2><p>Información no disponible.</p>`;
    }
  }

  // Genera un color aleatorio con la paleta de la bandera para el efecto hover (pasar el ratón)
  function varColor(name) {
    const colors = [ "#FFCC00", "#0033A0", "#EF3340" ];
    return colors[Math.floor(Math.random()*colors.length)];
  }

  // --- 5. CARGA DEL GEOJSON Y EVENTOS ESPACIALES ---
  // Cargamos el archivo pesado ve.json de forma asíncrona (fetch) para no congelar la página
  fetch("ve.json")
    .then(res => res.json())
    .then(data => {
      const geojsonLayer = L.geoJSON(data, {
        onEachFeature: (feature, layer) => {
          const nombreEstado = feature.properties.name;
          
          // Efectos visuales y tooltip al pasar el cursor sobre un polígono
          layer.on('mouseover', e => {
            layer.setStyle({ fillOpacity: 0.7, fillColor: varColor(nombreEstado) });
            tooltip.innerHTML = nombreEstado;
            tooltip.style.opacity = '1';
            
            // Transformamos las coordenadas GPS a píxeles en la pantalla para posicionar el tooltip
            const point = map.latLngToContainerPoint(e.latlng);
            tooltip.style.left = (point.x + 10) + 'px';
            tooltip.style.top = (point.y - 25) + 'px';
          });
          
          // Restauramos el estilo base al quitar el cursor
          layer.on('mouseout', () => {
            layer.setStyle({ fillOpacity: 0.5, fillColor: "#4a90e2" });
            tooltip.style.opacity = '0';
          });
          
          // Disparamos la carga de datos en el panel lateral al hacer clic
          layer.on('click', () => mostrarInfo(nombreEstado));
        },
        // Estilo por defecto de todos los estados
        style: { color: "#333", weight: 1.2, fillColor: "#4a90e2", fillOpacity: 0.5 }
      }).addTo(map);

      // Mantiene el tooltip persiguiendo al cursor suavemente
      map.on('mousemove', e => {
        const point = map.latLngToContainerPoint(e.latlng);
        tooltip.style.left = (point.x + 10) + 'px';
        tooltip.style.top = (point.y - 25) + 'px';
      });

      // --- 6. MAGIA DE GEOLOCALIZACIÓN Y TURF.JS ---
      /**
       * Pedimos las coordenadas GPS del usuario de forma nativa al navegador.
       * Luego, usamos la librería Turf.js para realizar un cálculo matemático espacial
       * (Point in Polygon) y determinar exactamente en qué estado está parado el usuario.
       */
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          // Ojo: Turf.js requiere el formato inverso [longitud, latitud] para crear el punto geométrico
          const userPoint = turf.point([userLng, userLat]);
          let estadoUsuario = null;

          // Recorremos los polígonos de Leaflet evaluando si el punto GPS cae dentro de alguno
          geojsonLayer.eachLayer((layer) => {
            if (turf.booleanPointInPolygon(userPoint, layer.feature)) {
              estadoUsuario = layer.feature.properties.name;
            }
          });

          // Si el estado no es nulo, significa que la matemática confirmó que está en Venezuela
          if (estadoUsuario) {
            // Desplegamos la información de su estado de forma automática
            mostrarInfo(estadoUsuario);

            // Creamos un marcador visual personalizado mediante HTML y CSS
            const customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color: var(--venezuela-red); width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.6); margin-top: -5px; margin-left: -5px;'></div>",
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            });

            // Anclamos el marcador a sus coordenadas reales y mostramos el mensaje
            L.marker([userLat, userLng], {icon: customIcon}).addTo(map)
              .bindPopup("<div style='text-align:center; font-family: Poppins, sans-serif;'><b>¡Usted está aquí!</b><br>" + estadoUsuario + "</div>")
              .openPopup();

            // Animamos la cámara del mapa para que "vuele" suavemente hacia su ubicación actual
            map.flyTo([userLat, userLng], 7, { duration: 1.5 });
          }
        }, () => {
          // Fallo silencioso (Silent fail): si el usuario deniega el permiso de GPS o está 
          // fuera del país, la promesa se rechaza pero no rompemos la experiencia visual del mapa.
        });
      }
    })
    .catch(err => console.error("Error cargando GeoJSON:", err));
});
