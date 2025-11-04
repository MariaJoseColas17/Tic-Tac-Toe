## Cómo compilar / correr el juego

Este proyecto no requiere compilación: es una app estática hecha con **HTML, CSS y JavaScript puro**.

### Requisitos

- Navegador moderno (Chrome, Edge, Firefox…)
- (Recomendado) Servidor local simple:
  - Extensión **Live Server** de VS Code, o
  - `npx serve` ó `python -m http.server`

### Estructura básica

- `index.html` → entrada principal del juego  
- `style.css` → estilos  
- `script.js` → lógica del juego  
- `assets/` → imágenes  
- `assets/sounds/` → sonidos:
  - `click.mp3`
  - `win.mp3`
  - `lose.mp3`
  - `draw.mp3`

### Ejecutar el juego

1. Clonar o descargar el repositorio.
2. Abrir la carpeta del proyecto.
3. Levantar un servidor local (por ejemplo, con Live Server en VS Code).
4. Abrir `index.html` en el navegador (si usas Live Server se abre solo).

El juego cargará en la pantalla **LOADING** y luego pasará automáticamente al menú principal.
