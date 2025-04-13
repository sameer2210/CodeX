import projectModel from "../models/project.model";

export async function createProject(projectName) {
  const project = await projectModel.create({ name: projectName });
  return project;
}
