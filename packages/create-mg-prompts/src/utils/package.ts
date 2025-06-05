import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function getPackageJson() {
  const packageJsonPath = join(__dirname, '../package.json');
  const content = await readFile(packageJsonPath, 'utf-8');
  return JSON.parse(content);
}