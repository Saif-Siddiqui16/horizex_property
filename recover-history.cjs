const fs = require('fs');
const path = require('path');

const historyDir = path.join(process.env.APPDATA, 'Code', 'User', 'History');

if (fs.existsSync(historyDir)) {
  const folders = fs.readdirSync(historyDir);
  for (const folder of folders) {
    const folderPath = path.join(historyDir, folder);
    const entriesFile = path.join(folderPath, 'entries.json');
    if (fs.existsSync(entriesFile)) {
      try {
        const entries = JSON.parse(fs.readFileSync(entriesFile, 'utf8'));
        const resource = entries.resource.toLowerCase();
        const decodedResource = decodeURIComponent(resource.replace('file:///', '').replace(/\//g, '\\'));
        
        if (decodedResource.includes('horizex_property')) {
          console.log('Found:', decodedResource);
        }
      } catch (err) {}
    }
  }
}
