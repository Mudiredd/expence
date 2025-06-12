import type { Metadata } from 'next';
import ReportsClient from '@/components/reports/ReportsClient';

export const metadata: Metadata = {
  title: 'Reports | Vishnu Finance Tracker',
};

export default function ReportsPage() {
  return <ReportsClient />;
}
