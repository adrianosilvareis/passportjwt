
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken')

const users = [
  { _id: 1, username: 'adriano', password: '1234', email: 'adriano@email.com' },
]

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(session({
  secret: 'secretOfSession',
  saveUninitialized: true,
  resave: true
}))

//passport init
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(
  (username, password, done) => {
    //busca usuario no banco
    const user = users.find((user) => user.username === username)
    
    if (user) {
      //username correto
      if(user.password === password) {
        // login correto
        return done(null, user)
      } else {
        //senha incorreta
        return done(null, false, { message: 'Senha incorreta' })
      }
    } else {
      //usuário não encontrado
      return done(null, false, { message: 'usuário não encontrado' })
    }
  }
))

app.get('/', (req, res) => {
  res.json({ message: 'Bem vindo ao sistema' })
}) 

app.get('/logout', (req, res) => {
  res.json({ message: 'Falha ao tentar logar', request: req.params })
})

// successRedirect: '/', failureRedirect: '/logout'

app
  .post('/login', 
      passport.authenticate('local', { session: false }), 
      (req, res, next) => {
        user = req.body
        const token = jwt.sign(user, 'your_jwt_secret')
        return res.json({user, token})
    })

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((_id, done) => {

  const user = users.find((user) => user._id === _id)

  if (user) {
    done(null, user)
  } else {
    done(null, false)
  }
})

app.listen(3000)