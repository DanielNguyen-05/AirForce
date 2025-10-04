import { Link } from "react-router-dom";

export const Section1 = () => {
  return (
    <>
      <div className="flex flex-col items-center relative">
        <div className="relative text-center z-10">
          <h1 className="text-[220px] font-extrabold leading-none bg-gradient-to-b from-[#ffffffa7] to-white/0 text-transparent bg-clip-text" data-aos="fade-up">
            AirForce
          </h1>
          <h2 className="absolute inset-0 flex justify-center items-center text-[96px] font-bold mt-[100px]" data-aos="fade-up" data-aos-delay="300">
            From <span className="text-yellow-300 mx-4">EarthData</span> to{" "}
            <span className="text-yellow-300 ml-4">Action</span>
          </h2>
          <p className="text-white font-bold text-[30px]" data-aos="fade-up" data-aos-delay="350">
            Cloud Computing with Earth Observation Data
          </p>
        </div>

        <div className="flex mt-10 z-10">
          <div className="bg-white/20 backdrop-blur-lg rounded-xl w-[300px] h-[150px] flex flex-col justify-center items-center rotate-[-15deg] shadow-lg" data-aos="fade-left" data-aos-delay="350">
            <div className="text-4xl bg-[#F4FF4B47] px-[20px] py-[15px] rounded-full border-[#FFFFFFC1] border-[1.2px]">✔</div>
            <p className="mt-2 text-[#0159EF] text-[24px] font-bold text-center">
              Predicting Cleaner
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-lg rounded-xl w-[300px] h-[150px] flex flex-col justify-center items-center rotate-[10deg] shadow-lg" data-aos="fade-right" data-aos-delay="350">
            <div className="text-4xl bg-[#F4FF4B47] px-[20px] py-[15px] rounded-full border-[#FFFFFFC1] border-[1.2px]">✔</div>
            <p className="mt-2 text-[#0159EF] text-[24px] font-bold text-center">
              Safer Skies
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center items-center py-6 mt-[10px] z-10" data-aos="fade-up" data-aos-delay="300">
          <Link to="/dashboard" className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition">
            Get Started
          </Link>

          <Link to="/contact" className="px-6 py-2 rounded-full bg-white text-black font-semibold shadow-md hover:bg-gray-100 transition">
            About us
          </Link>
        </div>
        <div className="w-[1500px]">
          <img
            src="/cloud.png"
            alt=""
            className="absolute bottom-[-100px] left-0 w-full opacity-90"
            data-aos="fade-up"
          />
        </div>
      </div>
    </>
  );
}