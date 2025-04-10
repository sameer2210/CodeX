import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const Home = () => {
  const navigate = useNavigate();
  return (
    <main className="home">
      <section className="home-section">
        <button onClick={ () => {
          navigate('/create-project')
        }}>new project</button>
      </section>
    </main>
  );
};

export default Home;
