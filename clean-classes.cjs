const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'OOM' || err.code === 'EISDIR') {
      } else {
        throw err;
      }
    }
  });
  return filelist;
};

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace redundant saas-btn saas-btn-*
  content = content.replace(/saas-btn\s+saas-btn-/g, 'saas-btn-');
  
  // Replace redundant saas-card saas-card-hover
  content = content.replace(/saas-card\s+saas-card-hover/g, 'saas-card-hover');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
};

const srcDir = path.join(process.cwd(), 'src');
const files = walkSync(srcDir);

files.forEach(file => {
  if (file.endsWith('.jsx') || file.endsWith('.js')) {
    replaceInFile(file);
  }
});

console.log('Done cleaning classes!');
