import { Link } from "react-router-dom"

export const Section4 = () => {
  const news = [
    {
      id: 1,
      title: "The Benefits of Breathing in Fresh Air",
      image: "/pic1.jpg",
      link: "https://todayshomeowner.com/hvac/guides/benefits-breathing-fresh-air/"
    },
    {
      id: 2,
      title: "How Fresh Air Helps Your Mind and Body: The Science and Simple Truth",
      image: "/pic2.png",
      Link: "https://www.legionfitness.com/blog/how-fresh-air-helps-your-mind-and-body-the-science-and-simple-truth/"
    },
    {
      id: 3,
      title: "A Satellite Assist in the Fight Against Air Pollution",
      image: "/pic3.jpg"
    },
    {
      id: 4,
      title: "A Satellite Assist in the Fight Against Air Pollution",
      image: "/pic3.jpg",
      date: "17/08/2023",
      description:
        "Hazy skies. Low-hanging clouds. Air that feels uncomfortable, and is often risky to breathe...",
      link: "https://nonprofitquarterly.org/a-satellite-assist-in-the-fight-against-air-pollution/?msclkid=51772ab4ec831344eb89425455d9885e&utm_source=bing&utm_medium=cpc&utm_campaign=NPQ%20-%20Climate%20Justice&utm_term=solutions%20for%20air%20pollution&utm_content=Air%20Pollution"
    },
    {
      id: 5,
      title: "Air pollution is on the rise – but not everywhere, says UN weather agency",
      image: "/pic4.jpg",
      link: "https://news.un.org/en/story/2025/09/1165779"
    },
    {
      id: 6,
      title: "PM2.5 hitches a lift on red blood cells to spread through the body",
      image: "/pic5.jpg",
      link: "https://airqualitynews.com/health/pm2-5-hitches-a-lift-on-red-blood-cells-to-spread-through-the-body/"
    }
  ];

  return (
    <section className="py-12 px-[100px]">
      <h2 className="text-center text-[48px] font-bold text-blue-600 mb-10" data-aos="fade-up">
        News
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6 md:col-span-1" data-aos="fade-right" data-aos-delay="150">
          {news.slice(0, 2).map((item) => (
            <Link
              to={item.link}
              target="blank"
              key={item.id}
              className="relative rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-[200px] object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm font-semibold">{item.title}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Middle big card */}
        <Link target="blank" to={news[3].link} className="md:col-span-2" data-aos="fade-up" data-aos-delay="150">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src={news[3].image}
              alt={news[3].title}
              className="w-full h-[300px] object-cover"
            />
            <div className="p-5">
              <p className="text-blue-500 text-sm font-semibold mb-2">
                {news[3].date}
              </p>
              <h3 className="text-lg font-bold mb-2">{news[3].title}</h3>
              <p className="text-gray-600 text-[12px]">{news[3].description}</p>
            </div>
          </div>
        </Link>

        {/* Right column */}
        <div className="flex flex-col gap-6 md:col-span-1" data-aos="fade-left" data-aos-delay="150">
          {news.slice(4).map((item) => (
            <Link
              to={item.link}
              target="blank"
              key={item.id}
              className="relative rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-[200px] object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm font-semibold">{item.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
