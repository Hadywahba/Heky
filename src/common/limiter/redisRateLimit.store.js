import { client } from "../../DB/redis.connection.js";

const WINDOW_MS = 15 * 60 * 1000;
const WINDOW_SECONDS = WINDOW_MS / 1000;

export const redisRateLimitStore = {
    async increment(key) {
        const count = await client.incr(key);

        if (count === 1) {
            await client.expire(key, WINDOW_SECONDS);
        }

        const ttl = await client.ttl(key);

        return {
            totalHits: count,
            resetTime: new Date(Date.now() + ttl * 1000)
        };
    },

    async decrement(key) {
        await client.decr(key);
    },

    async resetKey(key) {
        await client.del(key);
    }
};