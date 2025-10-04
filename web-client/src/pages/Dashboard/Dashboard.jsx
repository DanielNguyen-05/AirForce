import { useLocation } from "react-router-dom";
import { Footer } from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import { Section } from "./Section";

export default function Dashboard({ props }){
  const location = useLocation();
  const { data } = location.state || {};
  
  return (
    <>
      <Header/>
      <Section
        data={data}
      />
      <Footer/>
    </>
  );
}