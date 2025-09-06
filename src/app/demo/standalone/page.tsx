import { Metadata } from 'next';
import StandaloneDemo from './StandaloneDemo';

export const metadata: Metadata = {
  title: 'Content Blocks Demo - Standalone',
  description: 'Standalone demo of WordPress content blocks'
};

export default function StandalonePage() {
  return <StandaloneDemo />;
}