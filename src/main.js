
import express from 'express'
import "./common/github/index.js";
import { authenticationController, messageController, userController, identityController, conversationController } from './modules/index.js';
import { globalErrorHandling } from './middleware/index.js';
import { PORT } from './config.js';
import { bootstrapDB } from './DB/connection.db.js';
import cors from 'cors'
import passport from "passport";
import { corsOptions, successResponse } from './common/utils/index.js';
import helmet from "helmet";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import geoip from 'geoip-lite'
import { expire } from './common/services/cache.service.js';
import { redisRateLimitStore } from './common/limiter/index.js';

export const fromWhere = (ip) => {
    try {
        return geoip.lookup(ip)
    } catch (error) {
        console.log(error)
    }
}
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 1 minutes
    limit: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes).


    // limit: function (req) {
    //     const data = fromWhere(req.ip);
    //     return data?.country == 'EG' ? 3 : 0
    // },


    standardHeaders: 'draft-8',
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    handler: function (req, res, next) {
        return successResponse({
            res, status: 429, message: 'Too Many Requests'
        })
    },
    keyGenerator: function (req) {
        const ip = ipKeyGenerator(req.ip, 52);
        return `${ip} :: ${req.path}`
    },


    store: redisRateLimitStore,
})


const app = express()

app.set("trust proxy", true)
app.use(helmet(), limiter, cors(corsOptions()), (req, res, next) => {
    console.log(req.rateLimit);
    next()
})
app.use(express.json());
app.use(passport.initialize());
app.use('/public', express.static('public'));
await bootstrapDB(app, PORT)


app.get('/', (req, res) => res.send('Welcome To Our API'))
app.use('/auth', authenticationController)
app.use('/message', messageController)
app.use('/user', userController)
app.use('/identity-request', identityController)
app.use('/conversation', conversationController)

// Routing Error
app.all('/*dummy', (req, res) => {
    res.status(404).json({ message: 'Not Found Routes' })
})

// Error MiddleWare
app.use(globalErrorHandling)


