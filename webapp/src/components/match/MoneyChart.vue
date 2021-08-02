<template>
  <div id="chartContainer">
    <canvas id="moneyChart"></canvas>
  </div>
</template>

<script>
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);
  let chart = null;

  export default {
    name: 'MoneyChart',
    props: {
      rounds: {
        type: Array,
        required: true,
      },
    },
    watch: {
      rounds(newRounds, oldRounds) {
        const addedRounds = newRounds.filter(
          newRound =>
            oldRounds.filter(oldRound => oldRound.id === newRound.id).length ===
            0
        );

        if (addedRounds.length === newRounds.length) {
          // If all rounds are new, clear the chart and add all the rounds
          this.clearChart();
          this.addRoundsToChart(newRounds);
        } else {
          // If not all rounds are new, add only the new rounds to the chart
          this.addRoundsToChart(addedRounds);
        }
      },
    },
    mounted() {
      if (chart === null) {
        this.createChart();
      }
    },
    unmounted() {
      chart.destroy();
      chart = null;
    },
    methods: {
      createChart() {
        const data = {
          labels: this.rounds.map(round => round.n),
          datasets: [
            {
              label: 'Initial money',
              data: this.rounds.map(round => round.initMoney),
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
            },
            {
              label: 'Equipment value',
              data: this.rounds.map(round => round.equipValue),
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
                position: 'top',
              },
            },
          },
        };

        const ctx = document.getElementById('moneyChart').getContext('2d');
        chart = new Chart(ctx, config);
        this.alignCharts();
      },
      clearChart() {
        if (chart) {
          const { datasets, labels } = chart.data;

          labels.splice(0, labels.length);

          datasets.forEach(dataset => {
            dataset.data.splice(0, dataset.data.length);
          });
        }
      },
      addRoundsToChart(newRounds) {
        if (chart) {
          const { datasets, labels } = chart.data;

          newRounds.forEach(round => labels.push(round.n));

          newRounds.forEach(round => datasets[0].data.push(round.initMoney));
          newRounds.forEach(round => datasets[1].data.push(round.equipValue));

          chart.update();
          this.alignCharts();
        }
      },
      alignCharts() {
        const yScaleWidth = Math.floor(chart.scales.y.width);

        const roundsChart = document.getElementById('roundsChart');
        roundsChart.style.margin = `0 ${yScaleWidth - 10}px`;

        const moneyChartContainer = document.getElementById('chartContainer');
        moneyChartContainer.style.width = `${this.rounds.length * 20 -
          10 +
          yScaleWidth}px`;
      },
    },
  };
</script>

<style>
  #chartContainer {
    height: 175px;
  }
</style>
