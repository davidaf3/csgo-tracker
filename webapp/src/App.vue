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

  .popover {
    background: rgba(0, 0, 0, 0.8);
  }

  .popover-body {
    font-size: 0.8em;
    color: white;
    display: flex;
    align-items: center;
  }

  .popover-body svg {
    margin-right: 0.5em;
  }

  .bs-popover-start > .popover-arrow::after {
    border-left-color: rgba(0, 0, 0, 0.7);
  }

  .bs-popover-top > .popover-arrow::after {
    border-top-color: rgba(0, 0, 0, 0.7);
  }

  .bs-popover-end > .popover-arrow::after {
    border-right-color: rgba(0, 0, 0, 0.7);
  }

  .bs-popover-bottom > .popover-arrow::after {
    border-bottom-color: rgba(0, 0, 0, 0.7);
  }
</style>
