
export const ambiente = {
  production: true,
  apiUrl: 'http://laneria-mariano-backend-production.up.railway.app/api', // ✅ URL del backend en producción
  //apiUrlBase: 'https://tu-dominio.com'
  apiVersion: 'v1',
  appName: 'Lanería Mariano Díaz',
  
  timeout: 30000,
  maxRetries: 3,
  
  imagenPlaceholder: '/assets/imagenes/placeholder.png',
  
  tokenKey: 'auth_token',
  userKey: 'user_data',
  tokenExpiration: 86400000
};

 //http://laneria-mariano-backend-production.up.railway.app/api