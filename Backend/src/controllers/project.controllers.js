import { createProject } from "../services/project.service";

export async function createProjectController(req, res) {
  const { projectName } = req.body;

  const newProject = await createProject(projectName);

  return res.status(201).json({
    status: "success",
    data: newProject
  });
}
