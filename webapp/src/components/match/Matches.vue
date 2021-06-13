<template>
  <h1>Matches</h1>
  <div id="matches-panel">
    <div id="matches-list">
      <MatchPreview
        v-for="match in matches"
        :key="match.id"
        :match="match"
        @click="selectMatch(match)"
      />
    </div>
    <div id="match-details">
      <MatchDetails v-if="selectedMatch" :match="selectedMatch" />
    </div>
  </div>
</template>

<script>
  import { getMatches } from '../../api/api';
  import MatchPreview from './MatchPreview.vue';
  import MatchDetails from './MatchDetails.vue';

  export default {
    name: 'Matches',
    components: {
      MatchPreview,
      MatchDetails,
    },
    data() {
      return {
        matches: [],
        selectedMatch: null,
      };
    },
    created() {
      getMatches().then(matches => {
        this.matches = matches;
      });
    },
    methods: {
      selectMatch(match) {
        this.selectedMatch = match;
      },
    },
  };
</script>

<style>
  #matches-panel {
    display: flex;
  }
  #matches-list {
    width: 30%;
  }
  #match-details {
    flex: 1;
  }
</style>
