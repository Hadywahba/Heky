import { client } from "../../DB/redis.connection.js"

// Set
export const set = async ({ key, value, ttl = undefined } = {}) => {
    if (typeof value == "object") {
        value = JSON.stringify(value)
    }
    return await client.set(key, value, { EX: ttl })
}

// Get
export const get = async ({ key } = {}) => {
    let value = await client.get(key)
    try {
        return JSON.parse(value)
    } catch (error) {
        return value
    }
}

// Exists
export const exist = async ({ key } = {}) => {
    return await client.exists(key)

}

// Update
export const update = async ({ key, value, ttl = undefined } = {}) => {
    if (!await exist({ key })) {
        return 0
    }
    return await set(key, value, ttl)
}

// delete
export const del = async ({ key } = {}) => {

    return await client.del(key)
}

// Keys
export const keys = async ({ prefix } = {}) => {

    return await client.keys(`${prefix}*`)
}

// ttl
export const ttl = async ({ key } = {}) => {
    return await client.ttl(key)
}

// expire
export const expire = async ({ key, ttl } = {}) => {
    return await client.expire(key, ttl)
}