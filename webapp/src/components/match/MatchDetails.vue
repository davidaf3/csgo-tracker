<template>
  <div id="details">
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
        <span>{{
          match.mode.charAt(0).toUpperCase() + match.mode.slice(1)
        }}</span>
      </div>
      <div class="matchInfoBox">
        <h5>Date</h5>
        <span>
          {{
            matchDate.toLocaleDateString('en', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          }},
          {{
            matchDate
              .toLocaleTimeString()
              .slice(0, matchDate.toLocaleTimeString().lastIndexOf(':'))
          }}
        </span>
      </div>
      <div class="matchInfoBox">
        <h5>Duration</h5>
        <span>{{ Math.round(match.duration / 60) }} min</span>
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
            <td>
              {{
                Math.round(
                  (match.kills / match.deaths + Number.EPSILON) * 100
                ) / 100
              }}
            </td>
            <td>
              {{
                Math.round(
                  ((match.killshs / match.kills) * 100 + Number.EPSILON) * 100
                ) / 100
              }}%
            </td>
            <td>{{ match.mvps }}</td>
            <td>{{ match.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div id="rounds">
      <h5>Rounds</h5>
      <MoneyChart :rounds="rounds" />
      <RoundsChart
        :rounds="rounds"
        :max-kills-per-round="match.mode === 'casual' ? 10 : 5"
        :has-half-time="match.mode === 'competitive'"
        :half-time-round="match.mode === 'competitive' ? 15 : null"
        :select-round="setSelectedRound"
      />
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
          <li class="list-group-item">
            Win type: {{ parseWinType(rounds[selectedRound - 1].winType) }}
          </li>
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
    },
    data() {
      return {
        rounds: [],
        selectedRound: null,
        player: null,
        matchDate: new Date(this.match.date),
      };
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
        getRounds(this.match.id).then(rounds => {
          this.rounds = rounds;
          this.selectedRound = null;
        });
      },
      updatePlayer() {
        getPlayerInfo(this.match.playerId).then(player => {
          this.player = player;
        });
      },
      setSelectedRound(nRound) {
        this.selectedRound = nRound;
      },
      parseWinType(winType) {
        const parsedWinType = winType.split('_')[2];
        return parsedWinType.charAt(0).toUpperCase() + parsedWinType.slice(1);
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
    margin-top: 1em;
    display: flex;
    flex-flow: column;
    justify-content: left;
    align-items: left;
  }
  #matchInfo {
    align-self: flex-start;
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: center;
    margin: 1em 0 0 3em;
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
  #selectedRoundInfo ul{
    margin-right: 2em;
  }
  #selectedRoundInfo ul:last-child{
    margin-right: 0;
  }
  .list-group-item {
    color: white;
    background-color: #282c34;
    border-color: rgba(255, 255, 255, 0.250);
  }
</style>
