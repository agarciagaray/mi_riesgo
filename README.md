# Plataforma de Inteligencia Crediticia con IA


![Plataforma de Inteligencia Crediticia](https://i.imgur.com/8a6E3kM.png)


**Miriresgo V2** es una plataforma avanzada de gestión de riesgo crediticio impulsada por inteligencia artificial, diseñada como una solución integral para instituciones financieras que requieren una evaluación precisa, ágil y automatizada del riesgo crediticio. Esta aplicación web de demostración simula un entorno realista de gestión de cartera crediticia, donde empresas afiliadas pueden registrar, monitorear y analizar el comportamiento de sus clientes, así como evaluar nuevos solicitantes de crédito mediante un **puntaje de riesgo dinámico generado por IA**.


La plataforma combina una arquitectura moderna y escalable con capacidades avanzadas de análisis predictivo, utilizando la **API de Google Gemini (`gemini-1.5-flash`)** para generar evaluaciones cualitativas y cuantitativas del riesgo crediticio en tiempo real. Ofrece una experiencia de usuario segura, intuitiva y visualmente atractiva, ideal para analistas, gestores y administradores financieros.


---


## ✨ Características Principales


- **Arquitectura Multiempresa (Multi-tenant)**: Soporta múltiples instituciones financieras dentro de un mismo entorno, con aislamiento seguro de datos y gestión por empresa.
- **Sistema de Autenticación y Autorización Seguro**: Implementa un flujo de autenticación robusto con roles diferenciados (analista, gestor, administrador) y persistencia de sesión simulada mediante almacenamiento local, emulando tokens JWT.
- **Validación de Contraseña en Tiempo Real**: Guía al usuario durante el registro con retroalimentación instantánea sobre la fortaleza de la contraseña, promoviendo prácticas de seguridad.
- **Dashboard Analítico Completo**: Presenta métricas clave del portafolio crediticio, incluyendo número total de clientes, monto total de cartera, tasa de morosidad, distribución por días de atraso y alertas de riesgo.
- **Consulta de Reporte de Crédito por Identificador**: Permite buscar el historial crediticio completo de un cliente mediante su número de identificación nacional.
- **Puntaje de Riesgo Crediticio con IA**: Integra la **API de Google Gemini** para analizar automáticamente el perfil crediticio de un cliente y generar:
  - Un **puntaje numérico (300–850)**.
  - Una **evaluación cualitativa** (bajo, medio, alto riesgo).
  - Un **razonamiento detallado** basado en comportamiento de pagos, morosidad, alertas y tendencias.
- **Edición en Tiempo Real con Recálculo Automático**: Cualquier modificación en los datos del cliente o sus préstamos desencadena un nuevo análisis de riesgo mediante IA, garantizando evaluaciones siempre actualizadas.
- **Gestión Integral de Clientes**: Panel administrativo con tabla paginada, filtros, búsqueda y acceso rápido a reportes y edición de perfiles.
- **Generación de Reportes en PDF**: Permite exportar el reporte de crédito completo a formato PDF, listo para archivar, compartir o presentar formalmente.
- **Historial de Cambios (Audit Trail)**: Registra todas las modificaciones realizadas en los datos del cliente, asegurando trazabilidad y cumplimiento regulatorio.
- **Sistema de Alertas (Client Flags)**: Detecta y marca automáticamente comportamientos de riesgo (ej. fraude, castigo, múltiples moras).
- **Diseño Responsivo y Moderno**: Interfaz oscura, limpia y altamente usable, optimizada para dispositivos móviles y de escritorio, construida con **Tailwind CSS**.
- **Panel de Administración Avanzado**: Simula funcionalidades clave para administradores, como gestión de empresas, usuarios, roles y carga masiva de datos (file upload).


---


## 🚀 Stack Tecnológico


| Capa | Tecnologías |
|------|-----------|
| **Frontend** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **Backend (Simulado)** | ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-FFD661?style=for-the-badge&logo=python&logoColor=black) |
| **Base de Datos (Mock)** | SQL (estructura relacional simulada con datos en memoria) |
| **Inteligencia Artificial** | ![Google Gemini](https://img.shields.io/badge/Google_Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white) |
| **Generación de PDF** | `jspdf` + `html2canvas` |
| **Entorno de Desarrollo** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) |
| **Autenticación** | JWT simulado (almacenamiento local) |
| **Pruebas y Validación** | Validación de formularios con `Zod`, manejo de estados con `React Context` |


---


## ⚙️ Instalación y Puesta en Marcha


Este proyecto está diseñado para ejecutarse localmente con un entorno de desarrollo mínimo, aprovechando tecnologías modernas del lado del cliente.


### 🔐 Prerrequisitos


