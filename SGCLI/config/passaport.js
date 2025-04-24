const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Usuario = require('../Controler/model_criar_usuario'); // ajuste conforme seu path

module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'cpf',
    passwordField: 'senha'
  }, async (cpf, senha, done) => {
    try {
      const usuario = await Usuario.findOne({ where: { cpf } });
      if (!usuario) return done(null, false, { message: 'Usuário não encontrado' });

      const match = await bcrypt.compare(senha, usuario.senha);
      if (!match) return done(null, false, { message: 'Senha incorreta' });

      return done(null, usuario);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((usuario, done) => done(null, usuario.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const usuario = await Usuario.findByPk(id);
      done(null, usuario);
    } catch (err) {
      done(err);
    }
  });
};
