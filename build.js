import * as esbuild from "esbuild";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const PROPS_DIR = "src/props";

// Get all prop names from the props directory
function getProps() {
  return readdirSync(PROPS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

// Common esbuild options
const common = {
  bundle: true,
  sourcemap: true,
  target: ["es2020"],
};

async function buildProp(propName) {
  const propDir = join(PROPS_DIR, propName);
  const outDir = join("dist", propName);

  // Ensure output directory exists
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const entryPoint = join(propDir, "index.ts");
  const cssPath = join(propDir, "styles.css");
  const hasCSS = existsSync(cssPath);

  console.log(`Building prop: ${propName}`);

  // IIFE build (for direct browser use)
  await esbuild.build({
    ...common,
    entryPoints: [entryPoint],
    outfile: join(outDir, `${propName}.js`),
    format: "iife",
    globalName: `d2f_${propName}`,
  });

  // Minified IIFE
  await esbuild.build({
    ...common,
    entryPoints: [entryPoint],
    outfile: join(outDir, `${propName}.min.js`),
    format: "iife",
    globalName: `d2f_${propName}`,
    minify: true,
    sourcemap: false,
  });

  // ESM build (for bundlers)
  await esbuild.build({
    ...common,
    entryPoints: [entryPoint],
    outfile: join(outDir, `${propName}.esm.js`),
    format: "esm",
  });

  // Handle CSS if it exists
  if (hasCSS) {
    const css = readFileSync(cssPath, "utf8");

    // Copy CSS
    writeFileSync(join(outDir, `${propName}.css`), css);

    // Minify CSS
    const minified = await esbuild.build({
      stdin: { contents: css, loader: "css" },
      minify: true,
      write: false,
    });
    writeFileSync(join(outDir, `${propName}.min.css`), minified.outputFiles[0].text);

    // Bundle with CSS injected
    const cssInjector = `
(function(){
  if (typeof document !== 'undefined' && !document.getElementById('d2f-${propName}-styles')) {
    var style = document.createElement('style');
    style.id = 'd2f-${propName}-styles';
    style.textContent = ${JSON.stringify(css)};
    document.head.appendChild(style);
  }
})();
`;
    await esbuild.build({
      ...common,
      entryPoints: [entryPoint],
      outfile: join(outDir, `${propName}.bundle.min.js`),
      format: "iife",
      globalName: `d2f_${propName}`,
      minify: true,
      sourcemap: false,
      banner: { js: cssInjector },
    });
  }

  console.log(`  ✓ ${propName} built`);
}

async function build() {
  const props = getProps();

  console.log(`\nd2fprops build`);
  console.log(`Found ${props.length} prop(s): ${props.join(", ")}\n`);

  // Build each prop individually
  for (const prop of props) {
    await buildProp(prop);
  }

  console.log(`\nBuild complete!`);
  console.log(`\nOutputs per prop:`);
  console.log(`  dist/{prop}/{prop}.js           - IIFE (browser)`);
  console.log(`  dist/{prop}/{prop}.min.js       - IIFE minified`);
  console.log(`  dist/{prop}/{prop}.esm.js       - ESM (bundlers)`);
  console.log(`  dist/{prop}/{prop}.bundle.min.js - JS + CSS combined`);
  console.log(`  dist/{prop}/{prop}.css          - Styles`);
  console.log(`  dist/{prop}/{prop}.min.css      - Styles minified`);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
