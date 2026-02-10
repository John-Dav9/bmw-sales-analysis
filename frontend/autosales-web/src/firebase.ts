import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { environment } from './environments/environment';

const app = initializeApp(environment.firebase);

isSupported()
  .then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  })
  .catch(() => {
    // Analytics non supporté (ex: SSR ou navigateur bloqué)
  });
