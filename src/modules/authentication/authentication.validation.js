
import z from 'zod';
import { generalFields } from '../../common/validation/index.js';
import { RoleEnum } from '../../common/enum/index.js';
import { getValidationMessage } from '../../common/utils/index.js';


export const loginSchema = (lang) =>
    z.strictObject({
        email: generalFields.email(lang),
        password: generalFields.password(lang),
    });

export const login = (lang) =>
    z.object({
        body: loginSchema(lang),
    });


export const signUp = (lang) =>
    z.object({
        body: loginSchema(lang)
            .safeExtend({
                userName: generalFields.userName(lang),
                confirmPassword: generalFields.confirmPassword(lang),
                DOB: z.iso.date({
                    error: (issue) =>
                        !issue.input
                            ? getValidationMessage(lang, 114)
                            : getValidationMessage(lang, 115),
                }),

                role: z
                    .enum(RoleEnum, {
                        error: getValidationMessage(lang, 116),
                    })
                    .default(RoleEnum.User),

                gender: generalFields.gender(lang),
                phone: generalFields.phone(lang),
            })
            .superRefine((data, ctx) => {
                generalFields.matchFields({
                    original: 'password',
                    copy: 'confirmPassword',
                    data,
                    ctx,
                    lang,
                });
                const nameParts = data.userName.split(/\s+/);
                if (nameParts.length < 2) {
                    ctx.addIssue({
                        code: 'custom',
                        path: ['userName'],
                        message: getValidationMessage(lang, 113),
                    });
                }
            }),
    });

