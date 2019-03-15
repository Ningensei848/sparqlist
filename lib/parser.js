const commonmark    = require('commonmark');
const xpath         = require('xpath');
const { DOMParser } = require('xmldom');

module.exports = class SPARQLetParser {
  parse(markdown) {
    const parser   = new commonmark.Parser();
    const renderer = new commonmark.HtmlRenderer();
    const html     = renderer.render(parser.parse(markdown.toString()));

    return parseHtml(html);
  }
};

function parseHtml(html) {
  const doc   = new DOMParser().parseFromString(html);
  const title = xpath.select1('//h1', doc).textContent;

  return {
    title,
    params:     extractParams(doc),
    procedures: extractProcedures(doc)
  };
}

const hn = '(self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6)';

function lowercase(expression) {
  return `translate(${expression}, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')`;
}

function extractParams(doc) {
  const list = xpath.select1(`//ul[preceding-sibling::*[${hn} and ${lowercase('.')} = 'parameters']]`, doc);

  if (!list) { return []; }

  return xpath.select('./li[code]', list).map((li) => {
    const name        = xpath.select1('string(./code)', li).trim();
    const description = xpath.select('string(./text())', li).trim();
    const defaultText = xpath.select('string(.//li/text()[starts-with(., "default:")])', li);

    return {
      name,
      description,
      default: defaultText.replace(/^default:\s*/, '')
    };
  });
}

function extractProcedures(doc) {
  return xpath.select('//pre/code[@class = "language-js" or @class = "language-javascript" or @class = "language-sparql"]', doc).map((block) => {
    const heading     = xpath.select1(`../preceding-sibling::*[${hn} and position() = 1]`, block);
    const bindingName = xpath.select1('string(./code)', heading).trim();
    const name        = xpath.select('string(./text())', heading).trim();
    const type        = convertClassNameToProcedureType(block.getAttribute('class'));
    const endpoint    = type === 'sparql' ? xpath.select1(`string(../preceding-sibling::p[preceding-sibling::*[${hn}]/text() = 'endpoint' or preceding-sibling::*[${hn}]/text() = 'Endpoint'])`, block) : undefined;

    return {
      bindingName,
      name,
      data: block.textContent.trim(),
      type,
      endpoint
    };
  });
}

function convertClassNameToProcedureType(className) {
  switch (className.replace(/^language-/, '')) {
    case 'js':
    case 'javascript':
      return 'javascript';
    case 'sparql':
      return 'sparql';
    default:
      return null;
  }
}
