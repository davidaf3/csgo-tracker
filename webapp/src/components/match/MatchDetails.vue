<template>
  <div id="details">
    <h1>{{ match.roundsWon }} - {{ match.roundsLost }}</h1>
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
      <MoneyChart :rounds="rounds" />
      <RoundsChart
        :rounds="rounds"
        :max-kills-per-round="match.mode === 'casual' ? 10 : 5"
        :has-half-time="match.mode === 'competitive'"
        :half-time-round="match.mode === 'competitive' ? 15 : null"
      />
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
        });
      },
      updatePlayer() {
        getPlayerInfo(this.match.playerId).then(player => {
          this.player = player;
        });
      },
    },
  };
</script>

<style>
  h1 {
    margin-bottom: 1em;
  }
  #details,
  #rounds {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
  }

  #matchInfo {
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: center;
    margin-bottom: 1em;
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
</style>
