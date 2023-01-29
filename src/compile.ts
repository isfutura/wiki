import { marked } from "https://deno.land/x/marked/mod.ts";
import * as fs from "https://deno.land/std@0.175.0/fs/mod.ts";

// structure
const base = "src/base.htm";
const pages = "src/pages";
const site = "site";

const d = new Date();

const decoder = new TextDecoder("utf-8");

fs.emptyDir(site);

for await (const dirEntry of Deno.readDir(pages)) {
  const raw = await Deno.readTextFile(`${pages}/${dirEntry.name}`);
  const linked = raw.replace(/\[\[(.+?)\]\]/g, (i) => {
    const wlRename = i.match(/\[\[(.+?)\|(.+?)\]\]/);
    const wlPlain = i.match(/\[\[(.+?)\]\]/);

    if (!wlRename) {
      return `[${wlPlain[1]}](/${site}/${wlPlain[1].toLowerCase()}.html)`;
    } else {return `[${wlRename[2]}](/${site}/${
        wlRename[1].toLowerCase()
      }.html)`;}
  });

  const title = dirEntry.name.split(".")[0];

  const html = marked.parse(linked);

  const b = await Deno.readTextFile(base);
  const page = b.replace(/\{\{content\}\}/, html).replace(
    /\{\{title\}\}/,
    title,
  ).replace(/\{\{date\}\}/g, d);

  const loc = `${site}/${title}.html`;
  Deno.writeTextFile(loc, page);
}
