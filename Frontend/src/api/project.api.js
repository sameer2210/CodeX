import api from './config';

/**
 * Auto-save project code to database
 * @param {string} projectId
 * @param {string} code
 */
export const saveProjectCode = (projectId, code) => {
  return api.put(`/projects/${projectId}`, { code });
};