1. **Clave de API de Google Gemini**: Necesitas una clave válida de la API de Google AI Studio. Puedes obtenerla gratuitamente en [Google AI Studio - API Keys](https://aistudio.google.com/app/apikey).
2. **Node.js y npm**: Asegúrate de tener Node.js instalado (versión 16 o superior).
3. **Servidor de Desarrollo**: Se recomienda `Vite` por su velocidad y soporte nativo para ES Modules y variables de entorno.


### 📦 Pasos de Instalación


```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/nombre-del-repositorio.git
cd nombre-del-repositorio


# 2. Crear el archivo .env con tu clave de API
echo "VITE_API_KEY=tu_clave_de_gemini_aqui" > .env


# 3. Instalar dependencias (si aplica)
npm install


# 4. Iniciar el servidor de desarrollo
npm run dev
```


> **Nota sobre variables de entorno**: El frontend utiliza `import.meta.env.VITE_API_KEY` para acceder a la clave de API de forma segura. Vite expone únicamente las variables con prefijo `VITE_` al código del cliente. Asegúrate de no subir el archivo `.env` a repositorios públicos.


### 🌐 Acceso a la Aplicación


Una vez iniciado el servidor, abre tu navegador en:


```
http://localhost:5173
```


---


## 📖 Guía de Uso


La aplicación requiere autenticación para acceder a sus funcionalidades. Puedes usar las siguientes credenciales de prueba:


### 🔐 Credenciales de Acceso


| Rol | Email | Contraseña |
|-----|-------|----------|
| **Administrador** | `admin@credintell.com` | `AdminPass123!` |
| **Analista** | `analyst@credintell.com` | `AnalystPass123!` |


### 🔍 Identificadores de Prueba


En la sección **"Consulta de Reporte"**, puedes probar con los siguientes IDs:


- `123456789` → Cliente con buen historial y una mora leve.
- `987654321` → Cliente con alerta de fraude y crédito castigado.
- `101010101` → Cliente nuevo con comportamiento positivo.
- `202020202` → Cliente con préstamo en proceso jurídico.


### 🧭 Navegación


- **Dashboard**: Vista principal con métricas consolidadas del portafolio.
- **Gestión de Clientes**: Lista completa de clientes con opciones de búsqueda, edición y visualización.
- **Consulta de Reporte**: Búsqueda detallada por ID con análisis de riesgo generado por IA.
- **Administración**: Sección simulada para gestión de usuarios, empresas y carga de datos.
- **Cerrar Sesión**: Botón seguro en la barra lateral para finalizar la sesión.


---


## 📂 Estructura del Proyecto


La arquitectura sigue principios de modularidad, escalabilidad y buenas prácticas de desarrollo frontend.


```
/
├── components/             # Componentes reutilizables de UI (botones, tarjetas, tablas, etc.)
│   ├── admin/              # Componentes del panel de administración
│   ├── auth/               # Login, registro, recuperación de contraseña
│   ├── client-management/  # Tablas, filtros y modales de clientes
│   ├── dashboard/          # Widgets, gráficos y resúmenes
│   └── shared/             # Componentes comunes (modales, inputs, loaders)
├── contexts/               # Gestión de estado global con React Context
│   └── AuthContext.tsx     # Maneja autenticación y rol del usuario
├── pages/                  # Páginas principales de la aplicación
│   ├── DashboardPage.tsx
│   ├── ClientManagementPage.tsx
│   ├── CreditReportPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── AdminPage.tsx
├── services/               # Lógica de negocio y llamadas a APIs
│   ├── authService.ts      # Simulación de autenticación (login, registro)
│   ├── creditService.ts    # Mock de datos crediticios y operaciones
│   └── geminiService.ts    # Interacción con API de Google Gemini
├── types/                  # Interfaces y tipos de TypeScript
│   ├── User.ts
│   ├── Client.ts
│   ├── Loan.ts
│   └── Payment.ts
├── utils/                  # Funciones auxiliares (formateo, validación, PDF)
│   ├── pdfGenerator.ts
│   └── validators.ts
├── App.tsx                 # Enrutamiento principal y layout
├── index.html              # Punto de entrada
├── index.tsx               # Renderizado de la app en el DOM
├── .env                    # Variables de entorno (no subido al repositorio)
├── vite.config.ts          # Configuración de Vite
├── tsconfig.json           # Configuración de TypeScript
├── metadata.json           # Metadatos del proyecto
├── README.md               # Documentación principal
└── LICENSE                 # Licencia MIT
```


---


## 🌐 Arquitectura del Sistema


La plataforma sigue una arquitectura limpia y escalable:


- **Frontend (React + TypeScript)**: Interfaz dinámica y reactiva.
- **Backend (Simulado)**: API REST simulada con datos en memoria, estructurada en torno a modelos como `Company`, `User`, `Client`, `Loan`, `Payment`, `ClientFlags` y `ClientHistory`.
- **IA como Servicio**: Google Gemini procesa el perfil crediticio y devuelve un análisis estructurado.
- **Seguridad**: Autenticación basada en JWT simulado, manejo de roles y auditoría de cambios.
- **Escalabilidad**: Diseñada para evolucionar hacia un backend real (FastAPI/Python) y base de datos relacional (PostgreSQL).


---


## 📄 Licencia


Este proyecto está licenciado bajo la **Licencia MIT**.  
Consulta el archivo [`LICENSE`](LICENSE) para más detalles.


---


> **Nota del Desarrollador**: Esta plataforma es una demostración funcional de una solución real de gestión crediticia. Puede extenderse fácilmente para integrarse con APIs bancarias, sistemas ERP o motores de decisión automatizados. Ideal para fintechs, cooperativas, bancos regionales o plataformas de scoring crediticio.
