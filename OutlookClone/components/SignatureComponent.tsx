import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface SignatureData {
  text: string;
  companyId?: string;
}

interface SignatureComponentProps {
  signature: SignatureData | string;
}

// Company logo components using simple colored rectangles with text
const CompanyLogo = ({ companyId }: { companyId: string }) => {
  const logoConfig = COMPANY_LOGOS[companyId];
  if (!logoConfig) return null;

  return (
    <View style={[styles.logoContainer, { backgroundColor: logoConfig.color }]}>
      <Text style={styles.logoText}>{logoConfig.name}</Text>
    </View>
  );
};

const COMPANY_LOGOS: Record<string, { name: string; color: string }> = {
  'jpmorgan': { name: 'J.P. Morgan', color: '#003d6b' },
  'bloomberg': { name: 'Bloomberg', color: '#ff6d00' },
  'microsoft': { name: 'Microsoft', color: '#00BCF2' },
  'qbe': { name: 'QBE', color: '#00A651' },
  'club-plus': { name: 'Club Plus Super', color: '#2E5BC7' },
  'twusuper': { name: 'TWUSUPER', color: '#DC143C' },
  'future-fund': { name: 'Future Fund', color: '#1f3a93' },
  'amp-capital': { name: 'AMP Capital', color: '#0070C0' },
  'sunsuper': { name: 'Sunsuper', color: '#FF8C00' },
  'facilities': { name: '101 Collins', color: '#808080' },
};

export function SignatureComponent({ signature }: SignatureComponentProps) {
  // Handle legacy string signatures
  if (typeof signature === 'string') {
    return (
      <Text style={styles.signatureText}>{signature}</Text>
    );
  }

  const { text, companyId } = signature;

  return (
    <View style={styles.signatureContainer}>
      {companyId && COMPANY_LOGOS[companyId] && (
        <CompanyLogo companyId={companyId} />
      )}
      <Text style={styles.signatureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  signatureContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#374151',
  },
  logoContainer: {
    backgroundColor: '#003d6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signatureText: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
  },
});