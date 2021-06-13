<template>
  <Nav />
  <div id="content" class="container-fluid">
    <router-view></router-view>
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
