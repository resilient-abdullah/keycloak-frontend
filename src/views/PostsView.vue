<template>
  <div>
    <h2>Posts</h2>

    <!-- Create / Edit -->
    <div v-if="canWrite">
      <input v-model="form.title" placeholder="Title" />
      <textarea v-model="form.content" placeholder="Content"></textarea>
      <button @click="submitPost">{{ editingId ? 'Update' : 'Create' }}</button>
    </div>

    <hr />

    <!-- List -->
    <div v-for="post in posts" :key="post.id" style="margin-bottom: 16px;">
      <h4>{{ post.title }}</h4>
      <p>{{ post.content }}</p>
      <button v-if="canWrite" @click="editPost(post)">Edit</button>
      <button v-if="isAdmin" @click="deletePost(post.id)">Delete</button>
      <button v-if="isModerator" @click="requestUpdate(post)">Request Update</button>
    </div>
  </div>
</template>

<script>
import { PostService } from '@/services/post';

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
