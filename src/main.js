
import express from 'express'
import "./common/github/index.js";
import { authenticationController, messageController, userController } from './modules/index.js';
import { globalErrorHandling } from './middleware/index.js';
import { PORT } from './config.js';
import { bootstrapDB } from './DB/connection.db.js';
import cors from 'cors'
import passport from "passport";
import { corsOptions } from './common/utils/index.js';
import helmet from "helmet";





const app = express()


app.use(helmet(), cors(corsOptions()))
app.use(express.json());
app.use(passport.initialize());
app.use('/public', express.static('public'));
await bootstrapDB(app, PORT)


app.get('/', (req, res) => res.send('Welcome To Our API'))
app.use('/auth', authenticationController)
app.use('/message', messageController)
app.use('/user', userController)


// Routing Error
app.all('/*dummy', (req, res) => {
    res.status(404).json({ message: 'Not Found Routes' })
})

// Error MiddleWare
app.use(globalErrorHandling)


