import { parse } from 'parse5';
import { Adapter, BabelJSXWrapperDocument } from '../src';
import json from './match.json';
import generator from '@babel/generator';

describe('Adapter can transform html', () => {
  it('works', () => {
    const txt = '<div class="cls">txt<button>btn</button></div>';
    const document = parse(txt, {
      treeAdapter: new Adapter(),
    }) as BabelJSXWrapperDocument;
    // console.log(JSON.stringify(document.ast, null, 2));
    // console.log(generator(document.ast).code)
    expect(document.ast).toMatchObject(json);
    expect(generator(document.ast).code).toBe(txt);
  });
});
