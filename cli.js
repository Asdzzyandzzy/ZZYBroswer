#!/usr/bin/env node

const api = require('./client');

function usage() {
  console.log(`ChatGPT Local API Creator

Usage:
  node cli.js status
  node cli.js ids
  node cli.js ask "prompt"
  node cli.js ask-file prompt.txt
  node cli.js new
  node cli.js last
  node cli.js refresh
  node cli.js open-url "https://chatgpt.com/c/..."
  node cli.js chats
  node cli.js projects
  node cli.js project-chats
  node cli.js novel-plan "story idea"

Options:
  --json       Print full JSON instead of the best human-readable field.

Set CHATGPT_LOCAL_API to override http://127.0.0.1:3123.
`);
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function argsWithoutFlags() {
  return process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
}

function print(result) {
  if (hasFlag('--json')) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (typeof result.text === 'string') {
    console.log(result.text);
    return;
  }

  console.log(JSON.stringify(result, null, 2));
}

function requireArg(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function novelPlanPrompt(idea) {
  return [
    'You are helping plan a long-form novel project.',
    'Return a practical, structured plan that can be used by another script.',
    'Include: premise, main characters, world/rules, conflict, chapter outline, tone, continuity notes.',
    'Keep it useful. Avoid filler.',
    '',
    `Story idea: ${idea}`
  ].join('\n');
}

async function main() {
  const [command, ...rest] = argsWithoutFlags();

  switch (command) {
    case undefined:
    case 'help':
    case '--help':
    case '-h':
      usage();
      return;
    case 'status':
      print(await api.status());
      return;
    case 'ids':
      print(await api.ids());
      return;
    case 'new':
      print(await api.newChat());
      return;
    case 'last':
      print(await api.last());
      return;
    case 'refresh':
      print(await api.refresh());
      return;
    case 'ask':
      print(await api.chat(requireArg(rest.join(' '), 'Missing prompt.')));
      return;
    case 'ask-file': {
      const fs = require('node:fs');
      const path = requireArg(rest[0], 'Missing prompt file path.');
      print(await api.chat(fs.readFileSync(path, 'utf8')));
      return;
    }
    case 'open-url':
      print(await api.openUrl(requireArg(rest[0], 'Missing URL.')));
      return;
    case 'chats':
      print(await api.chats());
      return;
    case 'projects':
      print(await api.projects());
      return;
    case 'project-chats':
      print(await api.projectChats());
      return;
    case 'novel-plan':
      print(await api.chat(novelPlanPrompt(requireArg(rest.join(' '), 'Missing story idea.'))));
      return;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
