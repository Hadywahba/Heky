import { TooManyRequestsException } from "../exceptions/index.js";
import { UserEmailLoginTrialsKey } from "../keys/index.js";
import { expire, get, incrBY, ttl } from "../services/index.js";

// Check Email Block
export const checkEmailBlock = async ({
    email,
    subject,
    maxtries = 5,
}) => {
    const trials = Number(
        await get({
            key: UserEmailLoginTrialsKey({ email, subject }),
        }) ?? 0
    );

    if (trials >= maxtries) {
        const remainingTime = await ttl({ key: UserEmailLoginTrialsKey({ email, subject }) });

        TooManyRequestsException({
            message: `Too many login attempts. Try again after ${remainingTime} seconds.`,
        });
    }
};

// Record Failed Attempt
export const recordFailedAttempt = async ({
    email,
    subject,
    maxtries = 5,
    blockInSecond = 300,
}) => {
    const key = UserEmailLoginTrialsKey({ email, subject });

    const currentTrials = await incrBY({ key });

    if (currentTrials >= maxtries) {
        await expire({
            key,
            ttl: blockInSecond,
        });
    }

    return currentTrials;
};