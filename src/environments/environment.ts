export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyD-XIzilX3gO_VmYjjEEp55hJ17L4Ij5RA',
    authDomain: 'portfolio-b3557.firebaseapp.com',
    projectId: 'portfolio-b3557',
    storageBucket: 'portfolio-b3557.appspot.com',
    messagingSenderId: '729523281134',
    appId: '1:729523281134:web:406f1222addda7fa24e7ff',
  },
  demoUsers: {
    alumno: { email: 'demo@alumno.com', password: '123456' },
    invitado: { email: 'invitado@demo.com', password: 'guest123' },
  } as const,
  // Emails que considerás administradores (opcional)
  adminEmails: ['kmplucci9911@gmail.com'],
};
