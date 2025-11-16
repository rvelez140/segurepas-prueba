import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import 'dotenv/config';
import { UserService } from '../services/UserService';
import { IUser } from '../interfaces/IUser';

// Configurar la estrategia de Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/api/auth/google/callback',
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: any) => {
      try {
        // Buscar si el usuario ya existe por email
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error('No se pudo obtener el email de Google'), null);
        }

        let user = await UserService.findByEmail(email);

        if (user) {
          // Si el usuario existe, actualizar googleId si no lo tiene
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Si el usuario no existe, crear uno nuevo
        // Por defecto, los usuarios que se registran con Google son residentes
        // Se les puede pedir que completen su perfil después
        const newUser: Partial<IUser> = {
          auth: {
            email,
            password: '', // No requiere password para login con Google
          },
          name: profile.displayName || profile.name?.givenName || 'Usuario',
          role: 'residente',
          googleId: profile.id,
          registerDate: new Date(),
          updateDate: new Date(),
        };

        user = await UserService.createUserWithGoogle(newUser as IUser);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Configurar la estrategia de Microsoft OAuth
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:8000/api/auth/microsoft/callback',
      scope: ['user.read'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Buscar si el usuario ya existe por email
        const email = profile.emails?.[0]?.value || profile.userPrincipalName;

        if (!email) {
          return done(new Error('No se pudo obtener el email de Microsoft'), null);
        }

        let user = await UserService.findByEmail(email);

        if (user) {
          // Si el usuario existe, actualizar microsoftId si no lo tiene
          if (!user.microsoftId) {
            user.microsoftId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Si el usuario no existe, crear uno nuevo
        // Por defecto, los usuarios que se registran con Microsoft son residentes
        // Se les puede pedir que completen su perfil después
        const newUser: Partial<IUser> = {
          auth: {
            email,
            password: '', // No requiere password para login con Microsoft
          },
          name: profile.displayName || profile.name?.givenName || 'Usuario',
          role: 'residente',
          microsoftId: profile.id,
          registerDate: new Date(),
          updateDate: new Date(),
        };

        user = await UserService.createUserWithGoogle(newUser as IUser);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serializar y deserializar usuario para sesiones
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserService.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
