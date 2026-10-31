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
    
    // Check if we previously injected a bad usePageTitle import
    // It looks like `\nimport { usePageTitle } from '...';`
    const regex = /\n?import\s+{\s*usePageTitle\s*}\s+from\s+['"][^'"]+['"];?\n?/g;
    
    if (regex.test(content)) {
      // Remove ALL instances of the usePageTitle import
      content = content.replace(regex, '');
      
      // Calculate relative path again
      const srcDir = path.join(process.cwd(), 'src');
      const hooksDir = path.join(srcDir, 'hooks');
      const fileDir = path.dirname(filePath);
      
      let relativePath = path.relative(fileDir, path.join(hooksDir, 'usePageTitle'));
      relativePath = relativePath.replace(/\\/g, '/');
      if (!relativePath.startsWith('.')) {
          relativePath = './' + relativePath;
      }
      
      // Inject at the very top of the file
      const importStatement = `import { usePageTitle } from '${relativePath}';\n`;
      content = importStatement + content;
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Repaired import in: ${filePath}`);
      fixedCount++;
    }
  }
});

console.log(`Repaired ${fixedCount} files.`);
