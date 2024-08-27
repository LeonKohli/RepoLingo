<template>
    <div class="relative">
        <Icon v-if="iconName" :name="iconName"
            class="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :type="type" :id="id"
            :placeholder="placeholder" :required="required"
            :class="['w-full px-3 py-2 bg-white border rounded-lg text-secondary border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-secondary dark:text-white dark:border-gray-600', iconName ? 'pl-10' : 'px-4']">
    </div>
</template>

<script setup>
defineProps({
    modelValue: [String, Number],
    iconName: String,
    type: {
        type: String,
        default: 'text'
    },
    id: String,
    placeholder: String,
    required: Boolean
})

defineEmits(['update:modelValue'])
</script>
