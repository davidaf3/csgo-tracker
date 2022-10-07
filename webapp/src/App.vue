<template>
  <div id="app" class="conainer-fluid">
    <NavBar />
    <div id="content" class="container-fluid">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import NavBar from './components/NavBar.vue';

  export default {
    name: 'App',
    components: {
      NavBar,
    },
  };
</script>

<style>
  html,
  body {
    height: 100%;
    margin: 0;
    background: #282c34;
  }

  #app {
    display: flex;
    flex-flow: column;
    height: 100%;
  }

  #content {
    height: 92%;
    color: white;
    flex: 1 1 auto;
    overflow-y: auto;
  }

  ::-webkit-scrollbar {
    width: 7px;
  }

  ::-webkit-scrollbar-track {
    background: #282c34;
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }

  .popover-body {
    font-size: 0.8em;
    color: white;
    display: flex;
    align-items: center;
  }

  .custom-popover {
    --bs-popover-bg: rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }

  .popover-body svg {
    margin-right: 0.5em;
  }
  </style>
