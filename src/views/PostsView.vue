<template>
  <div class="card mb-4">
    <div class="card-header fw-bold">
      Posts
    </div>

    <div class="card-body">
      <!-- Create / Edit -->
      <div v-if="canWrite" class="mb-4">
        <div class="mb-2">
          <input
            v-model="form.title"
            class="form-control"
            placeholder="Post title"
          />
        </div>

        <div class="mb-2">
          <textarea
            v-model="form.content"
            class="form-control"
            rows="3"
            placeholder="Post content"
          ></textarea>
        </div>

        <button class="btn btn-success" @click="submitPost">
          {{ editingId ? 'Update Post' : 'Create Post' }}
        </button>
      </div>

      <hr />

      <!-- List -->
      <div v-for="post in posts" :key="post.id" class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">{{ post.title }}</h5>
          <p class="card-text">{{ post.content }}</p>

          <div class="d-flex gap-2">
            <button
              v-if="isAdmin"
              class="btn btn-outline-primary btn-sm"
              @click="editPost(post)"
            >
              Edit
            </button>

            <button
              v-if="isAdmin"
              class="btn btn-outline-danger btn-sm"
              @click="deletePost(post.id)"
            >
              Delete
            </button>

            <button
              v-if="isModerator"
              class="btn btn-outline-warning btn-sm"
              @click="requestUpdate(post)"
            >
              Request Update
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PostService } from '@/services/post';
import { EventBus } from '@/services/eventBus';

export default {
  data() {
    return {
      posts: [],
      form: { title: '', content: '' },
      editingId: null
    };
  },

  computed: {
    roles() {
      return this.$keycloak.tokenParsed?.realm_access?.roles || [];
    },
    isAdmin() {
      return this.roles.includes('admin');
    },
    canWrite() {
      return this.roles.includes('admin') || this.roles.includes('editor');
    },
    isModerator() {
      return this.roles.includes('moderator');
    }
  },

  async mounted() {
    await this.fetchPosts();

    // Listen for updates from other components
    EventBus.on('posts-updated', this.fetchPosts);
  },

  beforeUnmount() {
    // Clean up listener
    EventBus.off('posts-updated', this.fetchPosts);
  },

  methods: {
    async fetchPosts() {
      this.posts = await PostService.getAll(this.$keycloak);
    },

    async submitPost() {
      const keycloak = this.$keycloak;
      if (this.editingId) {
        await PostService.update(keycloak, this.editingId, this.form);
      } else {
        await PostService.create(keycloak, this.form);
      }

      this.form = { title: '', content: '' };
      this.editingId = null;
      await this.fetchPosts();
    },

    editPost(post) {
      this.form = { title: post.title, content: post.content };
      this.editingId = post.id;
    },

    async deletePost(id) {
      if (!confirm('Are you sure?')) return;
      await PostService.delete(this.$keycloak, id);
      await this.fetchPosts();
    },

    async requestUpdate(post) {
      const title = prompt('New title', post.title);
      const content = prompt('New content', post.content);
      if (!title && !content) return alert('Nothing to update');

      await PostService.requestUpdate(this.$keycloak, post.id, { title, content });
      alert('Update request sent');
    }
  }
};
</script>
