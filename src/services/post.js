import { apiFetch } from './api';

export const PostService = {
  getAll(keycloak) {
    return apiFetch(keycloak, '/posts');
  },

  create(keycloak, data) {
    return apiFetch(keycloak, '/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update(keycloak, id, data) {
    return apiFetch(keycloak, `/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete(keycloak, id) {
    return apiFetch(keycloak, `/posts/${id}`, {
      method: 'DELETE'
    });
  },

  requestUpdate(keycloak, postId, data) {
    return apiFetch(keycloak, `/posts/${postId}/update-request`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getUpdateRequests(keycloak) {
    return apiFetch(keycloak, '/update-requests');
  },

  approve(keycloak, id) {
    return apiFetch(keycloak, `/update-requests/${id}/approve`, {
      method: 'POST'
    });
  },

  reject(keycloak, id) {
    return apiFetch(keycloak, `/update-requests/${id}/reject`, {
      method: 'POST'
    });
  }
};
