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
        console.log(`Skipping ${dirFile}`);
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

  // Replacement rules (order matters)
  
  // animate-in fade-in slide-in-from-bottom-4 duration-500
  // animate-in fade-in slide-in-from-right-4 duration-500
  // animate-in slide-in-from-right-full duration-500
  // animate-in slide-in-from-top-2
  content = content.replace(/animate-in\s+(fade-in\s+)?slide-in-from-[a-z0-9-]+\s*(duration-\d+)?/g, 'anim-slide-up');
  
  // animate-in fade-in zoom-in duration-200
  // animate-in zoom-in-95 duration-400
  // animate-in zoom-in-95
  content = content.replace(/animate-in\s+(fade-in\s+)?zoom-in(-\d+)?\s*(duration-\d+)?/g, 'anim-zoom-in');
  
  // animate-in fade-in duration-500
  content = content.replace(/animate-in\s+fade-in\s*(duration-\d+)?/g, 'anim-fade-in');
  
  // just in case: animate-in
  content = content.replace(/\banimate-in\b/g, '');

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

console.log('Done!');
