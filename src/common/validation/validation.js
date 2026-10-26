
import z from 'zod';
import { GenderEnum } from '../enum/index.js';
import { getValidationMessage } from '../utils/index.js';



const matchFields = ({ original, data, copy, ctx, lang }) => {
    if (data[original] !== data[copy]) {
        ctx.addIssue({
            code: 'custom',
            path: [copy],
            message: getValidationMessage(lang, 112),
        });
    }
};

const passwordSchema = (lang) =>
    z
        .string()
        .nonempty(getValidationMessage(lang, 106))
        .min(8, getValidationMessage(lang, 107))
        .regex(/[A-Z]/, getValidationMessage(lang, 108))
        .regex(/[a-z]/, getValidationMessage(lang, 109))
        .regex(/[0-9]/, getValidationMessage(lang, 110))
        .regex(/[!@#$%^&*]/, getValidationMessage(lang, 111));

export const generalFields = {
    userName: (lang) =>
        z
            .string()
            .trim()
            .min(2, getValidationMessage(lang, 102))
            .nonempty(getValidationMessage(lang, 103)),

    email: (lang) =>
        z.email({
            error: (issue) =>
                !issue.input
                    ? getValidationMessage(lang, 105)
                    : getValidationMessage(lang, 104),
        }),

    phone: (lang) =>
        z.e164({
            error: (issue) =>
                !issue.input
                    ? getValidationMessage(lang, 118)
                    : getValidationMessage(lang, 119),
        }),

    password: passwordSchema,

    confirmPassword: (lang) =>
        z.string().nonempty(getValidationMessage(lang, 106)),

    gender: (lang) =>
        z.enum(GenderEnum, {
            error: getValidationMessage(lang, 117),
        }).default(GenderEnum.MALE),


    matchFields,
};
