import * as express from 'express'
import * as bodyParser from 'body-parser'
import *  as helmet from 'helmet'
import * as passport from 'passport'
import { verify } from 'jsonwebtoken'
import { Response } from 'express'
import * as authenticate from './db/authenticate.db'
const app = express()
require('dotenv').config()

if (!process.env.NODE_ENV) require('dotenv').config()
const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV === 'production') {
  require('http').globalAgent.maxSockets = Infinity
} else {
  require('http').globalAgent.maxSockets = 5
  app.use(require('morgan')('dev'))
}

authenticate.authenticate(passport)
app.use(passport.initialize())

app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(function (req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', '*') // uncomment if server is used as API
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT')
  next()
})


// Imported routes to be used
const authRoutes = require('./routes/auth.routes.js')
const transactionRoutes = require('./routes/transaction.routes.js')
const profileRoutes = require('./routes/profile.routes.js')
const accountRoutes = require('./routes/accounts.routes.js')
const categoriesRoutes = require('./routes/categories.routes.js')

// Route used to Authenticate //
app.use('/authenticate', authRoutes)

//Unauthenticated Routes

// Route to verify Authentication
app.use((req, res, next) => {
  let authorization
  try {
    authorization = req.headers.authorization.slice(6, req.headers.authorization.length).trim()
  } catch (error) {
    throw new Error(`Client didn't send a token in the headers.`)
  }
  
  verify(authorization, /*req.query.token.toString(),*/ process.env.JSONWEBTOKEN_SECRET, (error, decoded) => {
    if (error) {
      /**
       * Possible errors as of 4/24/2018:
       * JsonWebTokenError
       * NotBeforeError
       * TokenExpiredError
       * 
       * Error Params: name, message, expiredAt
       */
      res.send(error)
    }
    else {
      res.locals.decoded = decoded
      next()
    }
  })
})

// Authenticated Route //
app.use('/', profileRoutes)
app.use('/', transactionRoutes)
app.use('/', accountRoutes)
app.use('/', categoriesRoutes)



//Error Handling, always goes last. 
app.use(function (error: Error, _req, res: Response, _next) {
  console.error('*****************SERVER ERROR MESSAGE*****************')
  console.error(error)
  console.error('***********************************************')
  if (error) {
    res.send({statusCode: 403, error: error.message})
  } else {
    res.send('There was an unknown error in the system, please try again!')
  }
})

app.listen(PORT, function () {
  console.log(`Listening on port: ${PORT}`)
})

