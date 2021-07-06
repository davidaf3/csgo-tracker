<template>
  <div id="matches-panel">
    <div id="matches-list">
      <MatchPreview
        v-for="match in matches"
        :key="match.id"
        :match="match"
        :selected="selectedMatch?.id === match.id"
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
    margin-top: 1vh;
    margin-bottom: 1vh;
    display: flex;
  }
  #matches-list {
    height: 90vh;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding-right: 0.5em;
  }
  #match-details {
    flex: 1;
  }
</style>
