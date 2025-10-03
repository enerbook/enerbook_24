import React, { useState } from 'react';
import ProfileTab from '../../src/instalador/components/dashboard/ProfileTab';

export default function InstaladorPerfilScreen() {
  const [userProfile] = useState({
    companyName: 'Solarize Energy',
    email: 'juan.perez@proveedor.com'
  });

  return <ProfileTab userProfile={userProfile} />;
}
