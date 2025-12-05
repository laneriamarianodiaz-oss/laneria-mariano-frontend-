export const environment = {
  production: false,
  
  // Configuración de API
  apiUrl: 'http://127.0.0.1:8000/api/v1',
  apiUrlBase: 'http://127.0.0.1:8000',
  apiVersion: 'v1',
  
  // Información de la aplicación
  appName: 'Lanería Mariano Díaz',
  appVersion: '1.0.0',
  
  // Timeouts
  timeout: 30000,
  maxRetries: 3,
  
  // Recursos
  imagenPlaceholder: '/assets/imagenes/placeholder.png',
  
  // Autenticación
  tokenKey: 'lmd_auth_token',
  userKey: 'lmd_user_data',
  tokenExpiration: 86400000,
  
  // Desarrollo
  enableDebugMode: true,
  logLevel: 'debug'
};
