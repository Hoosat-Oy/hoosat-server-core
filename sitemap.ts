import fs from 'fs';
import path from 'path';

export const generateSitemap = (dir: string, urls: string[]) => {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\r\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\r\n`;
  urls.forEach((loc) => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${loc}</loc>\n`;
    sitemap += `    <lastmod>${Date.now()}</lastmod>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    sitemap += `    <priority>0.6</priority>\n`;
    sitemap += `  </url>\n`;
  })
  sitemap += `</urlset>`;
  if(fs.existsSync(path.join(dir, "sitemap.xml.br"))) {
    fs.unlinkSync(path.join(dir, "sitemap.xml.br"));
  }
  if(fs.existsSync(path.join(dir, "sitemap.xml.deflate"))) {
    fs.unlinkSync(path.join(dir, "sitemap.xml.deflate"));
  }
  if(fs.existsSync(path.join(dir, "sitemap.xml.gzip"))) {
    fs.unlinkSync(path.join(dir, "sitemap.xml.gzip"));
  }
  fs.writeFileSync(path.join(dir, "sitemap.xml"), sitemap);
}