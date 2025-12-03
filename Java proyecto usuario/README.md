# Proyecto Java OOP + Interfaz Web (localStorage)

Contenido:
- java_src/: código Java con clases:
  - Usuario (clase madre abstracta)
  - Abogado, Rector, Administrador (clases hijas)
  - UsuarioManager: gestión simple + guardado en `users_db.json`
  - Main: demo de uso y autenticación por consola

- web/: interfaz gráfica (HTML/CSS/JS) que permite registrar e iniciar sesión usando `localStorage` como base de datos temporal.
  - index.html
  - style.css
  - app.js

Instrucciones rápidas:
1. Java:
   - Compilar (asegúrate de tener Gson en el classpath). Ejemplo con javac:
     ```
     javac -cp gson-2.10.1.jar -d out java_src/com/example/users/*.java
     java -cp out:gson-2.10.1.jar com.example.users.Main
     ```
   - El manager guarda/lee `users_db.json` en el directorio actual.

2. Web:
   - Abrir web/index.html en un navegador.
   - Registrar usuarios y usar 'Iniciar sesión' (datos en localStorage).

Nota sobre formato del archivo:
- Me pediste un RAR; aquí te dejo un ZIP (`Java_OO_Project_with_WebUI.zip`). Si necesitas RAR explícito, puedes convertir el ZIP con herramientas como WinRAR o 7-Zip.
