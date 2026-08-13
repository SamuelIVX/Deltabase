/**
 * Layout wrapper for the crypto market dashboard route.
 */
/**
 * Pass-through layout for this dashboard sub-route.
 * @param {{ children: import('react').ReactNode }} props
 * @param {import('react').ReactNode} props.children - Nested page content.
 * @returns {JSX.Element}
 */
export default function Layout({ children }) {
    return (
        <div>
            {children}
        </div>
    );
}