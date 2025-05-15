import { ref, readonly } from 'vue';

// Create a global filter state
const selectedGameMode = ref('');

// Function to change the game mode filter
function setGameMode(mode) {
  selectedGameMode.value = mode;
}

// Export both the state and the function to change it
export { selectedGameMode, setGameMode };
