// Email body parser utility to separate content from signatures
export interface ParsedEmailBody {
  content: string;
  signature?: {
    text: string;
    companyId?: string;
  };
}

// Map email domains and names to company IDs
const COMPANY_MAPPING: Record<string, string> = {
  // J.P. Morgan variants
  '@jpmorgan.com': 'jpmorgan',
  'j.p. morgan': 'jpmorgan',
  'jpmorgan': 'jpmorgan',
  'jp morgan': 'jpmorgan',
  
  // Bloomberg
  '@bloomberg.net': 'bloomberg',
  'bloomberg': 'bloomberg',
  
  // Microsoft
  '@teams.microsoft.com': 'microsoft',
  'microsoft': 'microsoft',
  
  // QBE Insurance
  '@qbe.com': 'qbe',
  'qbe': 'qbe',
  
  // Club Plus Super
  '@clubplus.com.au': 'club-plus',
  'club plus': 'club-plus',
  
  // TWUSUPER
  '@twusuper.com.au': 'twusuper',
  'twusuper': 'twusuper',
  
  // Future Fund
  '@futurefund.gov.au': 'future-fund',
  'future fund': 'future-fund',
  
  // AMP Capital
  '@ampcapital.com': 'amp-capital',
  'amp capital': 'amp-capital',
  
  // Sunsuper
  '@sunsuper.com.au': 'sunsuper',
  'sunsuper': 'sunsuper',
  
  // Facilities
  '@101collins.com.au': 'facilities',
  '101 collins': 'facilities',
};

function detectCompanyFromSignature(signatureText: string, senderEmail?: string): string | undefined {
  const lowerSignature = signatureText.toLowerCase();
  
  // First try to match by email domain if provided
  if (senderEmail) {
    for (const [domain, companyId] of Object.entries(COMPANY_MAPPING)) {
      if (domain.startsWith('@') && senderEmail.includes(domain)) {
        return companyId;
      }
    }
  }
  
  // Then try to match by company name in signature
  for (const [name, companyId] of Object.entries(COMPANY_MAPPING)) {
    if (!name.startsWith('@') && lowerSignature.includes(name)) {
      return companyId;
    }
  }
  
  return undefined;
}

export function parseEmailBody(body: string, senderEmail?: string): ParsedEmailBody {
  // Look for signature separator (-- followed by newline)
  const signatureSeparatorIndex = body.lastIndexOf('\n--\n');
  
  if (signatureSeparatorIndex === -1) {
    // No signature separator found, return entire body as content
    return { content: body };
  }
  
  const content = body.substring(0, signatureSeparatorIndex).trim();
  const signatureText = body.substring(signatureSeparatorIndex + 4).trim(); // +4 to skip "\n--\n"
  
  if (!signatureText) {
    return { content: body };
  }
  
  const companyId = detectCompanyFromSignature(signatureText, senderEmail);
  
  return {
    content,
    signature: {
      text: signatureText,
      companyId,
    },
  };
}