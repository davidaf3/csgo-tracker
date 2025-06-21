<template>
  <div class="auto-launch-toggle">
    <span class="auto-launch-label">Auto-start on boot</span>
    <label class="switch">
      <input type="checkbox" v-model="autoLaunchEnabled" @change="toggleAutoLaunch">
      <span class="slider round"></span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'AutoLaunchToggle',
  data() {
    return {
      autoLaunchEnabled: false
    };
  },
  mounted() {
    // Get auto launch status when component mounts
    this.getAutoLaunchStatus();
  },
  methods: {
    async getAutoLaunchStatus() {
      try {
        if (window.electronAPI) {
          this.autoLaunchEnabled = await window.electronAPI.getAutoLaunchStatus();
        }
      } catch (error) {
        console.error('Failed to get auto-launch status:', error);
      }
    },
    async toggleAutoLaunch() {
      try {
        if (window.electronAPI) {
          await window.electronAPI.setAutoLaunch(this.autoLaunchEnabled);
        }
      } catch (error) {
        console.error('Failed to set auto-launch:', error);
        this.autoLaunchEnabled = !this.autoLaunchEnabled; // Revert on failure
      }
    }
  }
};
</script>

<style scoped>
.auto-launch-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
}

.auto-launch-label {
  font-size: 14px;
  color: #eee;
  white-space: nowrap;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>