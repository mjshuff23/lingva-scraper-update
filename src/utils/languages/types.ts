import { languages, exceptions, mappings } from '.';
import { LanguageType } from '../constants';
export { LanguageType };

export type LangType = (typeof LanguageType)[keyof typeof LanguageType];

export type LangCode<T extends LangType | void = void> = T extends LangType
  ? Exclude<keyof typeof languages, keyof (typeof exceptions)[T]>
  : keyof typeof languages;

export type LangCodeGoogle<T extends LangCode | LangType = LangCode> =
  T extends LangType
      ?
            | Exclude<LangCode<T>, keyof (typeof mappings)["request"]>
            | keyof (typeof mappings)["response"]
      :
            | Exclude<T, keyof (typeof mappings)["request"]>
            | keyof (typeof mappings)["response"];