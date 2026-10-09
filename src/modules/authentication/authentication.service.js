import { ConflictException, NotFoundException, UnauthorizedException } from "../../common/exceptions/index.js";
import { createOne, findOne } from "../../common/repository/index.js"
import { UserModel } from "../../DB/model/index.js"


export const signUp = async ({ email, password, phone, DOB, userName }) => {
    const dublicateAccount = await findOne({
        model: UserModel,
        filter: { email },
        select: 'email'
    })
    if (dublicateAccount) {
        ConflictException({
            message: 'Email already exists',
        });
    }

    const Account = await createOne({
        model: UserModel,
        data: { email, password, phone, DOB, userName }
    })
    return Account

}

export const login = async ({ email, password }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email },
        select: 'email'
    })
    if (!account) {
        NotFoundException({
            message: 'Account not found',
        });
    }
    if (account.password !== password) {
        UnauthorizedException({
            message: 'Invalid password',
        });
    }

    const user = await findOne({
        model: UserModel,
        select: '- password'
    })

    return user;

}