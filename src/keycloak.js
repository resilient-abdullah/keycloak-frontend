import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',   // Keycloak server
  realm: 'myapp',                 // Realm name
  clientId: 'laravel-app'         // Public SPA client
});

export default keycloak;
