// import * as session from 'express-session';
import * as passport from 'passport';
import * as session from 'express-session';

/**
 * session 적용 설정
 * @param app
 */
export const sessionConfig = (app) => {
  app.use(
    session({
      name: process.env.SESSION_ID,
      resave: false,
      saveUninitialized: true,
      secret: process.env.COOKIE_SECRET,
      cookie: {
        maxAge: 60000,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
};
