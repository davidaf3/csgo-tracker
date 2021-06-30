<template>
  <div id="rounds">
    <svg
      :height="20 * maxKillsPerRound + 20"
      :width="rounds.length * 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="deathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(191,16,4);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(40,44,52);stop-opacity:1" />
        </linearGradient>
      </defs>
      <g
        v-for="round in rounds"
        :key="round.n"
        :transform="`scale(1,-1) translate(0,-${20 * maxKillsPerRound})`"
      >
        <rect
          :x="20 * (round.n - 1)"
          y="20"
          width="20"
          :fill="round.team === 'CT' ? 'rgb(93,121,174)' : 'rgb(222,155,53)'"
        >
          <animate
            v-if="round.kills > 0"
            begin="indefinite"
            attributeName="height"
            from="0"
            :to="20 * round.kills"
            dur="0.5s"
            fill="freeze"
          />
        </rect>
        <rect
          v-if="round.died"
          :x="20 * (round.n - 1)"
          y="-20"
          width="20"
          fill="url(#deathGrad)"
          transform="scale(1,-1)"
        >
          <animate
            begin="indefinite"
            attributeName="height"
            from="0"
            :to="20"
            dur="0.5s"
            fill="freeze"
          />
        </rect>
      </g>
    </svg>
  </div>
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
        maxKillsPerRound: this.match.mode === 'casual' ? 10 : 5,
        matchChanged: true,
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
    updated() {
      if (this.matchChanged) this.platyAnimation();
    },
    methods: {
      updateRounds() {
        getRounds(this.match.id).then(rounds => {
          this.rounds = rounds;
          this.matchChanged = true;
        });
      },
      platyAnimation() {
        document.querySelectorAll('rect').forEach(element => {
          const elementStyle = element.style;
          elementStyle.visibility = 'hidden';
        });
        document.querySelectorAll('animate').forEach((element, i) => {
          setTimeout(() => {
            const parentRect = element.parentElement;
            if (parentRect) parentRect.style.visibility = 'visible';
            element.beginElement();
          }, i * 50);
        });
        this.matchChanged = false;
      },
    },
  };
</script>

<style scoped>
  #rounds {
    display: flex;
    justify-content: center;
  }
  rect {
    stroke: rgb(40,44,52);
  }
</style>
