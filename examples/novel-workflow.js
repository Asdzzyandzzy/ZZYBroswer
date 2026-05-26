const fs = require('node:fs');
const path = require('node:path');
const api = require('../client');

const idea = process.argv.slice(2).join(' ') || 'A tired data analyst discovers that every city has a hidden statistical soul.';
const outDir = path.join(__dirname, '..', 'output');

function planPrompt(storyIdea) {
  return [
    'Plan a novel project for local iterative generation.',
    'Make the plan concrete enough for later chapter drafting.',
    'Include premise, cast, setting, rules, conflicts, chapter outline, tone, and continuity notes.',
    '',
    `Story idea: ${storyIdea}`
  ].join('\n');
}

function chapterPrompt(plan, chapterNumber) {
  return [
    'Draft one chapter from this novel plan.',
    'Keep continuity with the plan. Write prose, not analysis.',
    `Chapter number: ${chapterNumber}`,
    '',
    plan
  ].join('\n');
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  console.log('Starting a fresh ChatGPT web chat...');
  await api.newChat();

  console.log('Planning novel...');
  const plan = await api.chat(planPrompt(idea));
  const planPath = path.join(outDir, 'novel-plan.md');
  fs.writeFileSync(planPath, plan.text, 'utf8');
  console.log(`Saved ${planPath}`);

  console.log('Drafting chapter 1...');
  const chapter = await api.chat(chapterPrompt(plan.text, 1));
  const chapterPath = path.join(outDir, 'chapter-01.md');
  fs.writeFileSync(chapterPath, chapter.text, 'utf8');
  console.log(`Saved ${chapterPath}`);

  console.log('Current IDs:', chapter.ids);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
