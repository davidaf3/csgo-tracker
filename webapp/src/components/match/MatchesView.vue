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

<script setup>
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import {
    getMatches,
    getMatch,
    forceMatchEnd,
    deleteMatch
  } from '../../api/api';
  import MatchPreview from './MatchPreview.vue';
  import MatchDetails from './MatchDetails.vue';
  import { selectedGameMode } from '../../store/filters';

  const matches = ref([]);
  const selectedMatch = ref(null);

  async function fetchMatches() {
    const filter = selectedGameMode.value ? { mode: selectedGameMode.value } : {};
    matches.value = await getMatches(filter);
  }

  // Initial fetch on component load
  fetchMatches();

  // Watch for changes in the global filter
  watch(selectedGameMode, () => {
    fetchMatches();
  });

  function selectMatch(match) {
    selectedMatch.value = match;
  }

  async function retrieveAndAddMatch(matchId) {
    const newMatch = await getMatch(matchId);
    if (newMatch) matches.value.unshift(newMatch);
  }

  async function retrieveAndUpdateMatch(matchId) {
    const updatedMatch = await getMatch(matchId);
    const matchIndex = matches.value.findIndex((match) => match.id === matchId);

    if (updatedMatch && matchIndex >= 0) {
      matches.value[matchIndex] = updatedMatch;

      // Check if the updated match is the currently selected match
      if (selectedMatch.value?.id === matchId) {
        selectMatch(updatedMatch);
      }
    }
  }

  const wsMessageCallbacks = new Map([
    ['match started', retrieveAndAddMatch],
    ['you died', retrieveAndUpdateMatch],
    ['round ended', retrieveAndUpdateMatch],
  ]);

  let socket = null;

  onMounted(() => {
    socket = new WebSocket('ws://127.0.0.1:8090');
    socket.addEventListener('message', (message) => {
      const { gameEvent, matchId } = JSON.parse(message.data);
      const callback = wsMessageCallbacks.get(gameEvent);
      if (callback) callback(matchId);
    });
  });

  onUnmounted(() => {
    if (socket) {
      if (socket.readyState === WebSocket.CONNECTING) {
        const oldSocket = socket;
        oldSocket.addEventListener('open', () => oldSocket.close());
      } else socket.close();
    }
  });

  async function forceMatchEndClick(id) {
    const match = await forceMatchEnd(id);
    if (!match) return;

    if (match.id === selectedMatch.value?.id) {
      selectMatch(match);
    }
    const index = matches.value.findIndex(
      (matchInList) => matchInList.id === match.id
    );
    if (index >= 0) matches.value[index] = match;
  }

  async function deleteMatchClick(id) {
    deleteMatch(id);

    const index = matches.value.findIndex((match) => match.id === id);
    if (index >= 0) matches.value.splice(index, 1);

    if (selectedMatch.value?.id === id) {
      selectMatch(null);
    }
  }
</script>

<style>
  #matches-panel {
    margin-top: 1vh;
    margin-bottom: 1vh;
    display: flex;
  }
  #matches-list {
    height: 85vh;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding-right: 0.5em;
  }
  #match-details {
    flex: 1;
    height: 85vh;
    overflow-y: auto;
  }
</style>
