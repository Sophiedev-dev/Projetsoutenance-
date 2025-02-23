const { generateKeyPairSync, createSign, createVerify } = require('crypto');

const generateKeyPair = () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  
  return { privateKey, publicKey };
};

const signDocument = (data, privateKey) => {
  const sign = createSign('SHA256');
  sign.update(data);
  return sign.sign(privateKey, 'base64');
};

const verifySignature = (data, signature, publicKey) => {
  const verify = createVerify('SHA256');
  verify.update(data);
  return verify.verify(publicKey, signature, 'base64');
};

module.exports = {
  generateKeyPair,
  signDocument,
  verifySignature
}; 