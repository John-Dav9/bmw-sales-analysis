import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/services/users/users.service';

async function run() {
  // Crée un contexte d’application NestJS sans lancer le serveur HTTP
  const app = await NestFactory.createApplicationContext(AppModule);
  const users = app.get(UsersService);

  const email = 'tchomguijohn@gmail.com';
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Ajoute name et surname pour éviter l’erreur de contrainte NOT NULL
  const name = 'john';
  const surname = 'TCHOMGUI';

  // Assure la création de l’admin si inexistant
  const admin = await users.ensureAdmin(email, passwordHash, name, surname);

  console.log('✅ Admin prêt :', admin.email, '(mdp: admin123)');
  await app.close();
}

run().catch((err) => {
  console.error('❌ Erreur lors du seed admin :', err);
  process.exit(1);
});
