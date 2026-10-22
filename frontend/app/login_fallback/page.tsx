import { Suspense } from 'react';
import RedirectWrapperPage from '@/src/components/RedirectWrapper';

export default function RedirectPage() {
    return (
        <Suspense fallback={<div>Redirecting...</div>}>
            <RedirectWrapperPage />
        </Suspense>
    );
}
