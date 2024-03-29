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
      <MatchDetails
        v-if="selectedMatch"
        :match="selectedMatch"
        :force-match-end="forceMatchEndClick"
        :delete-match="deleteMatchClick"
      />
    </div>
  </div>
</template>

<script>
  import {
    getMatches,
    getMatch,
    forceMatchEnd,
    deleteMatch
  } from '../../api/api';
  import MatchPreview from './MatchPreview.vue';
  import MatchDetails from './MatchDetails.vue';

  const socket = new WebSocket('ws://localhost:8090');

  export default {
    name: 'MatchesView',
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
      this.updateMatches();
      socket.addEventListener('message', this.onWsMessage.bind(this));

      this.wsMessageCallbacks = new Map();
      this.wsMessageCallbacks.set('match started', this.retrieveAndAddMatch);
      this.wsMessageCallbacks.set('you died', this.retrieveAndUpdateMatch);
      this.wsMessageCallbacks.set('round ended', this.retrieveAndUpdateMatch);
    },
    methods: {
      updateMatches() {
        getMatches().then((matches) => {
          this.matches = matches;
        });
      },
      selectMatch(match) {
        this.selectedMatch = match;
      },
      onWsMessage(message) {
        const { gameEvent, matchId } = JSON.parse(message.data);
        const callback = this.wsMessageCallbacks.get(gameEvent);
        if (callback) callback(matchId);
      },
      async retrieveAndAddMatch(matchId) {
        const newMatch = await getMatch(matchId);
        if (newMatch) this.matches.unshift(newMatch);
      },
      async retrieveAndUpdateMatch(matchId) {
        const updatedMatch = await getMatch(matchId);
        const matchIndex = this.matches.findIndex(
          (match) => match.id === matchId
        );

        if (updatedMatch && matchIndex >= 0) {
          this.matches[matchIndex] = updatedMatch;

          // Check if the updated match is the currently selected match
          if (this.selectedMatch?.id === matchId) {
            this.selectedMatch = updatedMatch;
          }
        }
      },
      async forceMatchEndClick(id) {
        const match = await forceMatchEnd(id);
        if (!match) return;

        if (match.id === this.selectedMatch.id) {
          this.selectMatch(match);
        }
        const index = this.matches.findIndex(
          (matchInList) => matchInList.id === match.id
        );
        if (index >= 0) this.matches[index] = match;
      },
      async deleteMatchClick(id) {
        deleteMatch(id);

        const index = this.matches.findIndex((match) => match.id === id);
        if (index >= 0) this.matches.splice(index, 1);

        if (this.selectedMatch?.id === id) {
          this.selectedMatch = null;
        }
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
    height: 90vh;
    overflow-y: auto;
  }
</style>
