<template>
  <div class="match-preview card mb-1" :class="matchClass">
    <div class="row g-0">
      <div class="col card-img">
        <img
          :src="`/img/maps-opaque/${match.map}.jpg`"
          :alt="match.map"
          height="130"
          @error="(e) => {
            e.target.onerror = null;
            e.target.src = '/img/maps-opaque/notfound.jpg';
          }"
        />
        <div class="img-top-left">
          {{ match.map }}
        </div>
        <div class="img-top-right">
          {{ capitalizedGameMode }}
        </div>
        <div class="img-center">
          <p>{{ formattedMatchDate }}</p>
          <p>{{ formattedMatchTime }}</p>
        </div>
      </div>
      <div class="col card-right">
        <div class="card-header">
          {{ matchResult }}
        </div>
        <div v-if="selected" class="card-body-selected"></div>
        <div v-else class="card-body">
          <p>{{ match.roundsWon }} - {{ match.roundsLost }}</p>
          <p v-if="match.over">{{ Math.round(match.duration / 60) }} min</p>
          <p v-else>
            <img
              src="/img/match-in-progress.svg"
              alt="In progress"
              height="20"
            />
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    match: {
      type: Object,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  });

  const matchDate = computed(() => new Date(props.match.date));

  const capitalizedGameMode = computed(
    () => props.match.mode.charAt(0).toUpperCase() + props.match.mode.slice(1)
  );

  const formattedMatchDate = computed(() =>
    matchDate.value.toLocaleDateString('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );

  const formattedMatchTime = computed(() => {
    const timeString = matchDate.value.toLocaleTimeString();
    return timeString.slice(0, timeString.lastIndexOf(':'));
  });

  const matchResult = computed(() => {
    if (!props.match.over) {
      return 'Live';
    }
    if (props.match.roundsWon > props.match.roundsLost) {
      return 'Victory';
    }
    if (props.match.roundsWon < props.match.roundsLost) {
      return 'Defeat';
    }
    return 'Tie';
  });

  const matchClasses = new Map([
    ['Live', 'bg-primary'],
    ['Victory', 'bg-success'],
    ['Defeat', 'bg-danger'],
    ['Tie', 'bg-secondary'],
  ]);

  const matchClass = computed(() => matchClasses.get(matchResult.value));
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
  .card-header {
    width: 100%;
    text-align: center;
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
