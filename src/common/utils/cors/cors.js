import { CORS_LIST } from "../../../config.js"
import { BadRequestException } from "../../exceptions/index.js";


export const corsOptions = () => {
    const white_list = CORS_LIST.split(",");
    const corsOptions = {
        origin: function (origin, callback) {
            if (white_list.includes(origin)) {
                callback(null, true)
            } else if (!origin) {
                callback(null, true)
            }
            else {
                callback(BadRequestException({
                    message: 'not Allowed By CORS'
                }))
            }
        },
        // methods: ["GET", "POST", "DELETE", "PATCH"]
    }
    return corsOptions
}