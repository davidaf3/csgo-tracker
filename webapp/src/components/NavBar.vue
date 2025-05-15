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
        <div class="navbar-nav" id="filter-controls">
          <select v-model="gameMode" @change="updateGameMode" class="form-select form-select-sm bg-dark text-white">
            <option value="">All Modes</option>
            <option value="competitive">Competitive</option>
            <option value="casual">Casual</option>
            <option value="deathmatch">Deathmatch</option>
            <option value="scrimcomp2v2">Wingman</option>
          </select>
        </div>
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
                src="/img/github-logo.png"
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

<script setup>
import { ref, watch } from 'vue';
import { selectedGameMode, setGameMode } from '../store/filters';

// Local ref bound to the global state
const gameMode = ref(selectedGameMode.value);

// Update the global state when local selection changes
function updateGameMode() {
  setGameMode(gameMode.value);
}

// Keep local state in sync with global state
watch(selectedGameMode, (newMode) => {
  gameMode.value = newMode;
});
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

  #filter-controls {
    width: 180px;
  }

  #filter-controls select {
    border-radius: 4px;
    border: 1px solid #6c757d;
    font-size: 0.9em;
  }
</style>
