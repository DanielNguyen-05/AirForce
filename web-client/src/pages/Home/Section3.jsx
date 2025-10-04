export const Section3 = () => {
  return (
    <>
      <div className="bg-[#1F67F1] rounded-t-[60px] h-[700px] relative overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12" data-aos="fade-up">
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
                <p className="text-[#F4FF4B] font-semibold text-2xl">Placeholder 1</p>
              </div>
            </div>

            <div className="absolute top-[-40px] right-[10px]">
              <div className="px-5 py-2 whitespace-nowrap">
                <p className="text-[#F4FF4B] font-semibold text-2xl">Placeholder 1</p>
              </div>
            </div>

            <div className="absolute bottom-[10px] left-[30px]" >
              <div className="px-5 py-2 whitespace-nowrap">
                <p className="text-[#F4FF4B] font-semibold text-2xl">Placeholder 1</p>
              </div>
            </div>

            <div className="absolute bottom-[50px] right-[0px]">
              <div className="px-5 py-2 whitespace-nowrap">
                <p className="text-[#F4FF4B] font-semibold text-2xl">Placeholder 1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}