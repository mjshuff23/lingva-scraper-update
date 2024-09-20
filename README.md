## Installation

Just install the package using NPM

```shell
npm i --save lingva-scraper-update-update
```

Or using Yarn

```shell
yarn add lingva-scraper-update-update
```

And import it directly using CommonJS

```javascript
const { getTranslationInfo } = require("lingva-scraper-update");
```

Or with the ES6 syntax

```javascript
import { getTranslationInfo } from "lingva-scraper-update";
```

The package doesn't provide a default export, but you can alternatively use the wildcard import syntax

```javascript
import * as LingvaScraper from "lingva-scraper-update";
```


## Usage

### Main API

#### Translation text

```typescript
getTranslationText(source: LangCode<"source">, target: LangCode<"target">, query: string): Promise<string | null>
```

Retrieves the translated text given a pair of languages and a query text.

```typescript
import { getTranslationText } from "lingva-scraper-update";

const translation = await getTranslationText("auto", "es", "win");
```

#### Translation information

```typescript
getTranslationInfo(source: LangCode<"source">, target: LangCode<"target">, query: string): Promise<TranslationInfo | null>
```

Retrieves the full translation information, optionally including the detected source, typos, pronunciation representations, definitions, examples, similar words or extra translations.

```typescript
import { getTranslationInfo } from "lingva-scraper-update";

const info = await getTranslationInfo("zh", "en", "早安");
```

#### Text to speech

```typescript
getAudio(lang: LangCode<"target">, text: string, isSlow?: boolean): Promise<number[] | null>
```

Retrieves an audio buffer in the form of a `Uint8Array`, and represented as a `number[]` in order to be serializable.

```typescript
import { getAudio } from "lingva-scraper-update";

const audio = await getAudio("ca", "gerd");
```

### Utilities

There are also some utility constants and functions exported in order to ease the use of the package.

+ `LanguageType`

An enumeration representing the two language types (*source* and *target*) and very used among the rest of utilities.

```typescript
import { LanguageType } from "lingva-scraper-update";

LanguageType.SOURCE // "source"
LanguageType.TARGET // "target"
```

+ `languageList`

An object that includes the whole list of languages used in this package, as well as two other properties with the language list filtered by type.

```typescript
import { languageList } from "lingva-scraper-update";

languageList.all // whole list
languageList.source // i.e. languageList[LanguageType.SOURCE]
languageList.target // i.e. languageList[LanguageType.TARGET]
```

+ `isValidCode()`

A function that checks whether a string is a valid language code, optionally differentiating it based on a certain language type.

```typescript
import { isValidCode } from "lingva-scraper-update";

const isValidLang = isValidCode(str);
const isValidSource = isValidCode(str, LanguageType.SOURCE);
```

+ `replaceExceptedCode()`

A function that checks whether a language code is valid regarding a language type, and changes it with a suitable replacement if not.

```typescript
import { replaceExceptedCode } from "lingva-scraper-update";

const targetLang = replaceExceptedCode(LanguageType.TARGET, lang);
```

+ `mapGoogleCode()`

A function that maps the given *Lingva* language code with a valid *Google* one, in case they're different.

```typescript
import { mapGoogleCode } from "lingva-scraper-update";

const googleLang = mapGoogleCode(lang);
```

+ `mapLingvaCode()`

A function that maps the given *Google* language code with a valid *Lingva* one, in case they're different.

```typescript
import { mapLingvaCode } from "lingva-scraper-update";

const lang = mapLingvaCode(googleLang);
```


## Related projects

+ [Lingva Translate](https://github.com/thedaviddelta/lingva-translate) - The web application for which this package was built
+ [SimplyTranslate-Engines](https://codeberg.org/SimpleWeb/SimplyTranslate-Engines) - The backend for SimplyTranslate, which helped to discover some key endpoints
+ [Kainet Scraper](https://github.com/thedaviddelta/kainet-scraper) - A YouTube Music scraper built by the same author with a similar structure


## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://fosstodon.org/@thedaviddelta"><img src="https://avatars.githubusercontent.com/u/6679900?v=4?s=100" width="100px;" alt=""/><br /><sub><b>David</b></sub></a><br /><a href="https://github.com/thedaviddelta/lingva-scraper/commits?author=thedaviddelta" title="Code">💻</a> <a href="https://github.com/thedaviddelta/lingva-scraper/commits?author=thedaviddelta" title="Documentation">📖</a> <a href="#design-thedaviddelta" title="Design">🎨</a> <a href="https://github.com/thedaviddelta/lingva-scraper/commits?author=thedaviddelta" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!


## License

[![](https://www.gnu.org/graphics/gplv3-with-text-136x68.png)](https://www.gnu.org/licenses/agpl-3.0.html)

Copyright © 2022 [thedaviddelta](https://github.com/thedaviddelta) & contributors.  
This project is [GNU GPLv3](./LICENSE) licensed.
