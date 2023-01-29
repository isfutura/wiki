import { marked } from "https://deno.land/x/marked/mod.ts";
import * as fs from "https://deno.land/std@0.175.0/fs/mod.ts";

// structure
const base = "src/base.htm";
const pages = "src/pages";
const site = "site";

// compilation date
const d = new Date();

// clean sites
fs.emptyDir(site);

// empty navigation
let nav = {};

// iterate over markdown pages and make html pages out of them
for await (const dirEntry of Deno.readDir(pages)) {
  // get article title and final location
  const title = dirEntry.name.split(".")[0];
  const loc = `${site}/${title}.html`;

  // get basic markdown
  const raw = await Deno.readTextFile(`${pages}/${dirEntry.name}`);

  // convert wikilinks
  const linked = raw.replace(/\[\[(.+?)\]\]/g, (i) => {
    // see if it's a renamed link (e.g. [[finn|Finn Greiter]] would display as Finn Greiter but would link to [[finn]])
    const wlRename = i.match(/\[\[(.+?)\|(.+?)\]\]/);
    const wlPlain = i.match(/\[\[(.+?)\]\]/);

    if (!wlRename) {
      return `[${wlPlain[1]}](/${site}/${wlPlain[1].toLowerCase()}.html)`;
    } else {return `[${wlRename[2]}](/${site}/${
        wlRename[1].toLowerCase()
      }.html)`;}
  });

  // get navigation
  // const naved = linked.replace(
  //   /(<!--.*?-->)|(<!--[\S\s]+?-->)|(<!--[\S\s]*?$)/g,
  //   (i) => {
  //     JSON.parse(i.replace(/<!--/g, "").replace(/-->/g, "")).under.split("/").forEach(j => {

  //     });
  //   },
  // );

  // convert markdown to html
  const html = marked.parse(linked);

  // get base template
  const b = await Deno.readTextFile(base);

  // add body to template
  const page = b.replace("{{content}}", html).replace("{{title}}", title)
    .replace("{{date}}", d);

  // write final file to sites folder
  Deno.writeTextFile(loc, page);
}
