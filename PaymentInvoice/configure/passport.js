const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const handle = require('../controllers/TaiKhoan_Control');

passport.use(new localStrategy({
        passReqToCallback: true
    },
    (req, username, password, done) => {
        handle.kiemtraTaiKhoanLogin(req, username, password, done);
        // sau khi kiểm tra thành công sẽ gọi đến passport.serializeUser
    }
));

/**
 * cái này dùng để ghi cookie
 */
passport.serializeUser((user, done) => done(null, user));

/**
 * kiểm tra tài khoản cookie
 */
passport.deserializeUser((user, done) => {
    if (user)
        return done(null, user);
    else
        return done(null, false);
});