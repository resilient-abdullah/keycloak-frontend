<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-dark bg-dark mb-4">
      <div class="container-fluid">
        <span class="navbar-brand">
          Keycloak RBAC Demo
        </span>

        <button
          v-if="isAuthenticated"
          class="btn btn-outline-light btn-sm"
          @click="logout"
        >
          Logout
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container">
      <!-- Login -->
      <div v-if="!isAuthenticated" class="text-center mt-5">
        <div class="card p-4 shadow-sm">
          <h3 class="mb-3">Login Required</h3>
          <button class="btn btn-primary btn-lg" @click="login">
            Login with Keycloak
          </button>
        </div>
      </div>

      <!-- Authenticated -->
      <div v-else>
        <!-- User Info -->
        <div class="card mb-4 shadow-sm">
          <div class="card-header fw-bold">User Details</div>
          <div class="card-body">
            <p><strong>Username:</strong> {{ user.preferred_username }}</p>
            <p><strong>Name:</strong> {{ user.name }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>

            <div>
              <strong>Roles:</strong>
              <span
                v-for="r in roles"
                :key="r"
                class="badge bg-secondary me-1"
              >
                {{ r }}
              </span>
            </div>
          </div>
        </div>

        <!-- Role Based Views -->
        <PostsView v-if="canReadPosts" :keycloak="$keycloak" />
        <PostUpdateRequestsView
          v-if="canAccessRequests"
          :keycloak="$keycloak"
        />
      </div>
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
    isUser() {
      return this.roles.includes('user');
    },
    // All roles can see posts
    canReadPosts() {
      return this.isAdmin || this.isEditor || this.isModerator || this.isUser;
    },
    // Only Admin/Editor can create/edit
    canWritePosts() {
      return this.isAdmin || this.isEditor;
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
