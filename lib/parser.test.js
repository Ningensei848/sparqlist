const SPARQLetParser = require('./parser');

test('empty', () => {
  const parser = new SPARQLetParser();

  expect(parser.parse('')).toEqual({
    title: '',
    params: [],
    procedures: []
  });
});

test('title only', () => {
  const parser = new SPARQLetParser();

  expect(parser.parse(`
# hi
  `)).toEqual({
    title: 'hi',
    params: [],
    procedures: []
  });
});

test('all', () => {
  const parser = new SPARQLetParser();

  expect(parser.parse(`
# hi

## parameters

- \`foo\` foo parameter
  - default: 42

## Endpoint

http://example.org

## \`bar\` bar procedure

\`\`\` js
alert(1);
\`\`\`

## \`baz\`

\`\`\` sparql
select distinct * where { ?s ?p ?o . }
\`\`\`

## quux procedure

\`\`\` javascript
alert(2);
\`\`\`
  `)).toEqual({
    title: 'hi',
    params: [
      {
        default: '42',
        name: 'foo',
        description: 'foo parameter',
      },
    ],
    procedures: [
      {
        bindingName: 'bar',
        name: 'bar procedure',
        data: 'alert(1);',
        type: 'javascript',
      },
      {
        bindingName: 'baz',
        name: '',
        data: 'select distinct * where { ?s ?p ?o . }',
        type: 'sparql',
        endpoint: 'http://example.org',
      },
      {
        bindingName: '',
        name: 'quux procedure',
        data: 'alert(2);',
        type: 'javascript',
      },
    ],
  });
});

test('default contains underscores', () => {
  const parser = new SPARQLetParser();

  expect(parser.parse(`
# hi

## parameters

- \`foo\`
  - default: 42_42_42
  `)).toEqual({
    title: 'hi',
    params: [
      {
        name: 'foo',
        description: '',
        default: '42_42_42'
      },
    ],
    procedures: []
  });
});

test('endpoint is blank', () => {
  const parser = new SPARQLetParser();

  expect(parser.parse(`
# hi

## endpoint

## foo

this is not an endpoint

\`\`\` sparql
select distinct * where { ?s ?p ?o . }
\`\`\`
  `)).toEqual({
    title: 'hi',
    params: [],
    procedures: [
      {
        bindingName: '',
        name: 'foo',
        data: 'select distinct * where { ?s ?p ?o . }',
        type: 'sparql',
        endpoint: '',
      }
    ]
  });
});

test('procedure without heading', () => {
  const parser = new SPARQLetParser();

  expect(parser.parse(`
\`\`\` js
alert(1)
\`\`\`
  `)).toEqual({
    title: '',
    params: [],
    procedures: [
      {
        bindingName: '',
        name: '',
        data: 'alert(1)',
        type: 'javascript'
      }
    ]
  });
});
