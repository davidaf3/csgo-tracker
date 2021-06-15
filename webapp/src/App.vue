<template>
  <div id="app" class="conainer-fluid">
    <Nav />
    <div id="content" class="container-fluid">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import Nav from './components/Nav.vue';

  export default {
    name: 'App',
    components: {
      Nav,
    },
  };
</script>

<style>
  html,
  body {
    height: 100%;
    margin: 0;
  }
  #app {
    display: flex;
    flex-flow: column;
    height: 100%;
  }
  #content {
    color: white;
    flex: 1 1 auto;
    background: #282c34;
  }
</style>
