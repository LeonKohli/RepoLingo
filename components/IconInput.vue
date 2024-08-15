<template>
    <div class="relative">
        <Icon v-if="iconName" :name="iconName"
            class="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :type="type" :id="id"
            :placeholder="placeholder" :required="required"
            :class="['custom-input w-full py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500', iconName ? 'pl-10' : 'px-4']">
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
