const fs = require('fs');
const path = require('path');

const dir = __dirname;
const dashHtml = fs.readFileSync(path.join(dir, 'dashboard.html'), 'utf8');

const sidebarMatch = dashHtml.match(/<aside class="sidebar">[\s\S]*?<\/aside>/);
if (!sidebarMatch) {
  console.error("Could not find sidebar in dashboard.html");
  process.exit(1);
}
let baseSidebar = sidebarMatch[0];

baseSidebar = baseSidebar.replace(/<a href="#" class="nav-item([^"]*)" data-view="([^"]+)">/g, '<a href="dashboard.html#$2" class="nav-item$1" data-view="$2">');
baseSidebar = baseSidebar.replace(/class="nav-item active"/g, 'class="nav-item"');
baseSidebar = baseSidebar.replace(/class="nav-group expanded"/g, 'class="nav-group"');

const editPages = [
  { file: 'blog-edit.html', view: 'blog' },
  { file: 'case-study-edit.html', view: 'casestudies' },
  { file: 'client-story-edit.html', view: 'clientstories' },
  { file: 'industry-news-edit.html', view: 'industrynews' },
  { file: 'project-edit.html', view: 'portfolio' },
  { file: 'media-upload.html', view: 'medialibrary' }
];

for (const page of editPages) {
  const filePath = path.join(dir, page.file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let customSidebar = baseSidebar;
  const itemRegex = new RegExp(`<a href="dashboard\\.html#${page.view}" class="nav-item" data-view="${page.view}">`);
  customSidebar = customSidebar.replace(itemRegex, `<a href="dashboard.html#${page.view}" class="nav-item active" data-view="${page.view}">`);
  
  if (['blog', 'casestudies', 'clientstories', 'industrynews', 'portfolio'].includes(page.view)) {
    customSidebar = customSidebar.replace('<div class="nav-group">', '<div class="nav-group expanded">');
  } else if (page.view === 'medialibrary') {
    let groups = customSidebar.split('<div class="nav-group">');
    if (groups.length >= 4) {
        customSidebar = groups[0] + '<div class="nav-group">' + groups[1] + '<div class="nav-group">' + groups[2] + '<div class="nav-group expanded">' + groups[3];
    }
  }

  content = content.replace(/<aside class="sidebar">[\s\S]*?<\/aside>/, customSidebar);
  content = content.replace(/localStorage\.getItem\('token'\)/g, "localStorage.getItem('volgaToken')");
  
  const oldApi = "const API = window.location.origin + '/api';";
  const newApi = "const API = window.location.protocol.startsWith('http') ? window.location.origin + '/api' : 'http://localhost:5000/api';";
  content = content.replace(oldApi, newApi);
  
  if (!content.includes("localStorage.getItem('volgaTheme')")) {
      const themeScript = `
  <script>
    (function initTheme() {
      const saved = localStorage.getItem('volgaTheme');
      if (saved === 'dark') document.documentElement.classList.add('dark');
      const label = document.getElementById('themeLabel');
      if (label) label.textContent = saved === 'dark' ? 'Light Mode' : 'Dark Mode';
    })();
  </script>
</body>`;
      content = content.replace('</body>', themeScript);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${page.file}`);
}
