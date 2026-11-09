/**
 * Layout wrapper for the What-If DCA simulator route.
 */
import type { ReactNode } from 'react';

/**
 * Pass-through layout for this dashboard sub-route.
 */
export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div>
            {children}
        </div>
    );
}
