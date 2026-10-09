
import { UserModel } from "../../DB/model/index.js"
import { ConflictException, NotFoundException } from "../../common/exceptions/index.js";
import { find, findById, findByIdAndUpdate, findOne } from "../../common/repository/index.js";
import { ConvertToObjectId } from "../../common/utils/index.js";

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

// get one user
export const showUser = async ({ userid }) => {
    const user = await findById({
        model: UserModel,
        id: ConvertToObjectId(userid),
        select: '-password'
    })
    if (!user) {
        NotFoundException({
            message: 'User not found',
        });
    }
    return user
}

//editUser
export const editUser = async ({ userid }, inputs) => {
    const { email, userName, ...rest } = inputs;

    if (email) {
        const existingUser = await findOne({
            model: UserModel,
            filter: {
                email,
                _id: { $ne: ConvertToObjectId(userid) },
            },
            select: 'email',
        })
        if (existingUser) {
            ConflictException({
                message: 'Email already exists',
            });
        }
    }

    const update = { ...rest };

    if (userName !== undefined) {
        const [firstName, ...lastNameParts] = userName.trim().split(/\s+/);

        update.firstName = firstName;
        update.lastName = lastNameParts.join(' ');
    }

    const user = await findByIdAndUpdate({
        model: UserModel,
        id: ConvertToObjectId(userid),

        update: {
            $set: update,
        },
        options: {
            returnDocument: 'after',
        },
    })

    if (!user) {
        NotFoundException({
            message: 'User not found',
        });
    }
    return user

}