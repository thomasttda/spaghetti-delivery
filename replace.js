const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace text
  content = content.replace(/Spaghetti Expresso/g, 'Spaghetti Expresso');
  content = content.replace(/SPAGHETTI EXPRESSO/g, 'SPAGHETTI EXPRESSO');
  content = content.replace(/spaghetti expresso/g, 'spaghetti expresso');
  content = content.replace(/logo\.png/g, 'logo_spaghetti.png');
  content = content.replace(/sabor@admin\.com/g, 'admin@spaghetti.com');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.next', '.git', '.vercel', 'supabase'].includes(file)) {
        walkDir(fullPath);
      }
    } else {
      if (['.ts', '.tsx', '.md', '.json', '.css'].includes(path.extname(fullPath))) {
        replaceInFile(fullPath);
      }
    }
  }
}

walkDir(path.join(__dirname));
