import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const generateNonce = () => {
  const randomValue = crypto.randomBytes(16);
  const nonce = crypto.createHash('sha256').update(randomValue).digest('base64');
  return nonce;
};


function sanitizePath(filePath: string): string {
  const normalizedPath = path.normalize(filePath);
  // Ensure the path doesn't contain any '..' that could lead outside of the allowed folder
  if (normalizedPath.includes('..')) {
    throw new Error(`Invalid path detected: ${filePath}. Path traversal is not allowed.`);
  }
  return normalizedPath;
}

export const writeNonceToFile = (): void => {
  const filePath = "./.nonce";
  try {
    const randomNonce = generateNonce();
    const nonceBuffer = Buffer.from(randomNonce, 'utf-8');
    fs.writeFileSync(filePath, nonceBuffer);
    console.log(`Nonce successfully written to file: ${filePath}`);
  } catch (err) {
    console.error(`Error writing nonce to file ${filePath}: ${err.message}`);
    throw err;
  }
}

export const readNonceFromFile = (): string => {
  const filePath = "./.nonce";
  try {
    const data = sanitizePath(filePath);
    return data.trim(); // Trim to remove extra whitespace, if any
  } catch (err) {
    console.error(`Error reading nonce from file ${filePath}: ${err.message}`);
    throw err;
  }
}