import { execSync } from 'node:child_process';

//Check if dependencies are installed and nudge if not
const REQUIRED_TOOLS = [
  { command: 'sox', brewPackage: 'sox' },
  { command: 'SwitchAudioSource', brewPackage: 'switchaudio-osx' },
];

function isOnPath(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const missing = REQUIRED_TOOLS.filter((tool) => !isOnPath(tool.command));

if (missing.length > 0) {
  const commandList = missing.map((tool) => tool.command).join(', ');
  const brewPackages = missing.map((tool) => tool.brewPackage).join(' ');

  console.warn('');
  console.warn(`⚠ bpm_2_artnet: couldn't find ${commandList} on your PATH.`);
  console.warn('  This project needs them at runtime. Install with:');
  console.warn(`    brew install ${brewPackages}`);
  console.warn('');
}
