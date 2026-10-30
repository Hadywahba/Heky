
import { UserModel } from "../../DB/model/index.js"
import { ConflictException, NotFoundException } from "../../common/exceptions/index.js";
import { find, findByIdAndDelete, findByIdAndUpdate, findOne } from "../../common/repository/index.js";
import { decrypt } from "../../common/security/index.js";
import { del, get, keys, set } from "../../common/services/index.js";
import { userProfileKey } from "../../common/token/index.js";
import { ConvertToObjectId, getValidationMessage } from "../../common/utils/index.js";

// get all users
export const showAllUsers = async () => {
    const users = await find({
        model: UserModel,
        select: '-password'
    })

    if (!users) {
        NotFoundException({
            message: 'Users not found',
        });
    }

    return users
}

// Get One User
export const showUser = async (user) => {
    const key = userProfileKey({ userId: user._id });

    // Check Cache
    const cachedProfile = await get({ key });

    if (cachedProfile) {
        if (cachedProfile.phone) {
            cachedProfile.phone = await decrypt(cachedProfile.phone);
        }

        return cachedProfile;
    }

    // Cache Miss
    const profile = user.toObject();

    // Save Encrypted Profile in Redis
    await set({
        key,
        value: profile,
        ttl: 60 * 15,
    });

    // Decrypt Phone Before Returning
    if (profile.phone) {
        profile.phone = await decrypt(profile.phone);
    }

    return profile;
};

//editUser
export const editUser = async (user, inputs, lang) => {
    const { email, userName, ...rest } = inputs;

    if (email) {
        const existingUser = await findOne({
            model: UserModel,
            filter: {
                email,
                _id: { $ne: ConvertToObjectId(user._id) },
            },
            select: 'email',
        })
        if (existingUser) {
            ConflictException({
                message: getValidationMessage(lang, 120),
            });
        }
    }

    const update = { ...rest };

    if (email !== undefined) {
        update.email = email;
    }

    if (userName !== undefined) {
        const [firstName, ...lastNameParts] = userName.trim().split(/\s+/);

        update.firstName = firstName;
        update.lastName = lastNameParts.join(' ');
    }

    const userAccount = await findByIdAndUpdate({
        model: UserModel,
        id: ConvertToObjectId(user._id),

        update: {
            $set: update,
        },
        options: {
            returnDocument: 'after',
        },
    })

    if (!userAccount) {
        NotFoundException({
            message: 'User not found',
        });
    }

    await del({
        key: userProfileKey({ userId: user._id }),
    });
    return userAccount

}

// Delete user
export const deleteUser = async (user) => {

    const userAccount = await findByIdAndDelete({
        model: UserModel,
        id: ConvertToObjectId(user._id),
    })
    if (!userAccount) {
        NotFoundException({
            message: 'User not found',
        });
    }

    await del({
        key: userProfileKey({ userId: user._id }),
    });

    return userAccount;

}
