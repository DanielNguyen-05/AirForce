import { Footer } from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import { Section1 } from "./Section1";
import { Section2 } from "./Section2";
import { Section3 } from "./Section3";
import { Section4 } from "./Section4";

export default function Home() {
  return (
    <>
      <Header/>
      <Section1/>
      <Section2/>
      <Section3/>
      <Section4/>
      <Footer/>
    </>
  );
}
