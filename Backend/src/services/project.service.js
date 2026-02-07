import projectModel from '../models/project.model.js';
import aiService from './ai.service.js';
import vm from 'node:vm';

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

export async function executeLocalJavaScript(code) {
  const logs = [];

  const formatArg = arg => {
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
    if (arg === null || arg === undefined) return String(arg);
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  };

  const pushLog = (level, args) => {
    const message = args.map(formatArg).join(' ');
    logs.push(level ? `[${level}] ${message}` : message);
  };

  const sandbox = {
    console: {
      log: (...args) => pushLog('', args),
      info: (...args) => pushLog('INFO', args),
      warn: (...args) => pushLog('WARN', args),
      error: (...args) => pushLog('ERROR', args),
    },
  };

  const context = vm.createContext(sandbox);

  try {
    const script = new vm.Script(code);

    script.runInContext(context, {
      timeout: 1000, // 1 second max
    });

    return {
      stdout: logs.join('\n'),
      stderr: null,
    };
  } catch (error) {
    return {
      stdout: null,
      stderr: error.message,
    };
  }
}
