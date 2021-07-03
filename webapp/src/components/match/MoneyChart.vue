<template>
  <canvas id="moneyChart" width="400" height="100"></canvas>
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
      rounds() {
        if (chart === null) {
          this.createChart();
          return;
        }
        this.updateChart();
      },
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
      },
      updateChart() {
        if (chart) {
          const { datasets, labels } = chart.data;

          labels.splice(0, labels.length);
          this.rounds.forEach(round => labels.push(round.n));

          datasets.forEach(dataset => {
            dataset.data.splice(0, dataset.data.length);
          });
          this.rounds.forEach(round => datasets[0].data.push(round.initMoney));
          this.rounds.forEach(round => datasets[1].data.push(round.equipValue));

          chart.update();
        }
      },
    },
  };
</script>
