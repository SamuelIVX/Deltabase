/**
 * Layout wrapper for the crypto market dashboard route.
 */
import React from "react";

interface LayoutProps {
    children: React.ReactNode;
}

/**
 * Pass-through layout for this dashboard sub-route.
 * @param props - Nested page content.
 * @returns {JSX.Element} Sub-route layout.
 */
export default function Layout({ children }: LayoutProps): React.JSX.Element {
    return (
        <div>
            {children}
        </div>
    );
}
