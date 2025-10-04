import { Link, useLocation, useNavigate } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const linkClass = (path) =>
    `hover:text-[#F4FF4B] ${location.pathname === path ? "text-[#F4FF4B]" : "text-white"
    }`;

  return (
    <div className="w-full flex flex-row justify-around items-center py-[20px] px-[50px]">
      <Link to="/" className="text-[40px] text-white font-bold">AirForce</Link>

      <nav className="flex gap-8 py-3 text-lg font-bold text-[25px]">
        <Link to="/" className={linkClass("/")}>
          Home
        </Link>
        <Link to="/dashboard"  className={linkClass("/dashboard")}>
          Dashboard
        </Link>
        <Link to="/contact" className={linkClass("/contact")}>
          Contact
        </Link>
      </nav>
    </div>
  );
};