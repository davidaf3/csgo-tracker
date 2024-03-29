<template>
  <svg
    id="roundsChart"
    :height="20 * maxKillsPerRound + 40"
    :width="rounds.length * 20 + 2"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="deathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:rgb(191,16,4);stop-opacity:0.5" />
        <stop offset="100%" style="stop-color:rgb(40,44,52);stop-opacity:1" />
      </linearGradient>
      <linearGradient id="TGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:rgb(222,155,53);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgb(40,44,52);stop-opacity:1" />
      </linearGradient>
      <linearGradient id="CTGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:rgb(93,121,174);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgb(40,44,52);stop-opacity:1" />
      </linearGradient>
    </defs>
    <g :transform="`scale(1,-1) translate(0,-${20 * maxKillsPerRound + 40})`">
      <g
        v-for="round in rounds"
        :key="round.id"
        :class="roundsToAnimate.includes(round.n) ? 'animated' : null"
        @click="selectRound(round.n)"
        @keypress="selectRound(round.n)"
      >
        <rect
          v-if="round.winner === round.team"
          class="round-rect"
          :x="getRectX(round.n)"
          y="40"
          width="20"
          :fill="`url(#${round.team}Grad)`"
        >
          <animate
            begin="indefinite"
            attributeName="height"
            from="0"
            :to="20 * maxKillsPerRound"
            dur="0.3s"
            fill="freeze"
            :onend="() => showKillsAndDeath(round.n)"
          />
        </rect>
        <rect
          v-if="round.winner !== round.team"
          class="round-rect"
          :x="getRectX(round.n)"
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
            :onend="() => showKillsAndDeath(round.n)"
          />
        </rect>
        <g :id="`killsAndDeath${round.n}`">
          <image
            v-for="kill in roundToKills(round)"
            :key="kill.n"
            :x="getImgX(round.n)"
            :y="-(kill.n * 20 + 57)"
            transform="scale(1,-1)"
            width="14"
            height="14"
            :href="`/img/kill${kill.isHs ? 'hs' : ''}.png`"
          />
          <image
            v-if="round.died"
            :x="getImgX(round.n)"
            y="-37"
            transform="scale(1,-1)"
            width="14"
            height="14"
            href="/img/death.png"
          />
        </g>
        <rect
          class="container-rect"
          :x="getRectX(round.n) + 1"
          y="21"
          width="18"
          height="118"
          fill="transparent"
        />
        <g v-if="round.n === halfTimeRound">
          <line
            :x1="20 * round.n + 1.5"
            y1="20"
            :x2="20 * round.n + 1.5"
            :y2="20 * maxKillsPerRound + 20"
          >
            <animate
              begin="indefinite"
              attributeName="y2"
              from="20"
              :to="20 * maxKillsPerRound + 40"
              dur="0.3s"
              fill="freeze"
              :onend="() => showHalfMark()"
            />
          </line>
          <text
            id="halfMark"
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
      selectRound: {
        type: Function,
        required: true,
      },
    },
    setup(props) {
      return {
        maxKillsPerRound: 5,
        halfTimeRound: 15,
        roundsToAnimate: props.rounds.map(round => round.n),
      };
    },
    watch: {
      rounds(newRounds, oldRounds) {
        this.roundsToAnimate = newRounds
          .filter(
            newRound =>
              oldRounds.filter(oldRound => oldRound.id === newRound.id)
                .length === 0
          )
          .map(round => round.n);
      },
    },
    mounted() {
      this.playAnimation();
    },
    updated() {
      this.playAnimation();
    },
    methods: {
      playAnimation() {
        document
          .querySelectorAll(
            '.animated round-rect, .animated line, .animated text, .animated image'
          )
          .forEach(element => {
            const elementStyle = element.style;
            elementStyle.visibility = 'hidden';
          });
        document.querySelectorAll('.animated animate').forEach((element, i) => {
          setTimeout(() => {
            const parent = element.parentElement;
            if (parent) parent.style.visibility = 'visible';
            element.beginElement();
          }, i * 50);
        });
      },
      roundToKills(round) {
        const kills = [];
        for (let i = 0; i < round.kills; i += 1) {
          kills.push({ n: i, isHs: false });
        }
        for (let i = 0; i < round.killshs && i < kills.length; i += 1) {
          kills[i].isHs = true;
        }
        return kills;
      },
      showKillsAndDeath(nRound) {
        document
          .querySelectorAll(`#killsAndDeath${nRound} image`)
          .forEach(element => {
            const elementStyle = element.style;
            elementStyle.visibility = 'visible';
          });
      },
      showHalfMark() {
        document.querySelector('#halfMark').style.visibility = 'visible';
      },
      getRectX(nRound) {
        return 20 * (nRound - 1) + (nRound > this.halfTimeRound ? 3 : 0);
      },
      getImgX(nRound) {
        return 20 * (nRound - 1) + 3 + (nRound > this.halfTimeRound ? 3 : 0);
      },
    },
  };
</script>

<style scoped>
  .container-rect:hover {
    stroke-width: 1;
    stroke: white;
  }

  .round-rect {
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
