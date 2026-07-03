import { OTP } from 'otplib';

export interface OtpResult {
  code: string;
  remaining: number;
}

export function parseOtpUrl(otpUrl: string): { secret: string; issuer?: string; label?: string } | null {
  try {
    const url = new URL(otpUrl);
    const params = new URLSearchParams(url.search);
    const secret = params.get('secret');
    
    if (!secret) return null;
    
    return {
      secret,
      issuer: params.get('issuer') || undefined,
      label: url.pathname.slice(1),
    };
  } catch {
    return null;
  }
}

export function generateOtp(secret: string): OtpResult {
  const otp = new OTP({ strategy: 'totp' });
  const code = otp.generateSync({
    secret,
    digits: 6,
    algorithm: 'sha1',
    period: 30,
  });
  
  const now = Math.floor(Date.now() / 1000);
  const remaining = 30 - (now % 30);
  
  return { code, remaining };
}

export function getOtpRemainingSeconds(): number {
  const now = Math.floor(Date.now() / 1000);
  return 30 - (now % 30);
}