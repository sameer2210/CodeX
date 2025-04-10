import React from "react";
import "./CreateProject.css"

const CreateProject = () => {
  return (
    <main className="create-project">
      <section className="create-project-section">
        <form action="">
          <input
            type="text"
            name="projectName"
            placeholder="Project Name"
            required
          />
          <input type="submit" />
        </form>
      </section>
    </main>
  );
};

export default CreateProject;
