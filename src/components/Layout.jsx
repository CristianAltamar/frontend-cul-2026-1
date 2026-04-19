import { Navbar } from "./Navbar.jsx";
import { Outlet } from "react-router-dom";

export function Layout() {
    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
}
