import z from 'zod';
import { generalFields } from '../../common/validation/index.js';
import { getValidationMessage } from '../../common/utils/index.js';


export const conversationSchema = (lang) => z.object({
    params: z.strictObject({
        conversationId: generalFields.id(lang)
    }),
});

export const messageConversationSchema = (lang) => z.object({
    body: z.strictObject({
        conversationId: generalFields.id(lang),
        content: z.string().trim().min(2, getValidationMessage(lang, 124)).max(50000, getValidationMessage(lang, 125)).optional(),
    }),
    files: z.array(generalFields.file(lang)).max(3, getValidationMessage(lang, 127)).optional(),


}).superRefine((data, ctx) => {
    if (!data.body.content && !data.files?.length) {
        ctx.addIssue({
            code: 'custom',
            path: ['content'],
            message: getValidationMessage(lang, 126),
        });
    }
})


