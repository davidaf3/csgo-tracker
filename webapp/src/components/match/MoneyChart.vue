<template>
  <div id="mainContainer">
    <div id="chartContainer">
      <canvas id="moneyChart" />
    </div>
    <div id="legendContainer">
      <p>
        <svg width="30" height="13">
          <rect
            width="30"
            height="13"
            fill="rgba(255, 99, 132, 0.2)"
            stroke="rgba(255, 99, 132, 1)"
            stroke-width="5"
          ></rect>
        </svg>
        Initial money
      </p>
      <p>
        <svg width="30" height="13">
          <rect
            width="30"
            height="13"
            fill="rgba(54, 162, 235, 0.2)"
            stroke="rgba(54, 162, 235, 1)"
            stroke-width="5"
          ></rect>
        </svg>
        Equipment value
      </p>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, onUnmounted, watch } from 'vue';
  import { Chart, registerables } from 'chart.js';

  const props = defineProps({
    rounds: {
      type: Array,
      required: true,
    },
  });

  Chart.register(...registerables);
  let chart = null;

  function alignCharts() {
    const yScaleWidth = Math.floor(chart.scales.y.width);

    const roundsChart = document.getElementById('roundsChart');
    if (roundsChart) roundsChart.style.margin = `0 ${yScaleWidth - 10}px`;

    const moneyChartContainer = document.getElementById('chartContainer');
    moneyChartContainer.style.width = `${
      props.rounds.length * 20 - 10 + yScaleWidth
    }px`;
  }

  function createChart() {
    const data = {
      labels: props.rounds.map((round) => round.n),
      datasets: [
        {
          label: 'Initial money',
          data: props.rounds.map((round) => round.initMoney),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
        {
          label: 'Equipment value',
          data: props.rounds.map((round) => round.equipValue),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
      ],
    };

    const config = {
      type: 'line',
      data,
      options: {
        color: '#fff',
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    };

    const ctx = document.getElementById('moneyChart').getContext('2d');
    chart = new Chart(ctx, config);
    alignCharts();
  }

  function clearChart() {
    if (chart) {
      const { datasets, labels } = chart.data;
      labels.splice(0, labels.length);
      datasets.forEach((dataset) => {
        dataset.data.splice(0, dataset.data.length);
      });
    }
  }

  function addRoundsToChart(newRounds) {
    if (chart) {
      const { datasets, labels } = chart.data;
      newRounds.forEach((round) => labels.push(round.n));
      newRounds.forEach((round) => datasets[0].data.push(round.initMoney));
      newRounds.forEach((round) => datasets[1].data.push(round.equipValue));
      chart.update();
      alignCharts();
    }
  }

  onMounted(() => {
    if (chart === null) createChart();
  });

  onUnmounted(() => {
    chart.destroy();
    chart = null;
  });

  watch(
    () => props.rounds,
    (rounds, prevRounds) => {
      const addedRounds = rounds.filter(
        (round) => !prevRounds.some((prevRound) => prevRound.id === round.id)
      );

      if (addedRounds.length === rounds.length) {
        // If all rounds are new, clear the chart and add all the rounds
        clearChart();
        addRoundsToChart(rounds);
      } else {
        // If not all rounds are new, add only the new rounds to the chart
        addRoundsToChart(addedRounds);
      }
    }
  );
</script>

<style scoped>
  #mainContainer {
    display: flex;
    flex-flow: row;
  }

  #chartContainer {
    height: 175px;
  }

  #legendContainer {
    margin-left: 1em;
    display: flex;
    flex-flow: column;
    justify-content: center;
    font-size: 0.8em;
  }

  #legendContainer svg {
    margin: 0.5em;
  }

  #legendContainer p {
    margin-bottom: 0.5em;
  }
</style>
