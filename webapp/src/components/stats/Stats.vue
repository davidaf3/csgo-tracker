<template>
  <div v-if="stats" id="stats-container">
    <div id="main-stats-row">
      <div class="card bg-dark">
        <DonutChart
          identifier="kdChart"
          :data="[stats.kills, stats.deaths]"
          :labels="['Kills', 'Deaths']"
          :inner-title="`${roundNumber(stats.kdr)}`"
          inner-subtitle="KDR"
          :side-length="250"
          legend-positon="bottom"
        />
      </div>
      <div class="stats-column">
        <div class="info-box card bg-dark">
          <h2>{{ roundNumber(stats.hsRate * 100) }}%</h2>
          <span>Headshot%</span>
        </div>
        <div class="info-box card bg-dark">
          <h2>{{ roundNumber(stats.avgKillsPerMatch) }}</h2>
          <span>Avg. kills per match</span>
        </div>
        <div class="info-box card bg-dark">
          <h2>{{ roundNumber(stats.maxKillsPerMatch) }}</h2>
          <span>Max kills in a single match</span>
        </div>
      </div>
      <div class="card bg-dark">
        <DonutChart
          identifier="resultsChart"
          :data="[
            stats.matchesByResult.victory,
            stats.matchesByResult.tie,
            stats.matchesByResult.defeat,
          ]"
          :labels="['Victories', 'Ties', 'Defeats']"
          :inner-title="`${roundNumber(stats.winRate)}`"
          inner-subtitle="Win rate"
          :palette="palettes.results"
          :side-length="250"
          legend-positon="bottom"
        />
      </div>
      <div class="card bg-dark">
        <DonutChart
          identifier="mapsChart"
          :data="sortedMapValues"
          :labels="sortedMapNames"
          :inner-title="mostPlayedMap"
          inner-subtitle="Most played map"
          inner-title-size="1.8em"
          inner-subtitle-size="0.9em"
          :side-length="250"
        />
      </div>
      <div class="stats-column">
        <div class="info-box card bg-dark">
          <h2>{{ stats.totalMatches }}</h2>
          <span>Total matches</span>
        </div>
        <div class="info-box card bg-dark">
          <h2>{{ roundNumber(stats.totalDuration / 3600) }} h</h2>
          <span>Time played</span>
        </div>
      </div>
      <div class="stats-column">
        <div class="info-box card bg-dark">
          <h2>{{ roundNumber(stats.avgMatchDuration / 60) }} min</h2>
          <span>Avg. match duration</span>
        </div>
        <div class="info-box card bg-dark">
          <h2>{{ roundNumber(stats.avgMvps) }}</h2>
          <span>Avg. MVPs per match</span>
        </div>
        <div class="info-box card bg-dark">
          <h2>{{ roundNumber(stats.avgScore) }}</h2>
          <span>Avg. score</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import DonutChart from './DonutChart.vue';
  import { getAllStats } from '../../api/api';
  import palettes from '../../util/palette';

  export default {
    name: 'Stats',
    components: {
      DonutChart,
    },
    setup() {
      return {
        palettes,
      };
    },
    data() {
      return {
        stats: null,
      };
    },
    computed: {
      mostPlayedMap() {
        const maxTimesPlayed = Math.max(
          ...Object.values(this.stats.matchesByMap)
        );
        return Object.keys(this.stats.matchesByMap).filter(
          map => this.stats.matchesByMap[map] === maxTimesPlayed
        )[0];
      },
      sortedMapValues() {
        return Object.values(this.stats.matchesByMap).sort(
          (first, second) => second - first
        );
      },
      sortedMapNames() {
        return Object.keys(this.stats.matchesByMap).sort(
          (firstMap, secondMap) =>
            this.stats.matchesByMap[secondMap] -
            this.stats.matchesByMap[firstMap]
        );
      },
    },
    created() {
      this.updateStats();
    },
    methods: {
      updateStats() {
        getAllStats().then(stats => {
          this.stats = stats;
        });
      },
      roundNumber(number) {
        return Math.round((number + Number.EPSILON) * 100) / 100;
      },
    },
  };
</script>

<style scoped>
  #main-stats-row {
    margin-top: 1vh;
    margin-bottom: 1vh;
    display: flex;
    flex-direction: row;
  }

  .stats-column {
    flex: 1 1 auto;
    display: flex;
    flex-flow: column;
  }

  .info-box {
    flex: 1 1 auto;
    margin-bottom: 0.7em;
    justify-content: center;
    align-items: center;
    padding: 0 1em;
  }

  .info-box h2 {
    text-align: center;
  }

  .info-box span {
    font-size: 0.75em;
    text-align: center;
  }

  .info-box:last-child {
    margin-bottom: 0;
  }

  .card {
    margin-right: 0.35em;
    margin-left: 0.35em;
    align-items: center;
    justify-content: center;
  }
</style>
