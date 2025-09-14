// import projectModel from "../models/project.model.js";

// export async function createProject(projectName) {
//   const project = await projectModel.create({ name: projectName });
//   return project;
// }

// export async function getAllProjects() {
//   const projects = await projectModel.find();
//   return projects;
// }

import projectModel from '../models/project.model.js';
import aiService from './ai.service.js';

export async function createProject(projectData) {
  // {name, teamName}
  const project = await projectModel.create(projectData);
  return project;
}

export async function getAllProjects(teamName) {
  const projects = await projectModel.find({ teamName });
  return projects;
}

export async function getProjectById(id, teamName) {
  const project = await projectModel.findOne({ _id: id, teamName });
  return project;
}

export async function updateProject(id, updateData, teamName) {
  const project = await projectModel.findOneAndUpdate({ _id: id, teamName }, updateData, {
    new: true,
  });
  return project;
}

export async function reviewProject(id, teamName) {
  const project = await getProjectById(id, teamName);
  if (!project) throw new Error('Project not found');
  const review = await aiService.reviewCode(project.code);
  project.review = review;
  await project.save();
  return { project, review };
}