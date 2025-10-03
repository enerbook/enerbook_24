import React from 'react';
import { useGlobalSearchParams } from 'expo-router';
import ResumenTab from '../../src/admin/components/tabs/ResumenTab';

export default function AdminResumenScreen() {
  const params = useGlobalSearchParams();
  const metrics = params.metrics || null;

  return <ResumenTab metrics={metrics} />;
}
