// services/dbConfig.ts

/**
 * Configuración de la Conexión a la Base de Datos
 * 
 * IMPORTANTE: Rellena estos valores con las credenciales de tu base de datos MySQL.
 * La aplicación utilizará esta configuración para interactuar con la base de datos.
 * En un entorno real, estos valores provendrían de variables de entorno del servidor, no estarían en el código fuente del frontend.
 */
export const dbConfig = {
  host: 'localhost',       // ej: '127.0.0.1'
  port: 3306,                     // ej: 3306
  database: 'credit_intelligence_platform',
  user: 'igdadmin',        // ej: 'root'
  password: '$User#Conec.2022$'  // ej: 'tu_contraseña_segura'
};
