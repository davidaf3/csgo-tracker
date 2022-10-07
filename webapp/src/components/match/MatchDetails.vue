<template>
  <div id="details">
    <div id="matchHeader">
      <div id="matchInfo">
        <img
          :src="`img/map-icons/map_icon_${match.map}.svg`"
          :alt="match.map"
          height="50"
        />
        <div class="matchInfoBox">
          <h5>Map</h5>
          <span>{{ match.map }}</span>
        </div>
        <div class="matchInfoBox">
          <h5>Mode</h5>
          <span>{{ capitalizedGameMode }}</span>
        </div>
        <div class="matchInfoBox">
          <h5>Date</h5>
          <span>{{ formattedDate }}</span>
        </div>
        <div class="matchInfoBox">
          <h5>Duration</h5>
          <span>{{ Math.round(match.duration / 60) }} min</span>
        </div>
      </div>
      <div id="matchButtons">
        <button
          type="button"
          class="btn btn-danger"
          @click="deleteMatch(match.id)"
        >
          Delete
        </button>
        <button
          v-if="!match.over"
          type="button"
          class="btn btn-primary"
          @click="forceMatchEnd(match.id)"
        >
          Force end
        </button>
      </div>
    </div>
    <h1>{{ match.roundsWon }} - {{ match.roundsLost }}</h1>
    <div id="playerStats">
      <table class="table table-dark">
        <thead>
          <tr>
            <td v-if="player"></td>
            <td>Kills</td>
            <td>Assists</td>
            <td>Deaths</td>
            <td>K/D</td>
            <td>Headshot%</td>
            <td>MVPs</td>
            <td>Score</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-if="player">
              <a :href="player.profileurl">
                <img class="avatar" :src="player.avatar" alt="avatar" />{{
                  player.personaname
                }}</a
              >
            </td>
            <td>{{ match.kills }}</td>
            <td>{{ match.assists }}</td>
            <td>{{ match.deaths }}</td>
            <td>{{ kdr }}</td>
            <td>{{ hsPerCent }}%</td>
            <td>{{ match.mvps }}</td>
            <td>{{ match.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="rounds.length > 0" id="rounds">
      <h5>Rounds</h5>
      <MoneyChart :rounds="rounds" />
      <RoundsChart :rounds="rounds" :select-round="setSelectedRound" />
    </div>
    <div v-if="selectedRound" id="selectedRound">
      <h5>Round {{ selectedRound }}</h5>
      <div id="selectedRoundInfo">
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            Team: {{ rounds[selectedRound - 1].team }}
          </li>
          <li class="list-group-item">
            Winner: {{ rounds[selectedRound - 1].winner }}
          </li>
          <li class="list-group-item">Win type: {{ winType }}</li>
          <li class="list-group-item">
            Duration: {{ Math.round(rounds[selectedRound - 1].duration) }} s
          </li>
        </ul>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            Kills: {{ rounds[selectedRound - 1].kills }}
          </li>
          <li class="list-group-item">
            Headshots: {{ rounds[selectedRound - 1].killshs }}
          </li>
          <li class="list-group-item">
            Assists: {{ rounds[selectedRound - 1].assists }}
          </li>
          <li class="list-group-item">
            Died: {{ rounds[selectedRound - 1].died ? 'Yes' : 'No' }}
          </li>
          <li class="list-group-item">
            Score: {{ rounds[selectedRound - 1].score }}
          </li>
          <li class="list-group-item">
            MVP: {{ rounds[selectedRound - 1].mvp ? 'Yes' : 'No' }}
          </li>
        </ul>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            Initial money: {{ rounds[selectedRound - 1].initMoney }}
          </li>
          <li class="list-group-item">
            Equipment value: {{ rounds[selectedRound - 1].equipValue }}
          </li>
          <li class="list-group-item">
            Initial armor: {{ rounds[selectedRound - 1].initArmor }}
          </li>
          <li class="list-group-item">
            Helmet: {{ rounds[selectedRound - 1].helmet ? 'Yes' : 'No' }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import RoundsChart from './RoundsChart.vue';
  import MoneyChart from './MoneyChart.vue';
  import { getRounds, getPlayerInfo } from '../../api/api';

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
      forceMatchEnd: {
        type: Function,
        required: true,
      },
      deleteMatch: {
        type: Function,
        required: true,
      },
    },
    data() {
      return {
        rounds: [],
        selectedRound: null,
        player: null,
        matchDate: new Date(this.match.date),
      };
    },
    computed: {
      capitalizedGameMode() {
        return (
          this.match.mode.charAt(0).toUpperCase() + this.match.mode.slice(1)
        );
      },
      formattedDate() {
        const dateString = this.matchDate.toLocaleDateString('en', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const timeString = this.matchDate
          .toLocaleTimeString()
          .slice(0, this.matchDate.toLocaleTimeString().lastIndexOf(':'));

        return `${dateString}, ${timeString}`;
      },
      kdr() {
        return (
          Math.round(
            (this.match.kills /
              (this.match.deaths > 0 ? this.match.deaths : 1) +
              Number.EPSILON) *
              100
          ) / 100
        );
      },
      hsPerCent() {
        return this.match.kills > 0
          ? Math.round(
              ((this.match.killshs / this.match.kills) * 100 + Number.EPSILON) *
                100
            ) / 100
          : 0;
      },
      winType() {
        const parsedWinType =
          this.rounds[this.selectedRound - 1].winType.split('_')[2];
        return parsedWinType.charAt(0).toUpperCase() + parsedWinType.slice(1);
      },
    },
    watch: {
      match() {
        this.updateRounds();
        this.updatePlayer();
        this.matchDate = new Date(this.match.date);
      },
    },
    created() {
      this.updateRounds();
      this.updatePlayer();
    },
    methods: {
      updateRounds() {
        getRounds(this.match.id).then((rounds) => {
          this.rounds = rounds;
          this.selectedRound = null;
        });
      },
      updatePlayer() {
        getPlayerInfo(this.match.playerId).then((player) => {
          this.player = player;
        });
      },
      setSelectedRound(nRound) {
        this.selectedRound = nRound;
      },
    },
  };
</script>

<style scoped>
  h1 {
    margin: 0.75em 0;
    font-size: 50px;
  }
  #details {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
  }
  #rounds {
    margin: 1em 0 0 7em;
    display: flex;
    flex-flow: column;
    justify-content: left;
    align-items: left;
  }
  #matchHeader {
    display: flex;
    flex-flow: row;
    align-items: center;
    padding: 1em 3em;
    width: 100%;
  }
  #matchInfo {
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: center;
  }
  #matchButtons {
    margin-left: auto;
    display: flex;
    flex-flow: column;
  }
  #matchButtons button {
    margin-bottom: 0.5em;
  }
  #matchButtons button:last-of-type {
    margin-bottom: 0;
  }
  .matchInfoBox {
    margin-left: 2em;
  }
  a,
  a:visited {
    text-decoration: none;
    color: white;
  }
  a:hover {
    text-decoration: underline;
    color: white;
  }
  .avatar {
    margin-right: 0.5em;
  }
  #selectedRoundInfo {
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: flex-start;
    margin-bottom: 2em;
  }
  #selectedRoundInfo ul {
    margin-right: 2em;
  }
  #selectedRoundInfo ul:last-child {
    margin-right: 0;
  }
  .list-group-item {
    color: white;
    background-color: #282c34;
    border-color: rgba(255, 255, 255, 0.25);
  }
</style>
