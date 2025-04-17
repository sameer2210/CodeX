import projectModel from "../models/project.model.js";

export async function createProject(projectName) {
  const project = await projectModel.create({ name: projectName });
  return project;
}

export async function getAllProjects() {
  const projects = await projectModel.find();
  return projects;
}
