import { createClient } from "redis"
import { REDIS_URI } from "../config.js";

export const client = createClient({
    url: REDIS_URI
});

 export const connectionRedis = async () => {
    try {

        await client.connect()
        console.log('Redis connection Successfully')

    } catch (error) {
        console.log(' faield to  connection Redis', error)

    }
}