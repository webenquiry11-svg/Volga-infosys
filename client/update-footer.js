
const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'about.html',
  'blog.html',
  'technologies (2).html',
  'portfolio.html',
  'insights-overview.html',
  'industry-news.html',
  'industry-news-detail.html',
  'industries.html',
  'contact.html',
  'case-study-detail.html',
  'case-studies.html',
  'blog-detail.html'
];

// The old footer JS pattern (approximate, we'll look for <script> starting with gsap.registerPlugin(ScrollTrigger); and having const footer = document.getElementById('volga-footer');)
const newFooterJS = `
<script>
gsap.registerPlugin(ScrollTrigger);

const footer       = document.getElementById('volga-footer');
const colLeft      = document.getElementById('col-left');
const colRight     = document.getElementById('col-right');
const colExtraLeft  = document.getElementById('col-extra-left');
const colExtraRight = document.getElementById('col-extra-right');
const footerBottom = document.getElementById('footer-bottom');

if (footer && colLeft && colRight && colExtraLeft && colExtraRight && footerBottom) {
  // Set initial state
  gsap.set(colLeft,       { x: -30, opacity: 0 });
  gsap.set(colRight,      { x:  30, opacity: 0 });
  gsap.set(colExtraLeft,  { x: -20, opacity: 0 });
  gsap.set(colExtraRight, { x:  20, opacity: 0 });
  gsap.set(footerBottom,  { y:  20, opacity: 0 });

  // Helper to show everything immediately
  const showFooter = () => {
    gsap.to(colLeft,       { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
    gsap.to(colRight,      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 });
    gsap.to(colExtraLeft,  { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.15 });
    gsap.to(colExtraRight, { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.2 });
    gsap.to(footerBottom,  { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.25 });
  };

  // Check if footer is already in viewport on load
  const footerRect = footer.getBoundingClientRect();
  const isInViewport = footerRect.top < window.innerHeight;
  if (isInViewport) {
    showFooter();
  } else {
    // Use ScrollTrigger to animate when footer enters view
    ScrollTrigger.create({
      trigger: footer,
      start: 'top 90%',
      onEnter: showFooter,
      once: true
    });
  }

  // Fallback: show everything after 1 second no matter what
  setTimeout(showFooter, 1000);
}
</script>
`;

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the footer script block
    const scriptStart = content.indexOf('<script>\ngsap.registerPlugin(ScrollTrigger);\n\nconst footer       = document.getElementById(\'volga-footer\');');
    if (scriptStart !== -1) {
      // Find the end of the script (</script>)
      const scriptEnd = content.indexOf('</script>', scriptStart) + '</script>'.length;
      
      // Check if there's a balloon animation to preserve
      const hasBalloon = content.includes('gsap.to(balloon,');
      
      // Replace with new footer JS
      if (hasBalloon) {
        const balloonPart = content.match(/gsap\.to\(balloon,[\s\S]*?\}\);/);
        const beforeScript = content.substring(0, scriptStart);
        const afterScript = content.substring(scriptEnd);
        content = beforeScript + `
<script>
gsap.registerPlugin(ScrollTrigger);

const footer       = document.getElementById('volga-footer');
const colLeft      = document.getElementById('col-left');
const colRight     = document.getElementById('col-right');
const colExtraLeft  = document.getElementById('col-extra-left');
const colExtraRight = document.getElementById('col-extra-right');
const footerBottom = document.getElementById('footer-bottom');

if (footer && colLeft && colRight && colExtraLeft && colExtraRight && footerBottom) {
  // Set initial state
  gsap.set(colLeft,       { x: -30, opacity: 0 });
  gsap.set(colRight,      { x:  30, opacity: 0 });
  gsap.set(colExtraLeft,  { x: -20, opacity: 0 });
  gsap.set(colExtraRight, { x:  20, opacity: 0 });
  gsap.set(footerBottom,  { y:  20, opacity: 0 });

  // Helper to show everything immediately
  const showFooter = () => {
    gsap.to(colLeft,       { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
    gsap.to(colRight,      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 });
    gsap.to(colExtraLeft,  { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.15 });
    gsap.to(colExtraRight, { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.2 });
    gsap.to(footerBottom,  { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.25 });
  };

  // Check if footer is already in viewport on load
  const footerRect = footer.getBoundingClientRect();
  const isInViewport = footerRect.top < window.innerHeight;
  if (isInViewport) {
    showFooter();
  } else {
    // Use ScrollTrigger to animate when footer enters view
    ScrollTrigger.create({
      trigger: footer,
      start: 'top 90%',
      onEnter: showFooter,
      once: true
    });
  }

  // Fallback: show everything after 1 second no matter what
  setTimeout(showFooter, 1000);
}

// Keep balloon animation if it exists
${balloonPart ? balloonPart[0] : ''}
</script>
` + afterScript;
      } else {
        const beforeScript = content.substring(0, scriptStart);
        const afterScript = content.substring(scriptEnd);
        content = beforeScript + newFooterJS + afterScript;
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    } else {
      console.log(`No footer script found in ${file}`);
    }
  }
});
console.log('Done updating footer scripts!');
