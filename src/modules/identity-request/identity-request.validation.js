import z from 'zod';
import { generalFields } from '../../common/validation/index.js';



export const identityRequestSchema = (lang) => z.object({
    params: z.strictObject({
        messageId: generalFields.id(lang)
    })
})

export const respondIdentityRequestSchema = (lang) => z.object({
    params: z.strictObject({
        requestId: generalFields.id(lang)
    }),
    body: z.strictObject({
        status: z.enum(["accepted", "rejected"])
    })
});

export const requestSchema = (lang) => z.object({
    params: z.strictObject({
        requestId: generalFields.id(lang)
    }),
});

