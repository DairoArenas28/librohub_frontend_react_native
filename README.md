# 📚 LibroHub — Frontend

Aplicación móvil construida con **React Native + Expo**.

---

## 🧩 Tecnologías

| Tecnología | Uso |
|------------|-----|
| React Native + Expo | Framework móvil |
| TypeScript | Tipado estático |
| React Navigation | Navegación entre pantallas |
| Expo SecureStore | Almacenamiento seguro del token |
| Expo Image Picker | Selección de imágenes |
| Expo Document Picker | Selección de archivos PDF |
| expo-status-bar | Control de la barra de estado |

---

## 🚀 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/DairoArenas28/librohub_frontend_react_native.git
cd librohub_frontend_react_native
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

| Variable | Descripción |
|----------|-------------|
| `API_URL` | URL base del backend (ej: `http://192.168.1.1:3000/api/v1`) |
| `EAS_PROJECT_ID` | ID del proyecto en Expo Application Services |

### 4. Ejecutar en desarrollo

```bash
npx expo start --clear
```

Escanea el QR con la app **Expo Go** en tu dispositivo.

---

## 📁 Estructura del proyecto

```
src/
├── components/        # Componentes reutilizables
├── context/           # Contextos globales (Auth, AppConfig)
├── hooks/             # Custom hooks
├── navigation/        # Navegadores (Auth, Reader, Admin)
├── screens/
│   ├── auth/          # Login, Register, ForgotPassword, etc.
│   ├── reader/        # Home, BookDetail, Profile, etc.
│   └── admin/         # Dashboard, Users, Books, Settings, etc.
├── services/          # Llamadas a la API
├── types/             # Tipos TypeScript globales
└── config.ts          # Configuración (API_URL)
assets/
├── banner.jpg         # Imagen de portada en pantallas auth
├── icon.png
└── splash-icon.png
```

---

## 👤 Roles de usuario

| Rol | Acceso |
|-----|--------|
| `reader` | Catálogo de libros, favoritos, comentarios, perfil |
| `admin` | Todo lo anterior + gestión de usuarios, libros y configuración |

---

## 📦 Build con EAS

### APK de prueba interna

```bash
eas build --profile preview --platform android
```

### APK de producción

```bash
eas build --profile production --platform android
```

### Build de desarrollo (con dev client)

```bash
eas build --profile development --platform android
```

---

## 🔗 Backend

Este proyecto consume la API REST de [librohub_backend_express](https://github.com/DairoArenas28/librohub_backend_express).

**URL producción:** `https://librohub-backend-express-1.onrender.com/api/v1`
