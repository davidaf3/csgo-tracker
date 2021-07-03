<template>
  <div id="rounds">
    <MoneyChart :rounds="rounds" />
    <RoundsChart
      :rounds="rounds"
      :max-kills-per-round="match.mode === 'casual' ? 10 : 5"
      :has-half-time="match.mode === 'competitive'"
      :half-time-round="match.mode === 'competitive' ? 15 : null"
    />
  </div>
</template>

<script>
  import RoundsChart from './RoundsChart.vue';
  import MoneyChart from './MoneyChart.vue';
  import { getRounds } from '../../api/api';

  export default {
    name: 'MatchDetails',
    components: {
      RoundsChart,
      MoneyChart,
    },
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
    watch: {
      match() {
        this.updateRounds();
      },
    },
    created() {
      this.updateRounds();
    },
    methods: {
      updateRounds() {
        getRounds(this.match.id).then(rounds => {
          this.rounds = rounds;
          this.maxKillsPerRound = this.match.mode === 'casual' ? 10 : 5;
        });
      },
    },
  };
</script>

<style>
  #rounds {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
  }
</style>
