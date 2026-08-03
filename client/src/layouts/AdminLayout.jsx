import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import logo from "../assets/logo.png";
const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/activities", label: "Activities" },
  { to: "/admin/news", label: "News" },
  { to: "/admin/gallery", label: "Gallery" },
];

// Visible to SUPER_ADMIN only - designation/location management and
// system-level admin account controls.
const superAdminNavItems = [
  { to: "/admin/organization", label: "Organization Structure" },
  { to: "/admin/departments", label: "Departments" },
  { to: "/admin/settings", label: "Settings" },
  { to: "/admin/admin-management", label: "Admin Management" },
];

export default function AdminLayout() {
  const { admin, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const visibleNavItems = isSuperAdmin ? [...navItems, ...superAdminNavItems] : navItems;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-200">
          <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center overflow-hidden">
  <img
    src={logo}
    alt="BHSF Logo"
    className="w-10 h-10 object-contain"
  />
</div>
          <span className="font-bold text-sm text-darkgray">BHSF Admin</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-saffron-50 text-saffron-700 text-saffron" : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2 px-1">
            {admin?.name} · {admin?.phone}
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-saffron mt-0.5">
              {isSuperAdmin ? "Super Admin" : "Admin"}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full text-sm">
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
          <span className="font-semibold text-darkgray md:hidden">BHSF Admin</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden md:inline">Welcome, {admin?.name}</span>
            <button onClick={handleLogout} className="btn-secondary text-xs md:hidden">
              Log Out
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
