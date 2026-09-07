import { GAME_CATALOG } from './src/data/gameCatalog';

console.log('=== ALL 10 GAME TITLES ACROSS 4 LANGUAGES ===\n');
GAME_CATALOG.forEach((g, i) => {
  console.log(`${i + 1}. Game ID: ${g.id}`);
  console.log(`   English (en):  ${g.title.en}  [${g.subtitle.en}]`);
  console.log(`   Assamese (as): ${g.title.as}  [${g.subtitle.as}]`);
  console.log(`   Bengali (bn):  ${g.title.bn}  [${g.subtitle.bn}]`);
  console.log(`   Hindi (hi):    ${g.title.hi}  [${g.subtitle.hi}]`);
  console.log('');
});
