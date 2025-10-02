# Proyecto de Testing Automatizado con Cypress

Este proyecto contiene tests automatizados para la aplicación **Contact List App** usando Cypress.

## 🎯 Aplicación bajo prueba
- **URL**: https://thinking-tester-contact-list.herokuapp.com/
- **Descripción**: Aplicación web para gestión de lista de contactos

## 🚀 Configuración del proyecto

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Instalación
1. Clona o descarga el proyecto
2. Navega al directorio del proyecto:
   ```bash
   cd tp6-testing-automatizado
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```

## 🧪 Ejecutar los tests

### Modo interactivo (recomendado para desarrollo)
```bash
npm run cypress:open
```
Esto abrirá la interfaz gráfica de Cypress donde puedes seleccionar y ejecutar tests individuales.

### Modo headless (para CI/CD)
```bash
npm run cypress:run
```
Ejecuta todos los tests en modo headless (sin interfaz gráfica).

### Modo headed (ver la ejecución)
```bash
npm run test:headed
```
Ejecuta los tests mostrando el navegador durante la ejecución.

## 📁 Estructura del proyecto

```
tp6-testing-automatizado/
├── cypress/
│   ├── e2e/                    # Tests end-to-end
│   │   ├── auth.cy.js         # Tests de autenticación (login/registro)
│   │   ├── contacts.cy.js     # Tests de gestión de contactos
│   │   └── ui-navigation.cy.js # Tests de UI y navegación
│   ├── fixtures/              # Datos de prueba
│   │   └── test-data.js       # Datos y selectores reutilizables
│   └── support/               # Configuración y comandos personalizados
│       ├── commands.js        # Comandos personalizados de Cypress
│       └── e2e.js            # Configuración global
├── cypress.config.js          # Configuración de Cypress
├── package.json              # Dependencias y scripts
└── README.md                 # Este archivo
```

## 🧾 Casos de prueba incluidos

### 1. Autenticación (`auth.cy.js`)
- ✅ Visualización del formulario de login
- ✅ Navegación a página de registro
- ✅ Registro de usuario exitoso
- ✅ Validación de email duplicado
- ✅ Login con credenciales válidas
- ✅ Login con credenciales inválidas
- ✅ Validación de campos requeridos

### 2. Gestión de Contactos (`contacts.cy.js`)
- ✅ Visualización de lista de contactos
- ✅ Agregar contacto con todos los campos
- ✅ Agregar contacto con campos mínimos
- ✅ Ver detalles de contacto
- ✅ Editar contacto existente
- ✅ Eliminar contacto
- ✅ Validación de formularios

### 3. UI y Navegación (`ui-navigation.cy.js`)
- ✅ Responsive design en diferentes viewports
- ✅ Flujo de navegación completo
- ✅ Protección de rutas (autenticación requerida)
- ✅ Manejo del botón "atrás" del navegador
- ✅ Accesibilidad básica
- ✅ Rendimiento de carga

## ⚙️ Configuración

### Variables de entorno
El archivo `cypress.config.js` incluye:
- **baseUrl**: URL base de la aplicación
- **Timeouts**: Configuración de tiempos de espera
- **Viewport**: Tamaño de ventana por defecto
- **Video y Screenshots**: Captura automática en fallos

### Comandos personalizados
En `cypress/support/commands.js` se definen comandos reutilizables:
- `cy.login(email, password)` - Login rápido
- `cy.register(firstName, lastName, email, password)` - Registro rápido
- `cy.addContact(...)` - Agregar contacto con todos los campos
- `cy.clearAllContacts()` - Limpiar todos los contactos

## 📊 Reportes

Cypress genera automáticamente:
- **Videos** de las ejecuciones (en `cypress/videos/`)
- **Screenshots** de los fallos (en `cypress/screenshots/`)
- **Reportes** en consola con detalles de cada test

## 🔧 Personalización

### Agregar nuevos tests
1. Crea un nuevo archivo `.cy.js` en `cypress/e2e/`
2. Utiliza la estructura estándar de Cypress:
   ```javascript
   describe('Descripción del grupo de tests', () => {
     it('should do something', () => {
       // Tu test aquí
     })
   })
   ```

### Modificar configuración
Edita `cypress.config.js` para ajustar:
- Timeouts
- URLs
- Configuración de video/screenshots
- Variables de entorno

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Notas importantes

- Los tests están diseñados para ser independientes entre sí
- Cada test limpia los datos que crea para evitar interferencias
- La aplicación bajo prueba es temporal y los datos pueden ser eliminados
- Se incluye manejo de errores para evitar fallos por excepciones no controladas

## 🐛 Solución de problemas

### Error de timeout
Si los tests fallan por timeout, verifica:
- La aplicación esté disponible en la URL configurada
- Los selectores CSS no hayan cambiado
- La conexión a internet sea estable

### Tests que fallan esporádicamente
- Aumenta los timeouts en `cypress.config.js`
- Agrega esperas explícitas con `cy.wait()`
- Verifica que no hay condiciones de carrera

### Problemas de selectores
- Usa el Cypress Test Runner para inspeccionar elementos
- Actualiza los selectores en `cypress/fixtures/test-data.js`
- Considera usar atributos `data-test` más estables