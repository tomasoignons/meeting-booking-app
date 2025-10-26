<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
useHead({
  script: [
    {
      src: 'https://plausible.omont.ch/js/script.js',
      defer: true,
      'data-domain': 'clastrix.omont.ch'
    }
  ]
})
</script>
