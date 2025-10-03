import 'zone.js'; // 👈 requerido por Angular

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app'; // <- tu AppComponent
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
}).catch((err) => console.error(err));
