import path from 'path';
import fs from 'fs';

export async function run() {
  const root = await findRoot(module.filename);
  console.log(root);
}

async function exists(path: string): Promise<boolean> {
  return new Promise(resolve => fs.exists(path, resolve));
}

async function loadJSON(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, d) => {
      try {
        if (err) reject(err);
        else resolve(JSON.parse(d));
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function findRoot(name: string | undefined, root: string) {
  function* up(from: string) {
    while (path.dirname(from) !== from) {
      yield from;
      from = path.dirname(from);
    }
    yield from;
  }
  for (let next of up(root)) {
    let cur;
    if (name) {
      cur = path.join(next, 'node_modules', name, 'package.json');
      if (await exists(cur)) return path.dirname(cur);
      try {
        let pkg = await loadJSON(path.join(next, 'package.json'));
        if (pkg.name === name) return next;
      } catch {}
    } else {
      cur = path.join(next, 'package.json');
      if (await exists(cur)) return path.dirname(cur);
    }
  }
}
