#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import { globby } from "globby"; // fix no default export

async function run() {
  const files = await globby(["**/*.tsx"], {
    gitignore: true,
    ignore: ["node_modules/**", ".next/**"],
  });

  files.forEach((file: string) => {
    const fullPath = path.resolve(file);
    let content = fs.readFileSync(fullPath, "utf-8");
    const original = content;

    // Remove legacyBehavior
    content = content.replace(
      /<Link([^>]+?)\s+legacyBehavior([^>]*)>/g,
      "<Link$1$2>"
    );

    // Wrap inner <div> with <a>
    content = content.replace(
      /<Link([^>]+)>(\s*)(<div[\s\S]*?<\/div>)(\s*)<\/Link>/g,
      `<Link$1>\n  <a>$2$3$4</a>\n</Link>`
    );

    // Wrap plain text with <a> if needed
    content = content.replace(
      /<Link([^>]+)>([^<][\s\S]*?)<\/Link>/g,
      `<Link$1><a>$2</a></Link>`
    );

    if (content !== original) {
      fs.writeFileSync(fullPath, content, "utf-8");
      console.log(`✅ Updated: ${file}`);
    }
  });
}

run();
