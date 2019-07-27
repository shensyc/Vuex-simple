<template>
  <div id="app">
    {{this.$store.state.count}}
    {{this.$store.getters.newCount}}
    <button @click="add">增加</button>
  </div>
</template>

<script>

export default {
  name:'app',
  mounted(){
    console.log(this.$store);
  },
  methods:{
    add(){
      // this.$store.commit('change'); //同步 commit
      this.$store.dispatch('change'); //异步 dispatch
      
    }
  }
}
</script>

