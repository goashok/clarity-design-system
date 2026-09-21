import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { icon, iconNames, iconPaths } from '../src/index.js';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
test('icons retain the 26 source assets and render accessibly', async () => {
  assert.equal(iconNames.length, 26);
  for (const name of iconNames) {
    const asset = await read(`src/icons/${name}.svg`);
    assert.ok(asset.includes(iconPaths[name]));
    assert.ok(icon(name).includes('aria-hidden="true"'));
    assert.ok(icon(name).includes('stroke-width="1.65"'));
  }
  assert.match(icon('search', { label: 'Search', size: 24 }), /role="img" aria-label="Search"/);
});
test('icon API rejects invalid names and sizes and escapes attributes', () => {
  for (const name of ['missing', 'constructor', '__proto__']) assert.throws(()=>icon(name), RangeError);
  for (const size of [-1, 0, Infinity, NaN, '24']) assert.throws(()=>icon('grid',{size}), RangeError);
  const svg=icon('grid',{label:'"><script>alert(1)</script>',className:'" onclick="x'});
  assert.ok(!svg.includes('<script>'));
  assert.ok(svg.includes('&lt;script&gt;'));
  assert.ok(!svg.includes('class="cl-icon " onclick='));
});
test('all CSS token references resolve and generated output matches sources', async () => {
  const tokens=JSON.parse(await read('src/tokens.json'));
  const css=await read('src/tokens.css');
  const components=await read('src/components.css');
  const names=new Set();
  for(const [group,values] of Object.entries(tokens)) for(const [key,value] of Object.entries(values)) {
    const name=`--cl-${group}-${key}`; names.add(name); assert.ok(css.includes(`${name}: ${value};`));
  }
  assert.equal(names.size,102);
  for(const [,name] of components.matchAll(/var\((--cl-[\w-]+)/g)) assert.ok(names.has(name),name);
  assert.equal(await read('dist/clarity.css'),`${css}\n${components}`);
  const sprite=await read('dist/icons.svg');
  for(const name of iconNames)assert.ok(sprite.includes(`id="cl-${name}"`));
});
test('core source values and package export targets remain intact', async () => {
  const tokens=JSON.parse(await read('src/tokens.json'));
  assert.equal(tokens.color.primary,'#3463df'); assert.equal(tokens.color.secondary,'#268b77');
  assert.equal(tokens.layout.sidebar,'238px'); assert.equal(tokens['font-size'].page,'27px');
  const pkg=JSON.parse(await read('package.json'));
  for(const target of Object.values(pkg.exports)) {
    if(typeof target==='object')for(const path of Object.values(target))await access(new URL(path,root));
    else if(!target.includes('*'))await access(new URL(target,root));
  }
});
