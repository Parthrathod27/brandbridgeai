import fs from 'fs';
import path from 'path';

function traverse(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverse(fullPath, callback);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      callback(fullPath);
    }
  });
}

function runMigration(targetDir) {
  traverse(targetDir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');

    const replacements = [
      { find: /bg-\[\#12121c\]/g, replace: "bg-[var(--bg)]" },
      { find: /bg-[#0a0a0f]/g, replace: "bg-[var(--bg)]" },
      { find: /text-white\/60/g, replace: "text-[var(--ink-soft)]" },
      { find: /text-white\/50/g, replace: "text-[var(--ink-faint)]" },
      { find: /text-white\/45/g, replace: "text-[var(--ink-faint)]" },
      { find: /text-white\/40/g, replace: "text-[var(--ink-faint)]" },
      { find: /text-white\/80/g, replace: "text-[var(--ink)]" },
      { find: /text-white\/90/g, replace: "text-[var(--ink)]" },
      // Careful bounding for text-white 
      { find: /(?<!-)text-white(?!\/|-)/g, replace: "text-[var(--ink)]" },
      { find: /border-white\/10/g, replace: "border-[var(--border)]" },
      { find: /border-white\/5/g, replace: "border-[var(--border)]" },
      { find: /border-white\/20/g, replace: "border-[var(--border)]" },
      { find: /bg-white\/3/g, replace: "bg-[var(--surface-strong)]" },
      { find: /bg-white\/5/g, replace: "bg-[var(--surface-strong)]" },
      { find: /bg-white\/10/g, replace: "bg-[var(--surface-strong)]" },
      { find: /bg-white\/15/g, replace: "bg-[var(--surface-strong)]" },
      { find: /from-\[\#12121c\]/g, replace: "from-[var(--bg)]" },
      { find: /to-\[\#0a0a0f\]/g, replace: "to-[var(--bg)]" },
      // Replace hard grays
      // Replace hard grays
      { find: /text-gray-400/g, replace: "text-ink-soft" },
      { find: /text-gray-300/g, replace: "text-ink" },
      { find: /text-gray-200/g, replace: "text-ink" },
      { find: /border-gray-800/g, replace: "border-border" },
      { find: /bg-gray-900/g, replace: "bg-bg" },
      { find: /bg-zinc-900/g, replace: "bg-bg" },
      { find: /bg-zinc-950/g, replace: "bg-bg" },

      // Messages center custom hex components
      { find: /bg-\[\#0A0A0B\]/g, replace: "bg-bg" },
      { find: /bg-\[\#0F0F12\]/g, replace: "bg-surface" },
      { find: /bg-\[\#1A1A1D\]/g, replace: "bg-surface-strong" },
      { find: /bg-\[\#2D2D35\]/g, replace: "bg-surface-strong" },

      // Custom purple mapping
      { find: /bg-\[\#6C5CE7\]/g, replace: "bg-purple" },
      { find: /hover:bg-\[\#5B4BC4\]/g, replace: "hover:bg-purple" },
      { find: /text-\[\#6C5CE7\]/g, replace: "text-purple" },
      { find: /border-\[\#6C5CE7\]/g, replace: "border-purple" },
      { find: /focus:border-\[\#6C5CE7\]/g, replace: "focus:border-purple" },
      // Custom purples in opacities
      { find: /bg-\[\#6C5CE7\]\/10/g, replace: "bg-purple/10" },
      { find: /bg-\[\#6C5CE7\]\/20/g, replace: "bg-purple/20" },
      { find: /hover:bg-\[\#6C5CE7\]\/20/g, replace: "hover:bg-purple/20" },
      { find: /border-\[\#6C5CE7\]\/30/g, replace: "border-purple/30" },
      { find: /border-\[\#6C5CE7\]\/50/g, replace: "border-purple/50" },
    ];

    let newContent = content;
    // Protect modal overlays which intentionally use bg-black/60
    newContent = newContent.replace(/bg-black\/60/g, "SAFE_MODAL_BG_60");
    newContent = newContent.replace(/bg-black\/50/g, "SAFE_MODAL_BG_50");
    newContent = newContent.replace(/bg-black/g, "bg-[var(--bg)]");
    newContent = newContent.replace(/SAFE_MODAL_BG_60/g, "bg-black/60");
    newContent = newContent.replace(/SAFE_MODAL_BG_50/g, "bg-black/50");

    for (const { find, replace } of replacements) {
      newContent = newContent.replace(find, replace);
    }

    // Fix purples that wash out on white backgrounds
    newContent = newContent.replace(/text-purple-200/g, "text-purple");
    newContent = newContent.replace(/text-purple-300/g, "text-purple");
    newContent = newContent.replace(/text-purple-400/g, "text-purple");

    // Catch every variation of text opacity
    newContent = newContent.replace(/text-white\/([0-9]+)/g, (match, opacity) => {
      const o = parseInt(opacity);
      if (o < 45) return "text-ink-faint";
      if (o <= 75) return "text-ink-soft";
      return "text-ink";
    });

    // Catch every variation of text-gray
    newContent = newContent.replace(/text-gray-([0-9]+)/g, (match, shade) => {
      const s = parseInt(shade);
      if (s < 500) return "text-ink-soft";
      return "text-ink";
    });

    // Retroactively clean up the arbitrary bindings I added earlier.
    newContent = newContent.replace(/text-\[var\(--ink\)\]/g, "text-ink");
    newContent = newContent.replace(/text-\[var\(--ink-soft\)\]/g, "text-ink-soft");
    newContent = newContent.replace(/text-\[var\(--ink-faint\)\]/g, "text-ink-faint");
    newContent = newContent.replace(/text-\[var\(--purple\)\]/g, "text-purple");

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log('Migrated', filePath);
    }
  });
}

runMigration(path.join(process.cwd(), 'src', 'components', 'dashboard'));
runMigration(path.join(process.cwd(), 'src', 'components', 'messages'));
runMigration(path.join(process.cwd(), 'src', 'app', '(protected)'));
