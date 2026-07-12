import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ValueReceiptEmailProps {
  businessName: string;
  siteUrl: string;
  weatherContext: string;
  activeAction: string;
}

export const ValueReceiptEmail = ({
  businessName,
  siteUrl,
  weatherContext,
  activeAction,
}: ValueReceiptEmailProps) => {
  const previewText = `Your Autonomous Website is Live - ${businessName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Autonomous Website is Live.</Heading>
          
          <Section style={section}>
            <Text style={text}>
              <strong>Site:</strong> <a href={siteUrl} style={link}>{siteUrl}</a>
            </Text>
            <Text style={text}>
              <strong>Status:</strong> <span style={statusBadge}>Deployed & Active</span>
            </Text>
            <Hr style={hr} />
            <Text style={text}>
              <strong>Current Weather Sync:</strong> {weatherContext}
            </Text>
            <Text style={text}>
              <strong>Active AI Action:</strong> {activeAction}
            </Text>
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            Your automated engine is running. We will email you your traffic report next week.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  border: '1px solid #eaeaea',
  maxWidth: '600px',
  marginTop: '40px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '0',
  margin: '0 0 20px 0',
};

const section = {
  margin: '0 0 20px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const link = {
  color: '#0066cc',
  textDecoration: 'none',
};

const statusBadge = {
  backgroundColor: '#e6f4ea',
  color: '#1e8e3e',
  padding: '4px 8px',
  borderRadius: '4px',
  fontWeight: 600,
  fontSize: '14px',
};

const hr = {
  borderColor: '#eaeaea',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
};

export default ValueReceiptEmail;
