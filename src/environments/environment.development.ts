// src/environments/environment.development.ts
// Para DESARROLLO LOCAL (ng serve)

export const environment = {
  production: false,
  
  // 🔧 CAMBIA ESTAS URLs según donde corra tu backend:
  
  // Opción A: Backend en Railway (usa esto si no tienes backend local)
  //apiUrl: 'https://laneria-mariano-backend-production.up.railway.app/api/v1',
  //apiUrlBase: 'https://laneria-mariano-backend-production.up.railway.app',
  
  // Opción B: Backend local (descomenta si corres Laravel local)
  apiUrl: 'http://localhost:8000/api/v1',
  apiUrlBase: 'http://localhost:8000',
  
  apiVersion: 'v1',
  appName: 'Lanería Mariano Díaz - DEV',
  appVersion: '1.0.0-dev',
  timeout: 30000,
  maxRetries: 3,
  
  imagenPlaceholder: '/assets/imagenes/placeholder.png',
  
  tokenKey: 'lmd_auth_token',
  userKey: 'lmd_user_data',
  tokenExpiration: 86400000,
  
  // Debug activado en desarrollo
  enableDebugMode: true,
  logLevel: 'debug' as 'debug' | 'info' | 'warn' | 'error'
};