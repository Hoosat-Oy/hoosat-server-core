import fs from 'fs';
import crypto from 'crypto';

const generateNonce = () => {
  const randomValue = crypto.randomBytes(16);
  const nonce = crypto.createHash('sha256').update(randomValue).digest('base64');
  return nonce;
};

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
    const data = fs.readFileSync(filePath, 'utf-8');
    return data.trim(); // Trim to remove extra whitespace, if any
  } catch (err) {
    console.error(`Error reading nonce from file ${filePath}: ${err.message}`);
    throw err;
  }
}