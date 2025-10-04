import { FaFacebookSquare } from "react-icons/fa";
import { FaGithubSquare } from "react-icons/fa";

export const Section = () => {
  return (
    <>
      <div className="py-5 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Our Team Section */}
          <div>
            <h2 className="text-white text-4xl font-bold mb-12">Our Team</h2>

            {/* Team Grid */}
            <div className="grid grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="flex flex-col items-center" data-aos="fade-up">
                <div className="w-24 h-24 bg-gray-300 rounded-full mb-3 overflow-hidden">
                  <img src="/huy.png" className="w-full h-full object-cover" />
                </div>
                <p className="text-white font-semibold text-sm">Nguyen Quang Huy</p>
                <p className="text-white text-xs mb-1">523h0140@student.tdtu.edu.vn</p>
                <p className="text-white text-xs mb-2">Ton Duc Thang University</p>
                <div className="flex gap-2">
                  <a target="blank" href="https://www.facebook.com/nguyenquanghuy04082005" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaFacebookSquare /></span>
                  </a>
                  <a target="blank" href="https://github.com/VictorNguyenLPN" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaGithubSquare /></span>
                  </a>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="flex flex-col items-center" data-aos="fade-up" data-aos-delay="100">
                <div className="w-24 h-24 bg-gray-300 rounded-full mb-3 overflow-hidden">
                  <img src="/đăng.png" className="w-full h-full object-cover" />
                </div>
                <p className="text-white font-semibold text-sm">Nguyen Hai Dang</p>
                <p className="text-white text-xs mb-1">nhdang231@clc.fitus.edu.vn</p>
                <p className="text-white text-xs mb-2">University of Science</p>
                <div className="flex gap-2">
                  <a target="blank" href="https://www.facebook.com/dang.nguyen.531069" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaFacebookSquare /></span>
                  </a>
                  <a target="blank" href="https://github.com/DanielNguyen-05" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaGithubSquare /></span>
                  </a>
                </div>
              </div>

              {/* Team Member 3 */}
              <div className="flex flex-col items-center" data-aos="fade-up" data-aos-delay="200">
                <div className="w-24 h-24 bg-gray-300 rounded-full mb-3 overflow-hidden">
                  <img src="/khoa.png" className="w-full h-full object-cover" />
                </div>
                <p className="text-white font-semibold text-sm">Dang Dang Khoa</p>
                <p className="text-white text-xs mb-1">ddkhoa23@clc.fitus.edu.vn</p>
                <p className="text-white text-xs mb-2">University of Science</p>
                <div className="flex gap-2">
                  <a target="blank" href="https://www.facebook.com/dangw.khoa.2701" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaFacebookSquare /></span>
                  </a>
                  <a target="blank" href="https://github.com/khoavadienq" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaGithubSquare /></span>
                  </a>
                </div>
              </div>

              {/* Team Member 4 */}
              <div className="flex flex-col items-center" data-aos="fade-up" data-aos-delay="300">
                <div className="w-24 h-24 bg-gray-300 rounded-full mb-3 overflow-hidden">
                  <img src="/nguyên.png" className="w-full h-full object-cover" />
                </div>
                <p className="text-white font-semibold text-sm">Dang Truong Nguyen</p>
                <p className="text-white text-xs mb-1">dtnguyen23@clc.fitus.edu.vn</p>
                <p className="text-white text-xs mb-2">University of Science</p>
                <div className="flex gap-2">
                  <a target="blank" href="https://www.facebook.com/trngn.neee" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaFacebookSquare /></span>
                  </a>
                  <a target="blank" href="https://github.com/trngnneee" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaGithubSquare /></span>
                  </a>
                </div>
              </div>

              {/* Team Member 5 */}
              <div className="flex flex-col items-center" data-aos="fade-up" data-aos-delay="400">
                <div className="w-24 h-24 bg-gray-300 rounded-full mb-3 overflow-hidden">
                  <img src="/duy.png" className="w-full h-full object-cover" />
                </div>
                <p className="text-white font-semibold text-sm">Nguyen Tran Quoc Duy</p>
                <p className="text-white text-xs mb-1">ntqduy23@clc.fitus.edu.vn</p>
                <p className="text-white text-xs mb-2">University of Science</p>
                <div className="flex gap-2">
                  <a target="blank" href="https://www.facebook.com/duy.quoc.476407" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaFacebookSquare /></span>
                  </a>
                  <a target="blank" href="https://github.com/ntqduy" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaGithubSquare /></span>
                  </a>
                </div>
              </div>

              {/* Team Member 6 */}
              <div className="flex flex-col items-center" data-aos="fade-up" data-aos-delay="500">
                <div className="w-24 h-24 bg-gray-300 rounded-full mb-3 overflow-hidden">
                  <img src="/khải.png" className="w-full h-full object-cover" />
                </div>
                <p className="text-white font-semibold text-sm">Truong Ly Khai</p>
                <p className="text-white text-xs mb-1">tlkhai23@clc.fitus.edu.vn</p>
                <p className="text-white text-xs mb-2">University of Science</p>
                <div className="flex gap-2">
                  <a target="blank" href="https://www.facebook.com/pull.khai" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaFacebookSquare /></span>
                  </a>
                  <a target="blank" href="https://github.com/lykhai2512" className="w-7 h-7 bg-white rounded flex items-center justify-center hover:bg-gray-100 transition">
                    <span className="text-[#1F67F1] text-sm font-bold"><FaGithubSquare /></span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div>
            <h2 className="text-white text-4xl font-bold mb-8">
              Leave <span className="text-yellow-300">Your contact</span>
            </h2>

            <form className="space-y-6" data-aos="fade-left">
              {/* Name and Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-semibold text-lg mb-2 block">
                    Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    required
                  />
                </div>
                <div>
                  <label className="text-white font-semibold text-lg mb-2 block">
                    Phone<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    required
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-white font-semibold text-lg mb-2 block">
                  Subject<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-white font-semibold text-lg mb-2 block">
                  Content<span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-12 py-3 bg-yellow-300 text-black font-bold text-xl rounded-full hover:bg-yellow-400 transition shadow-lg"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}