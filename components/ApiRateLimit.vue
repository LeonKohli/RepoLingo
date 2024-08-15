<template>
    <div class="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">API Rate Limit</h3>
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <div class="w-16 h-16 mr-4">
                    <svg viewBox="0 0 36 36" class="circular-chart">
                        <path class="circle-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path :class="['circle', { 'warning': percentage < 20, 'danger': percentage < 10 }]"
                            :stroke-dasharray="`${percentage}, 100`"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <text x="18" y="20.35" class="percentage">{{ remaining }}</text>
                    </svg>
                </div>
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Remaining / Total</p>
                    <p class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ remaining }} / {{ limit }}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-600 dark:text-gray-400">Resets at</p>
                <p class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ resetTime }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    remaining: Number,
    limit: Number,
    resetTime: String,
})

const percentage = computed(() => Math.round((props.remaining / props.limit) * 100))
</script>

<style scoped>
.circular-chart {
    display: block;
    margin: 0 auto;
    max-width: 100%;
}

.circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 3.8;
}

.circle {
    fill: none;
    stroke: #4CAF50;
    stroke-width: 2.8;
    stroke-linecap: round;
    transition: stroke-dasharray 0.3s ease;
}

.circle.warning {
    stroke: #FFA500;
}

.circle.danger {
    stroke: #FF0000;
}

.percentage {
    fill: #666;
    font-family: sans-serif;
    font-size: 0.5em;
    text-anchor: middle;
}
</style>