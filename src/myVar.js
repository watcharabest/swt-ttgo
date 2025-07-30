import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMyVar = defineStore('myVar', () => {
    const line = ref('')
    return { line }
}, {
    persist: true
})
