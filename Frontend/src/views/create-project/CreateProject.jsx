import React, { useState } from "react";
import "./CreateProject.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const [projectName, setProjectName] = useState(null);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    axios
      .post("http://localhost:3000/projects/create", {
        projectName
      })
      .then(() => {
        navigate("/");
      });
  }

  return (
    <main className="create-project">
      <section className="create-project-section">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="projectName"
            placeholder="Project Name"
            required
            onChange={(e) => setProjectName(e.target.value)}
            value={projectName}
          />
          <input type="submit" />
        </form>
      </section>
    </main>
  );
};

export default CreateProject;
