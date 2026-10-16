import { SALT } from "../../config.js";
import bcrypt from 'bcrypt'
import { SecuirtyHashEnum } from "../enum/index.js";
import argon2 from "argon2";



export const hash = async ({ plaintext, salt_round = SALT, minnor = 'b', approach = SecuirtyHashEnum.BYCRYPT }) => {
    let cipherText = undefined;
    switch (approach) {
        case SecuirtyHashEnum.BYCRYPT:
            const saltSignature = await bcrypt.genSalt(salt_round, minnor);
            cipherText = await bcrypt.hash(plaintext, saltSignature);
            break;

        case SecuirtyHashEnum.ARGON2:
            cipherText = await argon2.hash(plaintext);
            break;

        default:
            break;
    }



    return cipherText
}


export const compare = async (plaintext, cipherText, approach = SecuirtyHashEnum.BYCRYPT) => {
    let match = false;
    switch (approach) {
        case SecuirtyHashEnum.BYCRYPT:
            match = await bcrypt.compare(plaintext, cipherText);
            break;

        case SecuirtyHashEnum.ARGON2:
            match = await argon2.verify(cipherText, plaintext);
            break;

        default:
            break;
    }


    return match
}