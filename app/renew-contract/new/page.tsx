import { Suspense } from 'react';
import RenewContractForm from './RenewContractForm';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RenewContractForm />
    </Suspense>
  );
}