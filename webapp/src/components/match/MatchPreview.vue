<template>
  <div class="match-preview card mb-1" :class="matchClass">
    <div class="row g-0">
      <div class="col card-img">
        <img
          :src="`img/maps-opaque/${match.map}.jpg`"
          :alt="match.map"
          height="130"
        />
        <div class="img-top-left">
          {{ match.map }}
        </div>
        <div class="img-top-right">
          {{ match.mode.charAt(0).toUpperCase() + match.mode.slice(1) }}
        </div>
        <div class="img-center">
          <p>
            {{
              matchDate.toLocaleDateString('en', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            }}
          </p>
          <p>
            {{
              matchDate
                .toLocaleTimeString()
                .slice(0, matchDate.toLocaleTimeString().lastIndexOf(':'))
            }}
          </p>
        </div>
      </div>
      <div class="col card-right">
        <div class="card-header">
          {{ matchResult }}
        </div>
        <div v-if="selected" class="card-body-selected"></div>
        <div v-else class="card-body">
          <p>{{ match.roundsWon }} - {{ match.roundsLost }}</p>
          <p>{{ Math.round(match.duration / 60) }} min</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'MatchPreview',
    props: {
      match: {
        type: Object,
        required: true,
      },
      selected: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      let matchClass = 'bg-secondary';
      let matchResult = 'Tie';
      if (this.match.roundsWon > this.match.roundsLost) {
        matchClass = 'bg-success';
        matchResult = 'Victory';
      } else if (this.match.roundsWon < this.match.roundsLost) {
        matchClass = 'bg-danger';
        matchResult = 'Defeat';
      }
      return {
        matchClass,
        matchResult,
        matchDate: new Date(this.match.date),
      };
    },
  };
</script>

<style lang="scss" scoped>
  p {
    text-align: center;
  }
  .match-preview {
    border: 0px;
  }
  .card-img {
    position: relative;
    font-weight: bold;
    text-shadow: 1px 1px 10px #000000;
  }
  .card-img p {
    margin-bottom: 0;
    margin-top: 0.5em;
  }
  .img-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .img-top-left {
    position: absolute;
    top: 0;
    left: 0.5em;
    font-size: 0.9em;
  }
  .img-top-right {
    position: absolute;
    top: 0;
    right: 0.5em;
    font-size: 0.9em;
  }
  .card-right {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .card-body {
    padding: 0.5em;
    flex: 1;
    display: inline-block;
    position: relative;
    width: 5em;
    overflow: hidden;
    transition: all 0.2s linear 0s;

    &::before {
      content: '\f105';
      font-family: 'Font Awesome 5 Free';
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform: scale(0, 1);
      transition: all 0.2s linear 0s;
    }

    &:hover {
      text-indent: -10em;

      &::before {
        transform: scale(1, 1);
        text-indent: 0;
      }
    }
  }
  .card-body p {
    margin-bottom: 0.5em;
  }
  .card-body-selected {
    flex: 1;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;

    &::before {
      content: '\f105';
      font-family: 'Font Awesome 5 Free';
    }
  }
</style>
