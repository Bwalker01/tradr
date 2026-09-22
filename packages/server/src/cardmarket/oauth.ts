import { createHmac, randomBytes } from 'node:crypto';

export interface OAuthCredentials {
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
}

/**
 * Builds the `Authorization` header for a Cardmarket API v2.0 request using
 * OAuth 1.0a (PLAINTEXT-signature-free HMAC-SHA1), as required by the API.
 * See: https://www.cardmarket.com/en/Magic/Account/API
 */
export function buildOAuthHeader(
  method: string,
  url: string,
  credentials: OAuthCredentials,
): string {
  const parsedUrl = new URL(url);
  const baseUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: credentials.consumerKey,
    oauth_token: credentials.token,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_version: '1.0',
  };

  const allParams: Record<string, string> = { ...oauthParams };
  for (const [key, value] of parsedUrl.searchParams.entries()) {
    allParams[key] = value;
  }

  const signatureBase = buildSignatureBase(method, baseUrl, allParams);
  const signingKey = `${percentEncode(credentials.consumerSecret)}&${percentEncode(credentials.tokenSecret)}`;
  const signature = createHmac('sha1', signingKey).update(signatureBase).digest('base64');

  const headerParams: Record<string, string> = { ...oauthParams, oauth_signature: signature };
  const headerString = Object.keys(headerParams)
    .sort()
    .map((key) => `${percentEncode(key)}="${percentEncode(headerParams[key] as string)}"`)
    .join(', ');

  return `OAuth ${headerString}`;
}

function buildSignatureBase(method: string, baseUrl: string, params: Record<string, string>): string {
  const normalizedParams = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key] as string)}`)
    .join('&');

  return [method.toUpperCase(), percentEncode(baseUrl), percentEncode(normalizedParams)].join('&');
}

function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!*'()]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}
