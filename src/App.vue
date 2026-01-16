<template>
  <div>
    <h1>Keycloak Login Demo</h1>

    <!-- Login / Logout Buttons -->
    <button @click="login" v-if="!isAuthenticated">Login</button>
    <button @click="logout" v-if="isAuthenticated">Logout</button>

    <!-- Call Laravel API Button -->
    <div v-if="isAuthenticated">
      <button @click="getProfile">Get Profile</button>
    </div>

    <!-- Display User Info -->
    <div v-if="user">
      <h2>User Details</h2>
      <ul>
        <li><strong>Username:</strong> {{ user.preferred_username }}</li>
        <li><strong>Name:</strong> {{ user.name }}</li>
        <li><strong>Email:</strong> {{ user.email }}</li>
        <li><strong>Given Name:</strong> {{ user.given_name }}</li>
        <li><strong>Family Name:</strong> {{ user.family_name }}</li>
        <li><strong>Email Verified:</strong> {{ user.email_verified }}</li>
        <li><strong>Roles:</strong> {{ user.realm_access.roles.join(', ') }}</li>
      </ul>
    </div>

    <!-- Show raw token for debugging -->
    <div v-if="token">
      <h3>Access Token:</h3>
      <textarea rows="5" cols="60">{{ token }}</textarea>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: null,
      token: null,
      isAuthenticated: false
    };
  },
  mounted() {
    if (this.$keycloak.authenticated) {
      this.isAuthenticated = true;
      this.token = this.$keycloak.token;
    }
  },
  methods: {
    login() {
      this.$keycloak.login();
    },
    logout() {
      this.$keycloak.logout({ redirectUri: window.location.origin });
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;
    },
    async getProfile() {
      try {
        const res = await fetch('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${this.$keycloak.token}`
          }
        });
        const data = await res.json();
        this.user = data; // set the response to user
      } catch (err) {
        console.error('API error:', err);
        alert('Failed to fetch profile');
      }
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
textarea {
  margin-top: 10px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 4px;
}
</style>
