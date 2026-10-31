const fs = require('fs');

const filePath = 'src/pages/RentRoll.jsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/const isOwnerPath = window\.location\.pathname\.includes\('\/owner'\);\s*const isOwnerPath = window\.location\.pathname\.includes\('\/owner'\);/, "const isOwnerPath = window.location.pathname.includes('/owner');");

content = content.replace(/<Layout title="Rent Roll Overview">/, "<>");

content = content.replace(/<\/Layout>([\s\n\r]*\);[\s\n\r]*)$/, "</>$1");

fs.writeFileSync(filePath, content, 'utf8');
console.log("RentRoll.jsx fixed!");
