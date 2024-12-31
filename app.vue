<template>
  <NuxtPage />
</template>

<style>
html {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

*, *:before, *:after {
  box-sizing: inherit;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: #f5f5f5;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem !important;
  }
  
  .notes-grid {
    grid-template-columns: 1fr !important;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .todo-item {
    flex-wrap: wrap;
  }
  
  .todo-input {
    width: 100%;
    margin-top: 0.5rem;
  }
}
</style>
