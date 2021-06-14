<template>
  <div class="match-preview" :class="{selected}" :style="backgroundStyle">
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
      selected: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        backgroundStyle: {
          backgroundImage: `url('img/maps/${this.match.map}.jpg')`,
          backgroundColor: '#cccccc',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        },
      };
    },
  };
</script>

<style scoped>
  p {
    font-weight: bold;
    color: black;
    text-align: center;
  }
  .match-preview:hover, .selected {
    box-shadow: inset 0 0 10px #000000;
  }
</style>
