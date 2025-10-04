export const Section2 = () => {
  const data = [
    {
      id: 1,
      title: "Better Health and Well-being",
      items: [
        "Reduces risk of respiratory and cardiovascular diseases",
        "Improves overall quality of life and life expectancy"
      ]
    },
    {
      id: 2,
      title: "Environmental Protection",
      items: [
        "Preserves ecosystems and biodiversity",
        "Helps reduce greenhouse effects and climate change"
      ]
    },
    {
      id: 3,
      title: "Economic Benefits",
      items: [
        "Lowers healthcare costs",
        "Boosts productivity, tourism, and agriculture"
      ]
    }
  ];

  return (
    <div className="pt-12 text-center">
      <h2 className="text-[64px] font-bold mb-10" data-aos="fade-up">Advantage of Clean Air</h2>

      <div className="flex justify-center gap-[76px] mx-[45px]">
        {data.map((col) => (
          <div key={col.id} className="flex flex-col items-center" data-aos="zoom-in" data-aos-delay="300">
            <div className="w-[100px] h-[100px] flex items-center justify-center rounded-full bg-yellow-300 border-2 border-black text-[25px] font-bold">
              {col.id}
            </div>

            <div className="mt-[10px] w-[346px] h-[450px] rounded-t-xl rounded-b-xl bg-gradient-to-b from-[#1F67F0] to-white p-6 flex flex-col gap-[50px]">
              <h3 className="text-white font-extrabold text-[35px]">{col.title}</h3>

              <div className="flex flex-col gap-2">
                {col.items.map((text, i) => (
                  <p key={i} className="text-white font-light">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
