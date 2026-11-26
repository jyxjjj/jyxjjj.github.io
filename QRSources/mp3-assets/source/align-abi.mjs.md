# align-abi.mjs

将以下代码块保存为 `align-abi.mjs`，与另一构建脚本放在同一目录。

```javascript
import fs from 'node:fs';

const original = fs.readFileSync('original-core.mjs', 'utf8');
const generated = fs.readFileSync('ffmpeg/dist/ffmpeg-core.mjs', 'utf8');

function imports(source) {
    const body = source.match(/var wasmImports=\{([^}]+)\}/)[1];
    return new Map([...body.matchAll(/"([^"]+)":([\w$]+)/g)].map(m => [m[1], m[2]]));
}

function exports(source) {
    const result = new Map([...source.matchAll(/var ([\w$]+)=[^;]*?Module\["asm"\]\["([^"]+)"\]/g)].map(m => [m[1], m[2]]));
    for (const name of ['wasmMemory', 'wasmTable']) {
        result.set(name, source.match(new RegExp(name + '=Module\\["asm"\\]\\["([^"]+)"\\]'))[1]);
    }
    return result;
}

const oldImports = new Map([...imports(original)].map(([name, symbol]) => [symbol, name]));
const newImports = imports(generated);
const oldExports = exports(original);
const newExports = new Map([...exports(generated)].map(([symbol, name]) => [name, symbol]));
const bytes = fs.readFileSync('ffmpeg/dist/ffmpeg-core.wasm');
let position = 8;

function uint() {
    let value = 0, shift = 0, byte;
    do {
        byte = bytes[position++];
        value += (byte & 127) * 2 ** shift;
        shift += 7;
    } while (byte & 128);
    return value;
}

function string() {
    const n = uint();
    const s = bytes.subarray(position, position + n).toString();
    position += n;
    return s;
}

function leb(n) {
    const out = [];
    do {
        let b = n & 127;
        n = Math.floor(n / 128);
        if (n) b |= 128;
        out.push(b);
    } while (n);
    return Buffer.from(out);
}

function str(s) {
    const b = Buffer.from(s);
    return Buffer.concat([leb(b.length), b]);
}

// Match the minified import and export names expected by the pinned loader
const output = [bytes.subarray(0, 8)];
while (position < bytes.length) {
    const id = bytes[position++], size = uint(), start = position, end = start + size;
    let payload = bytes.subarray(start, end);
    if (id === 2) {
        const count = uint(), entries = [];
        for (let i = 0; i < count; i++) {
            string();
            const name = string();
            const kind = bytes[position++];
            if (kind !== 0) throw Error('Unexpected non-function import');
            const type = uint(), symbol = newImports.get(name), target = oldImports.get(symbol);
            if (!target) throw Error('Original loader lacks import ' + symbol);
            entries.push(Buffer.concat([str('a'), str(target), Buffer.from([kind]), leb(type)]));
        }
        payload = Buffer.concat([leb(count), ...entries]);
    } else if (id === 7) {
        const count = uint(), entries = [];
        for (let i = 0; i < count; i++) {
            const name = string(), kind = bytes[position++], index = uint();
            const symbol = newExports.get(name), target = oldExports.get(symbol);
            if (target) entries.push(Buffer.concat([str(target), Buffer.from([kind]), leb(index)]));
        }
        payload = Buffer.concat([leb(entries.length), ...entries]);
    }
    if (id !== 0) output.push(Buffer.from([id]), leb(payload.length), payload);
    position = end;
}
const result = Buffer.concat(output);
if (!WebAssembly.validate(result)) throw Error('Invalid output module');
fs.writeFileSync('ffmpeg-core-audio.wasm', result);
console.log('WASM bytes:', result.length);
```
