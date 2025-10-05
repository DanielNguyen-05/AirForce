export const Section3 = () => {
  return (
    <>
      <div className="bg-[#1F67F1] rounded-t-[60px] h-[700px] relative overflow-hidden" data-aos="fade-up">
        <div className="flex flex-col items-center justify-center py-12" data-aos="fade-up" data-aos-delay="200">
          <h2 className="text-[64px] font-bold text-white mb-8" data-aos="fade-up" data-aos-delay="300">
            Features of <span className="text-yellow-300">AirForce</span>
          </h2>

          <div className="relative">
            <img 
              src="/section3.png" 
              alt="" 
              className="w-[700px] h-auto object-contain"
            />

            <div className="absolute top-[0px] left-[10px]">
              <div className="px-5 py-2 whitespace-nowrap">
                <p className="text-[#F4FF4B] font-semibold text-lg">Real-Time Air Quality Updates</p>
              </div>
            </div>

            <div className="absolute top-[-40px] right-[10px]">
              <div className="px-5 py-2 whitespace-nowrap">
                <p className="text-[#F4FF4B] font-semibold text-lg">Air Quality Forecasting</p>
              </div>
            </div>

            <div className="absolute bottom-[10px] left-[30px]" >
              <div className="px-5 py-2 whitespace-nowrap">
                <p className="text-[#F4FF4B] font-semibold text-lg">Visualization and Alerts</p>
              </div>
            </div>

            <div className="absolute bottom-[50px] right-[-30px]">
              <div className="px-5 py-2 whitespace-nowrap">
                <p className="text-[#F4FF4B] font-semibold text-lg">Helpful advice for next 7-day</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}