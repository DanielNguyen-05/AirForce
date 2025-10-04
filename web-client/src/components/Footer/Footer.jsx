import { FaFacebookF, FaGithub } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-[#1F67F1] text-white py-6">
      <div className="mx-[50px] flex flex-col items-start gap-4">
        <div className="text-lg font-bold">AirForce</div>

        <div className="flex gap-3">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-[#1F67F0] hover:bg-gray-200 transition"
          >
            <FaFacebookF size={20} />
          </a>
          <a
            href="https://github.com/DanielNguyen-05/AirForce"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-[#1F67F0] hover:bg-gray-200 transition"
          >
            <FaGithub size={20} />
          </a>
        </div>

        <p className="text-sm">
          ©2025 <span className="font-bold">NASA Space Apps Challenge</span>
        </p>
      </div>
    </footer>
  );
}
