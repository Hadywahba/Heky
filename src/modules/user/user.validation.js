import z from 'zod';
import { generalFields } from '../../common/validation/index.js';
import { getValidationMessage } from '../../common/utils/index.js';
import { GenderEnum } from '../../common/enum/index.js';


export const userSchema = (lang) =>
    z.object({
        body: z
            .strictObject({
                userName: generalFields
                    .userName(lang)
                    .refine(
                        (value) => value.split(/\s+/).length >= 2,
                        {
                            message: getValidationMessage(lang, 113),
                        }
                    )
                    .optional(),

                email: generalFields.email(lang).optional(),

                phone: generalFields.phone(lang).optional(),

                gender: z
                    .enum(GenderEnum, {
                        error: getValidationMessage(lang, 117),
                    })
                    .optional(),

                DOB: z.iso.date({
                    error: (issue) =>
                        !issue.input
                            ? getValidationMessage(lang, 114)
                            : getValidationMessage(lang, 115),
                }).optional(),
            })
            .refine(
                (data) => Object.keys(data).length > 0,
                {
                    message: 'At least one field must be provided.',
                }
            ),
    });