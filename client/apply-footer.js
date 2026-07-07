const fs = require('fs');
const path = require('path');

const dir = __dirname;

const files = [
  'index.html',
  'about.html',
  'blog.html',
  'blog-detail.html',
  'contact.html',
  'portfolio.html',
  'solutions.html',
  'services.html',
  'industries.html',
  'case-studies.html',
  'case-study-detail.html',
  'client-stories.html',
  'industry-news.html',
  'industry-news-detail.html',
  'insights-overview.html',
  'technologies (2).html',
  'careers-page (1).html',
];

// The replacement — a single mount div + script tag
const FOOTER_REPLACEMENT = `<div id="site-footer-mount"></div>
<script src="footer-include.js"></script>`;

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${file}`);
    skipped++;
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Already converted
  if (html.includes('footer-include.js')) {
    console.log(`SKIP (already updated): ${file}`);
    skipped++;
    return;
  }

  // Find the start of the footer block — look for the <style> block that precedes the footer
  // OR directly the <div class="footer"> wrapper
  // Strategy: find the LAST occurrence of the footer style+html+script block
  // The block always starts with either:
  //   <style>\n.footer{  OR  <!-- FOOTER -->  OR  <!-- ═══...FOOTER -->
  // and ends after the closing </script> of the GSAP footer animation

  // Find the footer div start (last occurrence to handle pages with duplicate footers like blog.html)
  const footerDivMarker = '<div class="footer"><div class="footer-wrap" id="volga-footer">';
  const altFooterDivMarker = '<div class="footer-wrap" id="volga-footer">';

  let blockStart = -1;

  // Walk backwards from the last footer div to find the preceding <style> or comment
  let footerDivIdx = html.lastIndexOf(footerDivMarker);
  if (footerDivIdx === -1) footerDivIdx = html.lastIndexOf(altFooterDivMarker);

  if (footerDivIdx === -1) {
    console.log(`SKIP (no footer div found): ${file}`);
    skipped++;
    return;
  }

  // Look back up to 3000 chars for a <style> block that belongs to the footer
  const searchBack = Math.max(0, footerDivIdx - 3000);
  const before = html.substring(searchBack, footerDivIdx);

  // Find the last <style> in that window (footer CSS block)
  const styleIdx = before.lastIndexOf('<style>');
  if (styleIdx !== -1) {
    blockStart = searchBack + styleIdx;
  } else {
    // No style block — look for a comment marker
    const commentIdx = before.lastIndexOf('<!-- ');
    if (commentIdx !== -1) {
      blockStart = searchBack + commentIdx;
    } else {
      blockStart = footerDivIdx;
    }
  }

  // Find the end: the </script> that closes the GSAP footer animation
  // It comes after the footer div, search forward from footerDivIdx
  const afterFooterDiv = html.indexOf('</script>', footerDivIdx);
  if (afterFooterDiv === -1) {
    console.log(`SKIP (no closing script found): ${file}`);
    skipped++;
    return;
  }
  const blockEnd = afterFooterDiv + '</script>'.length;

  // Replace the entire block
  html = html.substring(0, blockStart) + FOOTER_REPLACEMENT + html.substring(blockEnd);

  // If there's still another inline footer (e.g. blog.html had two), remove it too
  while (html.includes(footerDivMarker) || html.includes(altFooterDivMarker)) {
    let idx = html.lastIndexOf(footerDivMarker);
    if (idx === -1) idx = html.lastIndexOf(altFooterDivMarker);

    const searchB = Math.max(0, idx - 3000);
    const bef = html.substring(searchB, idx);
    const sIdx = bef.lastIndexOf('<style>');
    let bStart = sIdx !== -1 ? searchB + sIdx : idx;

    const aft = html.indexOf('</script>', idx);
    if (aft === -1) break;
    const bEnd = aft + '</script>'.length;

    html = html.substring(0, bStart) + html.substring(bEnd);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`UPDATED: ${file}`);
  updated++;
});

console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
