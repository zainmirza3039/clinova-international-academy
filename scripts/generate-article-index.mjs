import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const sources = ['assessment-and-pain', 'rehabilitation', 'clinical-practice'];
const images = [
  'https://images.pexels.com/photos/5407204/pexels-photo-5407204.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/4506169/pexels-photo-4506169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/5934556/pexels-photo-5934556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];
const articles = sources.flatMap(source => JSON.parse(readFileSync(new URL(`../src/data/articles/${source}.json`, import.meta.url), 'utf8')));
const cards = articles.map((article, index) => ({
  id: article.id, slug: article.slug, title: `DRAFT: ${article.title}`,
  excerpt: article.excerpt, category: article.category,
  date: 'Draft — publication date awaiting academy confirmation',
  image: images[index % images.length],
}));
const target = new URL('../src/data/articleIndex.json', import.meta.url);
writeFileSync(target, `${JSON.stringify(cards, null, 2)}\n`);
console.log(`Generated ${cards.length} draft article cards: ${fileURLToPath(target)}`);
