import { SystemLanguageEnum } from '../enum/index.js';
import ar from '../locales/ar.json' with { type: 'json' };
import en from '../locales/en.json' with { type: 'json' };

const validationMessage = {
    [SystemLanguageEnum.AR]: ar.validation,
    [SystemLanguageEnum.EN]: en.validation,
};

export const getValidationMessage = (lang, code) => {
    const messages =
        validationMessage[lang] ?? validationMessage[SystemLanguageEnum.EN];

    return (
        messages[String(code)] ??
        validationMessage[SystemLanguageEnum.EN][String(code)]
    );
};