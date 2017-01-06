import { evalWithStore } from './assertions';
import test from 'ava';

test('should load a simple syntax transformer', evalWithStore, {
  './m.js': `
#lang "sweet.js";
export syntax m = function (ctx) {
  return #\`1\`;
}`,

  'main.js': `
import { m } from "./m.js";
output = m`

  }, 1);

test('importing for syntax with a single number exported', evalWithStore, {
  './num.js': `
#lang 'base';
export var n = 1;`,

  'main.js': `
import { n } from './num.js' for syntax;

syntax m = function (ctx) {
  if (n === 1) {
    return #\`true\`;
  }
  return #\`false\`;
}
output = m;`
  }, true);

test('import for syntax; export var; function', evalWithStore, {
  './id.js': `
    #lang 'base';
    export var id = function (x) {
      return x;
    }
  `,
  'main.js': `
    import { id } from './id.js' for syntax;

    syntax m = ctx => {
      return id(#\`1\`);
    }
    output = m;
  `
  }, 1);

test('import for syntax; export declaration; function', evalWithStore, {
  './id.js': `
    #lang 'base';
    export function id(x) {
      return x;
    }
  `,
  'main.js': `
    import { id } from './id.js' for syntax;

    syntax m = ctx => {
      return id(#\`1\`);
    }
    output = m;
  `
  }, 1);


test('importing a macro for syntax', evalWithStore, {
  './id.js': `
    #lang 'base';
    export syntax m = function (ctx) {
      return #\`1\`;
    }
  `,
  'main.js': `
    import { m } from './id.js' for syntax;

    syntax m = ctx => {
      let x = m;
      return #\`1\`;
    }
    output = m;
  `
  }, 1);

test('importing a macro for syntax only binds what is named', evalWithStore, {
  './id.js': `
    #lang 'base';
    syntax n = ctx => #\`2\`;

    export syntax m = function (ctx) {
      return #\`1\`;
    }

  `,
  'main.js': `
    import { m } from './id.js' for syntax;

    syntax test = ctx => {
      if (typeof n !== 'undefined' && n === 2) {
        throw new Error('un-exported and un-imported syntax should not be bound');
      }
      return #\`1\`;
    }
    output = test;
  `
  }, 1);

  test('exporting names for syntax', evalWithStore, {
'./mod.js': `
function id(x) { return x; }
export { id }  
`,
'main.js': `
import { id } from './mod.js' for syntax;
syntax m = ctx => {
  return id(#\`1\`);
}
output = m
`
  }, 1)

  test('exporting names with renaming for syntax', evalWithStore, {
'./mod.js': `
function id(x) { return x; }
export { id as di }  
`,
'main.js': `
import { di } from './mod.js' for syntax;
syntax m = ctx => {
  return di(#\`1\`);
}
output = m
`
  }, 1)

  test('exporting default names for syntax', evalWithStore, {
'./mod.js': `
export default function id(x) { return x; }
`,
'main.js': `
import id from './mod.js' for syntax;
syntax m = ctx => {
  return id(#\`1\`);
}
output = m
`
  }, 1)

  test('importing a namespace for syntax', evalWithStore, {
'./mod.js': `
export function id(x) { return x; }`,
'main.js': `
import * as M from './mod.js' for syntax;
syntax m = ctx => {
  return M.id(#\`1\`);
}
output = m`
  }, 1)

// test('importing a chain for syntax works', evalWithStore, {
//   'b': `#lang 'sweet.js';
//     export function b(x) { return x; }
//   `,
//   'a': `#lang 'sweet.js';
//     import { b } from 'b' for syntax;
//
//     export function a() {
//       return b(1);
//     }
//   `,
//   'main.js': `#lang 'sweet.js';
//     import { a } from 'a' for syntax;
//     syntax m = ctx => {
//       if (a() !== 1) {
//         throw new Error('un expected something or rather');
//       }
//       return #\`1\`;
//     }
//     output = m
//   `
//   }, 1);