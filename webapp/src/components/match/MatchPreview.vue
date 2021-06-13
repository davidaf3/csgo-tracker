<template>
  <div class="match-preview">
    <p>{{ match.map }}</p>
    <p>{{ match.roundsWon }} - {{ match.roundsLost }}</p>
  </div>
</template>

<script>
  export default {
    name: 'MatchPreview',
    props: {
      match: {
        type: Object,
        required: true,
      },
    },
  };
</script>

<style scoped>
  p {
    text-align: center;
  }
  .match-preview {
    border: solid 0.1em;
    margin-bottom: 0.1em;
  }
</style>
