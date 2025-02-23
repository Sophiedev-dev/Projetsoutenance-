import { generateKeyPairSync, createSign, createVerify } from 'crypto';

export const generateKeyPair = () => {
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

export const signDocument = (data: string, privateKey: string) => {
  const sign = createSign('SHA256');
  sign.update(data);
  return sign.sign(privateKey, 'base64');
};

export const verifySignature = (data: string, signature: string, publicKey: string) => {
  const verify = createVerify('SHA256');
  verify.update(data);
  return verify.verify(publicKey, signature, 'base64');
}; 