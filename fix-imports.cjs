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
    
    if (content.includes('usePageTitle(') && !content.includes('import { usePageTitle }')) {
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLastImport = content.indexOf('\n', lastImportIndex);
        
        const srcDir = path.join(process.cwd(), 'src');
        const hooksDir = path.join(srcDir, 'hooks');
        const fileDir = path.dirname(filePath);
        
        let relativePath = path.relative(fileDir, path.join(hooksDir, 'usePageTitle'));
        relativePath = relativePath.replace(/\\/g, '/'); // fix windows slashes
        if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
        }

        content = content.slice(0, endOfLastImport) + `\nimport { usePageTitle } from '${relativePath}';` + content.slice(endOfLastImport);
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed import in: ${filePath}`);
        fixedCount++;
      }
    }
  }
});

console.log(`Fixed ${fixedCount} files.`);
