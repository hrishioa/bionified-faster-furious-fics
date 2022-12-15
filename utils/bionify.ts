const defaultAlgoParameters = '- 0 1 1 2 0.4';

type AlgoParameters = {
  exclude: boolean;
  sizes: number[];
  restRatio: number;
};

const commonWords = [
  'the',
  'be',
  'to',
  'of',
  'and',
  'a',
  'an',
  'it',
  'at',
  'on',
  'he',
  'she',
  'but',
  'is',
  'my',
];

export type IdConfig = {prefix: string, startId: number};

export function bioHTML(html: string, idConfig: IdConfig, algoParameters?:
AlgoParameters) {

  if (!algoParameters)
    algoParameters = parseAlgoParameters(defaultAlgoParameters);

  const splitTextWithTags = html
    .replace(/\&nbsp\;/g, ' ')
    .split(/(<[^>]*>)/g);

  const bionified = splitTextWithTags.map((token) => {
    if (token.startsWith('<') && token.endsWith('>')) return token;
    return bioText(token, idConfig, algoParameters as AlgoParameters);
  });

  return bionified.join('')+'<span class="dom-check-tag"></span>';
}

export function bioText(text: string, idConfig: IdConfig, algoParameters: AlgoParameters) {
  function bioWord(word: string, algoParameters: AlgoParameters) {
    if (!word.length || word.search(/\w/g) === -1) return bioRest(word);

    function isCommon(word: string) {
      return commonWords.indexOf(word) != -1;
    }

    const index = word.length - 1;

    let numBold = 1;

    if (word.length <= 3 && algoParameters.exclude) {
      if (isCommon(word)) return bioRest(word);
    }

    if (index < algoParameters.sizes.length) {
      numBold = algoParameters.sizes[index];
    } else {
      numBold = Math.ceil(word.length * algoParameters.restRatio);
    }

    return (
      bioEmphasize(word.slice(0, numBold))+
      bioRest(word.slice(numBold))
    );
  }

  function bioRest(text: string) {
    return `<span class="bio-tag bio-rest tp-${idConfig.prefix}${idConfig.startId++}">${text}</span>`
  }

  function bioEmphasize(text: string) {
    return `<span class="bio-tag bio-emphasize tp-${idConfig.prefix}${idConfig.startId++}">${text}</span>`
  }

  let res = '';
  for (const word of text.split(' ')) {
    res += bioWord(word+' ', algoParameters);
  }
  return res;
}

function parseAlgoParameters(paramStr: string): AlgoParameters {
  try {
    const res: AlgoParameters = {
      exclude: true,
      sizes: [],
      restRatio: 0.4,
    };

    const parts = paramStr.split(' ');

    if (parts[0] == '+') {
      res.exclude = false;
    }

    res.restRatio = Number(parts[parts.length - 1]);

    for (let i = 1; i < parts.length - 1; i++) {
      res.sizes.push(parseInt(parts[i]));
    }
    return res;
  } catch (err) {
    const defaultRes: AlgoParameters = {
      exclude: true,
      sizes: [1, 1, 2],
      restRatio: 0.4,
    };
    console.error('Algorithm parameters were not parsed - ', err);
    return defaultRes;
  }
}
