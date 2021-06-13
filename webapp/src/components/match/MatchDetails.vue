<template>
  <ul>
    <li v-for="round in rounds" :key="round.n">
      {{ round.winType }}
    </li>
  </ul>
</template>

<script>
  import { getRounds } from '../../api/api';

  export default {
    name: 'MatchDetails',
    props: {
      match: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        rounds: [],
      };
    },
    created() {
      this.updateRounds();
    },
    updated() {
      this.updateRounds();
    },
    methods: {
      updateRounds() {
        getRounds(this.match.id).then(rounds => {
          this.rounds = rounds;
        });
      },
    },
  };
</script>
