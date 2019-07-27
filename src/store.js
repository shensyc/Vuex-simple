import Vue from 'vue'
import Vuex from './vuex'

Vue.use(Vuex);//install方法

export default new Vuex.Store({
  modules:{
    a:{
      state:{
        count:300
      },
      mutations:{
        change(state){
          console.log('-------')
        }
      },
      modules:{
        state: {
          count:3000
        }
      }
    }
  },
  state: {
    count:100
  },
  getters:{
    newCount(state){
      return state.count + 100;
    }
  },
  mutations: {
    change(state){
      console.log('xxxxxx')
      state.count +=10;
    }
  },
  actions: {
    change({commit}){
      setTimeout(() => {
        commit('change');
      }, 1000);
    }
  }
})
