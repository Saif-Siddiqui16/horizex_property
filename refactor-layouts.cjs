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

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Check if it has a layout
  const hasMainLayout = /<MainLayout/.test(content);
  const hasTenantLayout = /<TenantLayout/.test(content);
  const hasOwnerLayout = /<OwnerLayout/.test(content);

  if (!hasMainLayout && !hasTenantLayout && !hasOwnerLayout) return;

  // Extract the title
  let titleMatch = content.match(/<(?:MainLayout|TenantLayout|OwnerLayout)[^>]*title=(["'])(.*?)\1[^>]*>/);
  let title = titleMatch ? titleMatch[2] : '';
  
  if (!title) {
    // Check if it's dynamic like title={`...`}
    let dynamicTitleMatch = content.match(/<(?:MainLayout|TenantLayout|OwnerLayout)[^>]*title=\{([^}]+)\}[^>]*>/);
    title = dynamicTitleMatch ? dynamicTitleMatch[1] : "'Overview'"; // keep it as a JS expression string
  } else {
    title = `'${title}'`; // wrap string in quotes
  }

  // 1. Remove the opening and closing tags of the layout
  // Replace <MainLayout ...> with <>
  content = content.replace(/<(MainLayout|TenantLayout|OwnerLayout)[^>]*>/g, '<>');
  // Replace </MainLayout> or </MainLayout > with </>
  content = content.replace(/<\/(MainLayout|TenantLayout|OwnerLayout)\s*>/g, '</>');

  // 2. Inject usePageTitle hook
  // Find the first component definition (const Component = () => { or function Component() {)
  const componentRegex = /(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*(?:\([^)]*\)|[^=]*)\s*=>\s*{|(?:export\s+)?function\s+\w+\s*\([^)]*\)\s*{/g;
  
  let match;
  let injected = false;
  
  // We need to inject after the opening brace of the component.
  // Since there might be multiple components in a file, we find the first one that returns <>
  // Actually, let's just insert it after the first match that looks like a React component.
  content = content.replace(componentRegex, (match) => {
    if (!injected) {
      injected = true;
      return `${match}\n    usePageTitle(${title});\n`;
    }
    return match;
  });

  // 3. Add import for usePageTitle
  if (injected && !content.includes('usePageTitle')) {
    // Find the last import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      
      // Calculate relative path to src/hooks/usePageTitle
      const srcDir = path.join(__dirname, 'src');
      const hooksDir = path.join(srcDir, 'hooks');
      const fileDir = path.dirname(filePath);
      
      let relativePath = path.relative(fileDir, path.join(hooksDir, 'usePageTitle'));
      relativePath = relativePath.replace(/\\/g, '/'); // fix windows slashes
      if (!relativePath.startsWith('.')) {
          relativePath = './' + relativePath;
      }

      content = content.slice(0, endOfLastImport) + `\nimport { usePageTitle } from '${relativePath}';` + content.slice(endOfLastImport);
    }
  }

  // 4. Remove Layout imports to prevent unused import warnings
  content = content.replace(/import\s+{\s*(MainLayout|TenantLayout|OwnerLayout)\s*}\s+from\s+['"][^'"]+['"];?\n?/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored: ${filePath}`);
  }
};

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const files = walkSync(pagesDir);

files.forEach(file => {
  if (file.endsWith('.jsx')) {
    processFile(file);
  }
});

console.log('Layout Refactoring Complete!');
