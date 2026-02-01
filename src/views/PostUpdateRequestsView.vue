<template>
  <div>
    <h2>Post Update Requests</h2>

    <div v-if="isEditorOrAdmin">
      <div v-for="req in requests" :key="req.id" style="border-bottom:1px solid #ccc; padding:8px 0;">
        <h4>Post ID: {{ req.post_id }}</h4>
        <p><strong>Requested by:</strong> {{ req.requested_by }}</p>
        <p><strong>Title:</strong> {{ req.title || '—' }}</p>
        <p><strong>Content:</strong> {{ req.content || '—' }}</p>
        <p><strong>Status:</strong> {{ req.status }}</p>

        <button @click="approve(req.id)" v-if="req.status === 'pending'">Approve</button>
        <button @click="reject(req.id)" v-if="req.status === 'pending'">Reject</button>
      </div>
    </div>

    <div v-else>
      <p>You are not allowed to see update requests.</p>
    </div>
  </div>
</template>

<script>
import { PostService } from '@/services/post';

export default {
  data() {
    return { requests: [] };
  },

  computed: {
    roles() {
      return this.$keycloak.tokenParsed?.realm_access?.roles || [];
    },
    isEditorOrAdmin() {
      return this.roles.includes('editor') || this.roles.includes('admin');
    }
  },

  async mounted() {
    if (this.isEditorOrAdmin) {
      await this.fetchRequests();
    }
  },

  methods: {
    async fetchRequests() {
      this.requests = await PostService.getUpdateRequests(this.$keycloak);
    },

    async approve(id) {
      if (!confirm('Approve this request?')) return;
      await PostService.approve(this.$keycloak, id);
      alert('Approved');
      await this.fetchRequests();
    },

    async reject(id) {
      if (!confirm('Reject this request?')) return;
      await PostService.reject(this.$keycloak, id);
      alert('Rejected');
      await this.fetchRequests();
    }
  }
};
</script>
