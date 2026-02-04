<template>
  <div class="card">
    <div class="card-header fw-bold">
      Post Update Requests
    </div>

    <div class="card-body" v-if="isEditorOrAdmin">
      <div
        v-for="req in requests"
        :key="req.id"
        class="card mb-3"
      >
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted">
            Post ID: {{ req.post_id }}
          </h6>

          <p><strong>Requested by:</strong> {{ req.requested_by }}</p>
          <p><strong>Title:</strong> {{ req.title || '—' }}</p>
          <p><strong>Content:</strong> {{ req.content || '—' }}</p>

          <p>
            <strong>Status:</strong>
            <span
              class="badge"
              :class="{
                'bg-warning': req.status === 'pending',
                'bg-success': req.status === 'approved',
                'bg-danger': req.status === 'rejected'
              }"
            >
              {{ req.status }}
            </span>
          </p>

          <div v-if="req.status === 'pending'" class="d-flex gap-2">
            <button
              class="btn btn-success btn-sm"
              @click="approve(req.id)"
            >
              Approve
            </button>
            <button
              class="btn btn-danger btn-sm"
              @click="reject(req.id)"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-danger m-3">
      You are not allowed to see update requests.
    </div>
  </div>
</template>

<script>
import { PostService } from '@/services/post';
import { EventBus } from '@/services/eventBus';

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

      // Emit event to notify other components
      EventBus.emit('posts-updated');
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
