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
const files = walkSync(pagesDir);

let fixedCount = 0;

files.forEach(filePath => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Remove the import statement again just in case
    content = content.replace(/^import\s+{\s*usePageTitle\s*}\s+from\s+['"][^'"]+['"];?\s*\n?/gm, '');
    
    // Remove the hook call robustly (handles nested parentheses)
    content = content.replace(/^\s*usePageTitle\(.*\);\s*\n?/gm, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Removed usePageTitle from: ${filePath}`);
      fixedCount++;
    }
  }
});

console.log(`Cleaned ${fixedCount} files.`);
