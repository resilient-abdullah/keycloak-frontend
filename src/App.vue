<template>
  <div>
    <h1>Keycloak Role-Based Demo</h1>

    <!-- Login / Logout -->
    <div v-if="!isAuthenticated">
      <button @click="login">Login</button>
    </div>

    <div v-else>
      <!-- <p><strong>Roles:</strong> {{ roles.join(', ') }}</p> -->
      <button @click="logout">Logout</button>

      <!-- Show user profile -->
      <div>
        <h2>User Details</h2>
        <ul>
          <li><strong>Username:</strong> {{ user.preferred_username }}</li>
          <li><strong>Name:</strong> {{ user.name }}</li>
          <li><strong>Email:</strong> {{ user.email }}</li>
          <li><strong>Roles:</strong> {{ roles.join(', ') }}</li>
        </ul>
      </div>

      <hr />

      <!-- Role-Based Views -->
      <PostsView v-if="canAccessPosts" :keycloak="$keycloak" />
      <PostUpdateRequestsView v-if="canAccessRequests" :keycloak="$keycloak" />
    </div>
  </div>
</template>

<script>
import PostsView from './views/PostsView.vue';
import PostUpdateRequestsView from './views/PostUpdateRequestsView.vue';

export default {
  components: { PostsView, PostUpdateRequestsView },

  data() {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  },

  computed: {
    roles() {
      return this.$keycloak.tokenParsed?.realm_access?.roles || [];
    },
    isAdmin() {
      return this.roles.includes('admin');
    },
    isEditor() {
      return this.roles.includes('editor');
    },
    isModerator() {
      return this.roles.includes('moderator');
    },
    canAccessPosts() {
      // Admin, Editor, Moderator can see posts
      return this.isAdmin || this.isEditor || this.isModerator;
    },
    canAccessRequests() {
      // Only Editor/Admin can see update requests
      return this.isAdmin || this.isEditor;
    }
  },

  mounted() {
    if (this.$keycloak.authenticated) {
      this.isAuthenticated = true;
      this.token = this.$keycloak.token;
      this.user = this.$keycloak.tokenParsed;
    }
  },

  methods: {
    login() {
      this.$keycloak.login();
    },

    logout() {
      this.$keycloak.logout({ redirectUri: window.location.origin }).then(() => {
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
      }).catch(err => console.error('Logout error', err));
    }
  }
};
</script>

<style>
button {
  margin: 5px;
  padding: 8px 12px;
  font-size: 16px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 4px;
}
</style>
