<template>
  <div class="outerContainer">
    <h3 v-if="title && !smallTitle" class="title">{{ title }}</h3>
    <h5 v-if="title && smallTitle" class="small-title">{{ title }}</h5>
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
            :stroke-width="(2 * sideLength) / 25"
          >
            <animate
              begin="indefinite"
              attributeName="stroke-dasharray"
              :from="initialDasharray"
              :to="computedDasharray(percentage)"
              dur="0.5s"
              fill="freeze"
            />
            <animate
              begin="indefinite"
              attributeName="stroke-dashoffset"
              :from="quarterLength"
              :to="computedDashoffset(accumulatedPercentages[index])"
              dur="0.5s"
              fill="freeze"
            />
          </circle>
          <circle
            class="popover-anchor"
            :cx="computePopoverXCoordinate(index)"
            :cy="computePopoverYCoordinate(index)"
            data-bs-toggle="popover"
            data-bs-custom-class="custom-popover"
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

<script setup>
  import { computed, onMounted, watchEffect } from 'vue';
  import createPopovers from '../../util/popover';
  import palettes from '../../util/palette';

  const props = defineProps({
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
    smallTitle: {
      type: Boolean,
      required: false,
      default: false,
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
  });

  const radius = props.sideLength / 2 - props.sideLength / 20;
  const valuesSum = props.data.reduce((sum, value) => sum + value, 0);
  const quarterLength = (Math.PI * radius) / 2;

  const percentages = [];
  const accumulatedPercentages = [0];
  const anglesForLabels = [];

  props.data.forEach((value, index) => {
    const percentage = valuesSum > 0 ? (value / valuesSum) * 100 : 0;
    percentages.push(percentage);

    const accumulatedPercentage = accumulatedPercentages[index] + percentage;
    accumulatedPercentages.push(accumulatedPercentage);

    const percentageForLabel = percentage / 2 + accumulatedPercentages[index];
    const angle = 2 * Math.PI * (percentageForLabel / 100);

    // In the chart the sectors are displayed from the top and grow clockwise,
    // but in trigonometry the angles start from the right and grow counter clockwise.
    // So we have to transform the computed angle
    const displayedAngle = -(angle - Math.PI / 2);
    anglesForLabels.push(displayedAngle);
  });

  const initialDasharray = computed(() => `0 ${Math.PI * 2 * radius}`);
  const center = computed(() => props.sideLength / 2);

  function playAnimation() {
    document
      .querySelectorAll(`#${props.identifier} .animated animate`)
      .forEach((element) => {
        element.beginElement();
      });
  }

  function computePopoverXCoordinate(index) {
    const offsetX = Math.cos(anglesForLabels[index]) * radius;
    return center.value + offsetX;
  }

  function computePopoverYCoordinate(index) {
    const offsetY = Math.sin(anglesForLabels[index]) * radius;
    // The y coordinates are inversed in svg,
    // so we substract the offset instead of adding it
    return center.value - offsetY;
  }

  function computePopoverPlacement(index) {
    return percentages[index] / 2 + accumulatedPercentages[index] > 50
      ? 'left'
      : 'right';
  }

  function roundNumber(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  function getPopoverContent(index) {
    return `<svg width="13" height="13">
                  <rect
                    width="13"
                    height="13"
                    fill="${props.palette.darkColors[index]}"
                    stroke="${props.palette.colors[index]}"
                    stroke-width="4"
                  ></rect>
                </svg>
                ${props.labels[index]}: ${props.data[index]}
                (${roundNumber(percentages[index])}%)`;
  }

  function makePopovers() {
    createPopovers(
      props.identifier,
      (element) => {
        const chartSector = element;
        chartSector.style.strokeWidth = (2 * props.sideLength) / 20;
      },
      (element) => {
        const chartSector = element;
        chartSector.style.strokeWidth = (2 * props.sideLength) / 25;
      }
    );
  }

  onMounted(() => {
    watchEffect(() => {
      makePopovers();
      playAnimation();
    });
  });

  function computedDasharray(percentage) {
    return `${(2 * Math.PI * radius * percentage) / 100}
        ${(2 * Math.PI * radius * (100 - percentage)) / 100}`;
  }

  function computedDashoffset(percentageOffset) {
    return `${
      (-2 * Math.PI * radius * percentageOffset) / 100 + quarterLength
    }`;
  }
</script>

<style scoped>
  .donut {
    margin: 0.5em;
  }

  .outerContainer {
    display: flex;
    flex-flow: column;
    align-items: center;
  }

  .title {
    margin-top: 0.4em;
    margin-bottom: 0.1em;
  }

  .small-title {
    margin-top: 0.4em;
    margin-bottom: 0.25em;
  }

  .mainContainer {
    display: flex;
    align-items: center;
  }

  text {
    fill: white;
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
