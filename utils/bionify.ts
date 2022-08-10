const defaultRestSheet = 'opacity: 0.9;';
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

export function bioHTML(html: string, algoParameters?: AlgoParameters) {
  if (!algoParameters)
    algoParameters = parseAlgoParameters(defaultAlgoParameters);

  const splitTextWithTags = decodeURIComponent(html)
    .replace(/\&nbsp\;/g, ' ')
    .split(/(<[^>]*>)/g);

  const bionified = splitTextWithTags.map((token) => {
    if (token.startsWith('<') && token.endsWith('>')) return token;
    return bioText(token, algoParameters as AlgoParameters);
  });

  return bionified.join('');
}

export function bioText(text: string, algoParameters: AlgoParameters) {
  let res = '';
  for (const word of text.split(' ')) {
    res += bioWord(word, algoParameters) + ' ';
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

function bioWord(word: string, algoParameters: AlgoParameters) {
  if (!word.length || word.search(/\w/g) === -1) return word;

  function isCommon(word: string) {
    return commonWords.indexOf(word) != -1;
  }

  const index = word.length - 1;

  let numBold = 1;

  if (word.length <= 3 && algoParameters.exclude) {
    if (isCommon(word)) return word;
  }

  if (index < algoParameters.sizes.length) {
    numBold = algoParameters.sizes[index];
  } else {
    numBold = Math.ceil(word.length * algoParameters.restRatio);
  }

  return (
    '<span class="bio-emphasize">' +
    word.slice(0, numBold) +
    '</span>' +
    '<span class="bio-rest">' +
    word.slice(numBold) +
    '</span>'
  );
}
