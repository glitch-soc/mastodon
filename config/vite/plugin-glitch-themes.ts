/* This plugins handles glitch-soc's specific theming system
 */

import fs from 'node:fs';
import path from 'node:path';

import glob from 'fast-glob';
import yaml from 'js-yaml';
import type { Plugin, UserConfig } from 'vite';

export function GlitchThemesPlugin(): Plugin {
  return {
    name: 'glitch-themes',
    config,
  };
}

interface Flavour {
  pack_directory: string;
}

function config(): UserConfig {
  const entrypoints: Record<string, string> = {};

  const glitchFlavourFiles = glob.sync('app/javascript/flavours/*/theme.yml');

  for (const flavourFile of glitchFlavourFiles) {
    const flavourName = path.basename(path.dirname(flavourFile));
    const flavourString = fs.readFileSync(flavourFile, 'utf8');
    const flavourDef = yaml.load(flavourString, {
      filename: 'theme.yml',
      schema: yaml.FAILSAFE_SCHEMA,
    }) as Flavour;

    const flavourEntrypoints = glob.sync(
      `${flavourDef.pack_directory}/*.{ts,tsx,js,jsx}`,
    );
    for (const entrypoint of flavourEntrypoints) {
      const name = `${flavourName}/${path.basename(entrypoint)}`;
      entrypoints[name] = path.resolve(process.cwd(), entrypoint);
    }

    // Skins
    // TODO: handle variants such as `skin/common.scss`
    const skinFiles = glob.sync(`app/javascript/skins/${flavourName}/*.scss`);
    for (const entrypoint of skinFiles) {
      const name = `skins/${flavourName}/${path.basename(entrypoint)}`;
      entrypoints[name] = path.resolve(process.cwd(), entrypoint);
    }
  }

  return {
    build: {
      rollupOptions: {
        input: entrypoints,
      },
    },
  };
}
