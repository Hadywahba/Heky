import z from 'zod';
import { generalFields } from '../../common/validation/index.js';
import { getValidationMessage } from '../../common/utils/index.js';

export const messageSchema = (lang) => z.object({
    body: z.strictObject({
        receiverId: generalFields.id(lang),
        content: z.string().trim().min(2, getValidationMessage(lang, 124)).max(50000, getValidationMessage(lang, 125)).optional(),
    }),
    files: z.array(generalFields.file(lang)).max(3, getValidationMessage(lang, 127)).optional()

}).superRefine((data, ctx) => {
    if (!data.body.content && !data.files?.length) {
        ctx.addIssue({
            code: 'custom',
            path: ['content'],
            message: getValidationMessage(lang, 126),
        });
    }
})


export const ShowmessageSchema = (lang) => z.object({
    query: z.strictObject({
        type: z.enum(['sender', 'receiver', 'all']).default('all'),
        search: z.string().trim().optional(),
        status: z.enum(['pending', 'accept', 'reject']).default('pending'),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(5),
    })
})



