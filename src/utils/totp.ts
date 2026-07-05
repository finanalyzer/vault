export interface OtpResult {
  code: string;
  remaining: number;
}

export function parseOtpUrl(otpUrl: string): { secret: string; issuer?: string; label?: string } | null {
  console.log('[totp.ts] parseOtpUrl called with:', otpUrl?.substring(0, 50) + (otpUrl?.length > 50 ? '...' : ''));
  
  if (!otpUrl || !otpUrl.startsWith('otpauth://')) {
    console.log('[totp.ts] parseOtpUrl failed: invalid or missing otpUrl');
    return null;
  }

  try {
    const url = new URL(otpUrl);
    const params = new URLSearchParams(url.search);
    const secret = params.get('secret');
    console.log('[totp.ts] parseOtpUrl via URL constructor: secret found=', !!secret);
    
    if (!secret) {
      console.log('[totp.ts] parseOtpUrl failed: no secret in params');
      return null;
    }
    
    const result = {
      secret,
      issuer: params.get('issuer') || undefined,
      label: url.pathname.slice(1),
    };
    console.log('[totp.ts] parseOtpUrl success:', result);
    return result;
  } catch (e) {
    console.log('[totp.ts] parseOtpUrl URL constructor failed, trying regex:', e);
    const match = otpUrl.match(/otpauth:\/\/([^\/]+)\/([^?]+)\?(.*)/);
    console.log('[totp.ts] parseOtpUrl regex match:', match);
    if (!match) {
      console.log('[totp.ts] parseOtpUrl regex failed: no match');
      return null;
    }

    const queryString = match[3];
    const params: Record<string, string> = {};
    
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key && value) {
        params[key] = decodeURIComponent(value);
      }
    });

    const secret = params['secret'];
    console.log('[totp.ts] parseOtpUrl regex secret:', secret);
    if (!secret) {
      console.log('[totp.ts] parseOtpUrl regex failed: no secret');
      return null;
    }

    const result = {
      secret,
      issuer: params['issuer'] || undefined,
      label: decodeURIComponent(match[2]),
    };
    console.log('[totp.ts] parseOtpUrl regex success:', result);
    return result;
  }
}

function base32Decode(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  base32 = base32.toUpperCase().replace(/[^A-Z2-7=]/g, '');
  
  const unpadded = base32.replace(/=+$/, '');
  
  const bitString = unpadded.split('').map(c => {
    const idx = alphabet.indexOf(c);
    if (idx === -1) throw new Error('Invalid base32 character');
    return idx.toString(2).padStart(5, '0');
  }).join('');
  
  const byteCount = Math.floor((bitString.length) / 8);
  const buffer = new ArrayBuffer(byteCount);
  const bytes = new Uint8Array(buffer);
  
  for (let i = 0; i < byteCount; i++) {
    const byte = bitString.substring(i * 8, (i + 1) * 8);
    bytes[i] = parseInt(byte, 2);
  }
  
  return bytes;
}

export async function generateOtp(secret: string): Promise<OtpResult> {
  console.log('[totp.ts] generateOtp called with secret:', secret);
  try {
    const key = base32Decode(secret);
    console.log('[totp.ts] decoded key length:', key.length, 'bytes');
    
    const now = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    const counter = Math.floor(now / timeStep);
    
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(0, Math.floor(counter / 0x100000000), false);
    counterView.setUint32(4, counter % 0x100000000, false);
    
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key.buffer as ArrayBuffer,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );
    
    const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
    const hmac = new Uint8Array(signature);
    
    const offset = hmac[hmac.length - 1] & 0x0F;
    const code = (
      ((hmac[offset] & 0x7F) << 24) |
      ((hmac[offset + 1] & 0xFF) << 16) |
      ((hmac[offset + 2] & 0xFF) << 8) |
      (hmac[offset + 3] & 0xFF)
    ) % 1000000;
    
    const remaining = timeStep - (now % timeStep);
    const resultCode = code.toString().padStart(6, '0');
    console.log('[totp.ts] generateOtp success:', { code: resultCode, remaining });
    return { code: resultCode, remaining };
  } catch (e) {
    console.error('[totp.ts] generateOtp error:', e);
    throw e;
  }
}

export function getOtpRemainingSeconds(): number {
  const now = Math.floor(Date.now() / 1000);
  return 30 - (now % 30);
}