import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
const links = [
  { to: "/", label: "Home" },
  { to: "/activities", label: "Activities" },
  { to: "/news", label: "News" },
  { to: "/gallery", label: "Gallery" },
  { to: "/apply", label: "Become a Member" },
];

export default function PublicHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center overflow-hidden">
  <img
    src={logo}
    alt="BHSF Logo"
    className="w-10 h-10 object-contain"
  />
</div>
          <span className="font-bold text-darkgray text-sm sm:text-base leading-tight">
            Bharatiya Hindu
            <br className="sm:hidden" /> Shakti Foundation
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-saffron" : "text-gray-600 hover:text-saffron"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/admin/login" className="text-sm font-medium text-gray-500 hover:text-darkgray">
            Admin
          </Link>
        </nav>
        <Link to="/apply" className="md:hidden btn-primary text-xs px-3 py-1.5">
          Join Now
        </Link>
      </div>
      <nav className="md:hidden flex overflow-x-auto gap-4 px-4 pb-2 text-sm">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `whitespace-nowrap ${isActive ? "text-saffron font-medium" : "text-gray-600"}`}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
