<template>
  <div class="outerContainer">
    <h3 v-if="title" class="title">{{ title }}</h3>
    <div class="mainContainer" :class="`legend-${legendPositon}`">
      <svg
        :id="identifier"
        :width="sideLength"
        :height="sideLength"
        class="donut"
      >
        <g v-for="(percentage, index) in percentages" :key="index">
          <circle
            class="ring animated"
            :cx="center"
            :cy="center"
            :r="radius"
            fill="none"
            :stroke="palette.colors[index]"
            :stroke-dasharray="initialDasharray"
          >
            <animate
              begin="indefinite"
              attributeName="stroke-dasharray"
              :from="initialDasharray"
              :to="computedDasharray(percentage)"
              dur="0.7s"
              fill="freeze"
            />
            <animate
              begin="indefinite"
              attributeName="stroke-dashoffset"
              :from="quarterLength"
              :to="computedDashoffset(accumulatedPercentages[index])"
              dur="0.7s"
              fill="freeze"
            />
          </circle>
          <circle
            class="popover-anchor"
            :cx="computePopoverXCoordinate(index)"
            :cy="computePopoverYCoordinate(index)"
            data-bs-toggle="popover"
            :data-bs-placement="computePopoverPlacement(index)"
            :data-bs-content="getPopoverContent(index)"
          />
        </g>
        <text
          class="innerTitle"
          :x="center"
          :y="center"
          :font-size="innerTitleSize"
        >
          {{ innerTitle }}
        </text>
        <text
          class="innerSubtitle"
          :x="center"
          :y="center"
          :font-size="innerSubtitleSize"
        >
          {{ innerSubtitle }}
        </text>
      </svg>
      <div class="legendContainer">
        <div v-for="(value, index) in data" :key="index">
          <svg width="15" height="15">
            <rect
              width="15"
              height="15"
              :fill="palette.darkColors[index]"
              :stroke="palette.colors[index]"
              stroke-width="4"
            ></rect>
          </svg>
          {{ labels[index] }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { Popover } from 'bootstrap';
  import palettes from '../../util/palette';

  export default {
    name: 'DonutChart',
    props: {
      identifier: {
        type: String,
        required: true,
      },
      data: {
        type: Array,
        required: true,
      },
      labels: {
        type: Array,
        required: true,
      },
      title: {
        type: String,
        required: false,
        default: null,
      },
      innerTitle: {
        type: String,
        required: false,
        default: null,
      },
      innerSubtitle: {
        type: String,
        required: false,
        default: null,
      },
      innerTitleSize: {
        type: String,
        required: false,
        default: '3em',
      },
      innerSubtitleSize: {
        type: String,
        required: false,
        default: '1.1em',
      },
      palette: {
        type: Object,
        required: false,
        default: palettes.basic,
      },
      sideLength: {
        type: Number,
        required: true,
      },
      legendPositon: {
        type: String,
        required: false,
        default: 'side',
      },
    },
    setup(props) {
      const radius = props.sideLength / 2 - props.sideLength / 10;

      const valuesSum = props.data.reduce((sum, value) => sum + value, 0);

      const percentages = [];
      const accumulatedPercentages = [0];
      const anglesForLabels = [];

      props.data.forEach((value, index) => {
        const percentage = valuesSum > 0 ? (value / valuesSum) * 100 : 0;
        percentages.push(percentage);

        const accumulatedPercentage =
          accumulatedPercentages[index] + percentage;
        accumulatedPercentages.push(accumulatedPercentage);

        const percentageForLabel =
          percentage / 2 + accumulatedPercentages[index];
        const angle = 2 * Math.PI * (percentageForLabel / 100);

        // In the chart the sectors are displayed from the top and grow clockwise,
        // but in trigonometry the angles start from the right and grow counter clockwise.
        // So we have to transform the computed angle
        const displayedAngle = -(angle - Math.PI / 2);
        anglesForLabels.push(displayedAngle);
      });

      return {
        percentages,
        accumulatedPercentages,
        anglesForLabels,
        radius,
        quarterLength: (Math.PI * radius) / 2,
      };
    },
    computed: {
      initialDasharray() {
        return `0 ${Math.PI * 2 * this.radius}`;
      },
      center() {
        return this.sideLength / 2;
      },
    },
    mounted() {
      const popoverTriggerList = [].slice.call(
        document.querySelectorAll(
          `#${this.identifier} [data-bs-toggle="popover"]`
        )
      );
      const popovers = popoverTriggerList.map(
        popoverTrigger =>
          new Popover(popoverTrigger, {
            container: 'body',
            html: true,
            sanitize: false,
          })
      );

      popoverTriggerList.forEach((popoverTrigger, index) => {
        const chartSector = popoverTrigger.previousElementSibling;
        let timeout = null;

        chartSector.onmouseenter = () => {
          if (!timeout) popovers[index].show();
          else {
            clearTimeout(timeout);
            timeout = null;
          }
        };

        chartSector.onmouseleave = () => {
          timeout = setTimeout(() => {
            popovers[index].hide();
            timeout = null;
          }, 500);
        };
      });

      this.playAnimation();
    },
    updated() {
      this.playAnimation();
    },
    methods: {
      computedDasharray(percentage) {
        return `${(2 * Math.PI * this.radius * percentage) / 100}
          ${(2 * Math.PI * this.radius * (100 - percentage)) / 100}`;
      },
      computedDashoffset(percentageOffset) {
        return `${(-2 * Math.PI * this.radius * percentageOffset) / 100 +
          this.quarterLength}`;
      },
      playAnimation() {
        document
          .querySelectorAll(`#${this.identifier} .animated animate`)
          .forEach(element => {
            element.beginElement();
          });
      },
      computePopoverXCoordinate(index) {
        const offsetX = Math.cos(this.anglesForLabels[index]) * this.radius;
        return this.center + offsetX;
      },
      computePopoverYCoordinate(index) {
        const offsetY = Math.sin(this.anglesForLabels[index]) * this.radius;
        // The y coordinates are inversed in svg,
        // so we substract the offset instead of adding it
        return this.center - offsetY;
      },
      computePopoverPlacement(index) {
        return this.percentages[index] / 2 +
          this.accumulatedPercentages[index] >
          50
          ? 'left'
          : 'right';
      },
      roundNumber(number) {
        return Math.round((number + Number.EPSILON) * 100) / 100;
      },
      getPopoverContent(index) {
        return `<svg width="13" height="13">
                  <rect
                    width="13"
                    height="13"
                    fill="${this.palette.darkColors[index]}"
                    stroke="${this.palette.colors[index]}"
                    stroke-width="4"
                  ></rect>
                </svg>
                ${this.labels[index]}: ${this.data[index]}
                (${this.roundNumber(this.percentages[index])}%)`;
      },
    },
  };
</script>

<style scoped>
  .outerContainer {
    display: flex;
    flex-flow: column;
    align-items: center;
  }

  .title {
    margin-top: 0.7em;
    margin-bottom: 0;
  }

  .mainContainer {
    display: flex;
    align-items: center;
  }

  text {
    fill: white;
  }

  .ring {
    stroke-width: 15;
  }

  .ring:hover {
    stroke-width: 20;
  }

  .innerTitle,
  .innerSubtitle {
    text-anchor: middle;
  }

  .innerTitle {
    font-style: italic;
    transform: translateY(0.1em);
  }

  .innerSubtitle {
    transform: translateY(2em);
  }

  .legendContainer {
    display: flex;
    font-size: 0.8em;
  }

  .legend-side {
    flex-flow: row;
  }

  .legend-bottom {
    flex-flow: column;
  }

  .legend-side .legendContainer {
    flex-flow: column;
    margin-right: 1em;
  }

  .legend-bottom .legendContainer {
    flex-flow: row;
  }

  .legendContainer div {
    display: flex;
    align-items: center;
    margin: 0 0.5em 1em;
  }

  .legendContainer svg {
    margin-right: 0.5em;
  }
</style>

<style>
  .popover {
    background: rgba(0, 0, 0, 0.8);
  }

  .popover-body {
    font-size: 0.8em;
    color: white;
    display: flex;
    align-items: center;
  }

  .popover-body svg {
    margin-right: 0.5em;
  }

  .bs-popover-start > .popover-arrow::after {
    border-left-color: rgba(0, 0, 0, 0.7);
  }

  .bs-popover-top > .popover-arrow::after {
    border-top-color: rgba(0, 0, 0, 0.7);
  }

  .bs-popover-end > .popover-arrow::after {
    border-right-color: rgba(0, 0, 0, 0.7);
  }

  .bs-popover-bottom > .popover-arrow::after {
    border-bottom-color: rgba(0, 0, 0, 0.7);
  }
</style>
