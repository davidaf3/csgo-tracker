<template>
  <div class="outerContainer">
    <h3 v-if="title && !smallTitle" class="title">{{ title }}</h3>
    <h5 v-if="title && smallTitle" class="small-title">{{ title }}</h5>
    <svg
      :id="identifier"
      class="barChart"
      :height="height"
      :width="width"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g :transform="`scale(1,-1) translate(0,-${height})`">
        <line
          :x1="yAxisLegendWidth - 0.5"
          y1="20.5"
          :x2="yAxisLegendWidth - 0.5"
          :y2="height"
        />
        <line :x1="yAxisLegendWidth" y1="21" :x2="width" y2="21" />
        <text
          v-for="(value, index) in yAxisValues"
          :key="index"
          font-size="0.75em"
          transform="scale(1,-1)"
          dominant-baseline="middle"
          text-anchor="end"
          :x="yAxisLegendWidth - 10"
          :y="(height - 31.5) * ((index + 1) / 4) + 21.5"
        >
          {{ value }}
        </text>
        <g v-for="(item, index) in data" :key="index">
          <text
            transform="scale(1,-1)"
            text-anchor="middle"
            :x="getBarX(index) + halfBarWidth"
            y="14"
          >
            {{ item.label }}
          </text>
          <rect
            class="bar"
            :x="getBarX(index)"
            y="21.5"
            :width="barWidth"
            :fill="palette.colors[index]"
          >
            <animate
              begin="indefinite"
              attributeName="height"
              from="0"
              :to="getBarHeight(item)"
              dur="0.5s"
              fill="freeze"
            />
          </rect>
          <circle
            class="popover-anchor"
            :cx="getBarX(index) + halfBarWidth"
            :cy="getBarHeight(item) / 2 + 21.5"
            data-bs-toggle="popover"
            data-bs-custom-class="custom-popover"
            data-bs-placement="right"
            :data-bs-content="getPopoverContent(index)"
          />
        </g>
      </g>
    </svg>
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
    data: {
      type: Array,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    barWidth: {
      type: Number,
      required: true,
    },
    yAxisLegendWidth: {
      type: Number,
      required: true,
    },
    palette: {
      type: Object,
      required: false,
      default: palettes.basic,
    },
  });

  const maxYAxis = computed(() => {
    const maxValue = Math.max(...props.data.map((element) => element.value));
    const maxValueDigits = Math.floor(Math.log10(maxValue));
    if (maxValueDigits >= 0) {
      return (
        (Math.floor(maxValue / 10 ** maxValueDigits) + 1) * 10 ** maxValueDigits
      );
    }
    return 1;
  });
  const halfBarWidth = computed(() => props.barWidth / 2);
  const width = computed(
    () =>
      props.barWidth * 1.5 * props.data.length +
      props.yAxisLegendWidth +
      halfBarWidth.value
  );
  const yAxisValues = computed(() => {
    const values = [];
    for (let i = 1; i <= 4; i += 1) {
      values.push(maxYAxis.value * (i / 4));
    }
    return values;
  });

  function playAnimation() {
    document.querySelectorAll(`#${props.identifier} rect`).forEach((element) => {
      const elementStyle = element.style;
      elementStyle.visibility = 'hidden';
    });
    document
      .querySelectorAll(`#${props.identifier} animate`)
      .forEach((element) => {
        const parent = element.parentElement;
        if (parent) parent.style.visibility = 'visible';
        element.beginElement();
      });
  }

  function getBarX(index) {
    return (
      index * props.barWidth +
      (index + 1) * halfBarWidth.value +
      props.yAxisLegendWidth
    );
  }

  function getBarHeight(item) {
    return (props.height - 31.5) * (item.value / maxYAxis.value);
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
                  ${props.data[index].label}: ${props.data[index].value}`;
  }

  function makePopovers() {
    createPopovers(
      props.identifier,
      (element) => {
        element.setAttribute(
          'fill',
          element
            .getAttribute('fill')
            .replace('rgb', 'rgba')
            .replace(')', ', 0.75)')
        );
      },
      (element) => {
        element.setAttribute(
          'fill',
          element
            .getAttribute('fill')
            .replace('rgba', 'rgb')
            .replace(', 0.75)', ')')
        );
      }
    );
  }

  onMounted(() => {
    watchEffect(() => {
      makePopovers();
      playAnimation();
    });
  });
</script>

<style scoped>
  .outerContainer {
    display: flex;
    flex-flow: column;
    align-items: center;
    margin: 0.5em;
  }

  .barChart {
    margin: 0.5em;
  }

  .title {
    margin-bottom: 0.1em;
  }

  .small-title {
    margin-bottom: 0.25em;
  }

  line {
    stroke-width: 1;
    stroke: white;
  }

  text {
    fill: white;
    transform-origin: center;
    transform-box: fill-box;
  }
</style>
