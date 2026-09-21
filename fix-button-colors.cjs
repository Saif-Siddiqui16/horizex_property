const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {}
  });
  return filelist;
};

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const files = walkSync(pagesDir).filter(f => f.endsWith('.jsx'));

let fixedCount = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // ---- BUTTONS ONLY (lines containing <button or className= with action button patterns) ----
  // Target: bg-green-600 -> bg-zinc-900, hover:bg-green-700 -> hover:bg-zinc-800
  // Target: bg-indigo-600 -> bg-zinc-900, hover:bg-indigo-700 -> hover:bg-zinc-800
  // Target: bg-blue-600 -> bg-zinc-900, hover:bg-blue-700 -> hover:bg-zinc-800
  // Target: bg-purple-600 -> bg-zinc-900, hover:bg-purple-700 -> hover:bg-zinc-800
  // Target: bg-violet-600 -> bg-zinc-900, hover:bg-violet-700 -> hover:bg-zinc-800

  // Only replace in lines that look like button classNames (contain button-like text context)
  // We'll do line-by-line analysis

  const lines = content.split('\n');
  const newLines = lines.map((line, idx) => {
    // Skip lines that are clearly status badges, dots, progress indicators, timeline events
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes('badge') ||
      lowerLine.includes('dot') ||
      lowerLine.includes('w-1.5 h-1.5') ||
      lowerLine.includes('w-1 h-1') ||
      lowerLine.includes('w-2 h-2') ||
      lowerLine.includes('w-3 h-3') ||
      lowerLine.includes('rounded-full p-0.5') ||
      lowerLine.includes('progressitem') ||
      lowerLine.includes('timelineevent') ||
      lowerLine.includes('animate-pulse') ||
      lowerLine.includes('toast') ||
      lowerLine.includes('w-[36px]') || // toggle switches
      lowerLine.includes('w-10 h-5') || // toggle switches
      lowerLine.includes('w-8 h-5') // toggle switches
    ) {
      return line;
    }

    // For action buttons: replace colored bg to black
    let newLine = line;
    
    // Replace main bg colors for buttons
    newLine = newLine.replace(/bg-green-600/g, 'bg-zinc-900');
    newLine = newLine.replace(/hover:bg-green-700/g, 'hover:bg-zinc-800');
    newLine = newLine.replace(/bg-indigo-600/g, 'bg-zinc-900');
    newLine = newLine.replace(/hover:bg-indigo-700/g, 'hover:bg-zinc-800');
    newLine = newLine.replace(/bg-blue-600/g, 'bg-zinc-900');
    newLine = newLine.replace(/hover:bg-blue-700/g, 'hover:bg-zinc-800');
    newLine = newLine.replace(/bg-purple-600/g, 'bg-zinc-900');
    newLine = newLine.replace(/hover:bg-purple-700/g, 'hover:bg-zinc-800');
    newLine = newLine.replace(/bg-violet-600/g, 'bg-zinc-900');
    newLine = newLine.replace(/hover:bg-violet-700/g, 'hover:bg-zinc-800');
    
    // Replace shadow colors too
    newLine = newLine.replace(/shadow-indigo-100/g, 'shadow-zinc-200');
    newLine = newLine.replace(/shadow-indigo-200/g, 'shadow-zinc-200');
    newLine = newLine.replace(/shadow-indigo-500\/20/g, 'shadow-zinc-400/20');
    newLine = newLine.replace(/shadow-green-100/g, 'shadow-zinc-200');
    newLine = newLine.replace(/shadow-blue-100/g, 'shadow-zinc-200');
    newLine = newLine.replace(/shadow-purple-100/g, 'shadow-zinc-200');
    newLine = newLine.replace(/shadow-indigo-600\/20/g, 'shadow-zinc-400/20');

    return newLine;
  });

  content = newLines.join('\n');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    const name = path.relative(pagesDir, filePath);
    console.log(`Updated: ${name}`);
    fixedCount++;
  }
});

console.log(`\nDone! Updated ${fixedCount} files.`);
