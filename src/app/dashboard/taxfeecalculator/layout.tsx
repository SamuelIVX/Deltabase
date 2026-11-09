/**
 * Layout wrapper for the tax/fee calculator route.
 */
import React from 'react';

/**
 * Pass-through layout for this dashboard sub-route.
 * @param props - Layout props containing nested children.
 * @param props.children - Nested page content.
 * @returns {JSX.Element}
 */
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            {children}
        </div>
    );
}
