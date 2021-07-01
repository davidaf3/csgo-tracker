<template>
  <svg
    :height="20 * maxKillsPerRound + 40"
    :width="rounds.length * 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="deathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:rgb(191,16,4);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgb(40,44,52);stop-opacity:1" />
      </linearGradient>
    </defs>
    <g :transform="`scale(1,-1) translate(0,-${20 * maxKillsPerRound + 40})`">
      <g v-for="round in rounds" :key="round.n">
        <rect
          :x="
            20 * (round.n - 1) +
              (hasHalfTime && round.n > halfTimeRound ? 3 : 0)
          "
          y="40"
          width="20"
          :fill="round.team === 'CT' ? 'rgb(93,121,174)' : 'rgb(222,155,53)'"
        >
          <animate
            v-if="round.kills > 0"
            begin="indefinite"
            attributeName="height"
            from="0"
            :to="20 * round.kills"
            dur="0.3s"
            fill="freeze"
          />
        </rect>
        <rect
          v-if="round.died"
          :x="
            20 * (round.n - 1) +
              (hasHalfTime && round.n > halfTimeRound ? 3 : 0)
          "
          y="-40"
          width="20"
          fill="url(#deathGrad)"
          transform="scale(1,-1)"
        >
          <animate
            begin="indefinite"
            attributeName="height"
            from="0"
            :to="20"
            dur="0.3s"
            fill="freeze"
          />
        </rect>
        <g v-if="hasHalfTime && round.n === halfTimeRound">
          <line
            :x1="20 * round.n + 1"
            y1="20"
            :x2="20 * round.n + 1"
            :y2="20 * maxKillsPerRound + 20"
          >
            <animate
              begin="indefinite"
              attributeName="y2"
              from="20"
              :to="20 * maxKillsPerRound + 40"
              dur="0.3s"
              fill="freeze"
            />
          </line>
          <text
            text-anchor="middle"
            :x="20 * round.n + 1"
            y="0"
            transform="scale(1,-1)"
          >
            {{ halfTimeRound }}
          </text>
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
  export default {
    name: 'RoundsChart',
    props: {
      rounds: {
        type: Array,
        required: true,
      },
      maxKillsPerRound: {
        type: Number,
        required: true,
      },
      hasHalfTime: {
        type: Boolean,
        required: true,
      },
      halfTimeRound: {
        type: Number,
        required: false,
        default: 0,
      },
    },
    updated() {
      this.platyAnimation();
    },
    methods: {
      platyAnimation() {
        document.querySelectorAll('rect, line, text').forEach(element => {
          const elementStyle = element.style;
          elementStyle.visibility = 'hidden';
        });
        document.querySelectorAll('animate').forEach((element, i) => {
          setTimeout(() => {
            const parent = element.parentElement;
            if (parent) parent.style.visibility = 'visible';
            if (parent?.tagName === 'line' && parent.nextSibling) {
              parent.nextSibling.style.visibility = 'visible';
            }
            element.beginElement();
          }, i * 50);
        });
        this.matchChanged = false;
      },
    },
  };
</script>

<style scoped>
  rect {
    stroke: rgb(40, 44, 52);
  }
  line {
    stroke-width: 1.5;
    stroke: white;
  }
  text {
    fill: white;
  }
</style>
