import 'dotenv/config';
import mongoose from 'mongoose';
import { Visit } from '../src/models/Visit';
import { User } from '../src/models/User';

async function clearDataBase() {
  const MONGODB_URI = process.env.MONGODB_URI || '';

  await mongoose.connect(MONGODB_URI);

  await User.deleteMany({});
  await Visit.deleteMany({});

  console.log('Se ha limpiado la base de datos correctamente');

  await mongoose.disconnect();
}

clearDataBase();
