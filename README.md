# Parse5 Babel JSX Adapter (WIP)

This is a tiny AST Tree Adapter that transform Parse5 AST to Babel JSX AST

This project is still under development, please do not use in production

---

## Usage

- Install

  ```bash
  npm install --save parse5 @babel/core parse5-babel-jsx-adapter
  ```

- Import in your code (typescript)
  
  ```typescript
  import generator from '@babel/generator';
  import { parse } from 'parse5';
  import { Adapter, BabelJSXWrapperDocument } from 'parse5-babel-jsx-adapter';

  const text = '<div class="cls">txt<button>btn</button></div>';
  const document = parse(text, { treeAdapter: new Adapter() }) as BabelJSXWrapperDocument;

  console.log(JSON.stringify(document.ast, null, 2));
  // print babel jsx entry ast
  console.log(generator(document.ast).code)
  // print code same as you text input
  ```