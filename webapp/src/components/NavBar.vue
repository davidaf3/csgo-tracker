<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img src="/img/icon.svg" alt="csgo-tracker" width="55" />
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="navbarSupportedContent" class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/matches" class="nav-link"> Matches </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/stats" class="nav-link"> Stats </router-link>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a
              href="https://github.com/davidaf3/csgo-tracker"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt="GitHub"
                src="../assets/github-logo.png"
                width="25"
                height="25"
              />
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
  export default {
    name: 'NavBar',
  };
</script>

<style scoped>
  nav {
    height: 8%;
  }
  .navbar-brand {
    margin-left: 0.5em;
  }
  .router-link-active {
    color: #ffffff !important;
  }
</style>
