const crypto = require('crypto');

let keyCache = null;

/**
 * Retrieves the cached asymmetric RSA key pair or generates one dynamically for dev.
 * @returns {{ privateKey: string, publicKey: string }}
 */
function getKeys() {
  if (keyCache) {
    return keyCache;
  }

  let privateKey = process.env.PRIVATE_KEY;
  let publicKey = process.env.PUBLIC_KEY;

  if (privateKey && publicKey) {
    // Check if base64 encoded (a common method for hosting platforms with single-line env configs)
    if (!privateKey.includes('-----BEGIN')) {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
    }
    if (!publicKey.includes('-----BEGIN')) {
      publicKey = Buffer.from(publicKey, 'base64').toString('utf8');
    }
    keyCache = { privateKey, publicKey };
    return keyCache;
  }

  // Self-contained dynamic generation for local development fallback
  console.log('Generating dynamic 2048-bit RSA key pair for local cache...');
  const { privateKey: genPriv, publicKey: genPub } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  keyCache = { privateKey: genPriv, publicKey: genPub };
  return keyCache;
}

module.exports = { getKeys };
