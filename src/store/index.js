//引入Vue核心库
import Vue from 'vue'
//引入Vuex
import Vuex from 'vuex'
//应用Vuex插件
Vue.use(Vuex)

//准备actions对象——响应组件中用户的动作
const actions = {
    addParamsName({ commit }, item) {
        commit('addParamsName', item)
    },
    clearParamsName({ commit }) {
        commit('clearParamsName')
    }
}
//准备mutations对象——修改state中的数据
const mutations = {
    addParamsName(state, item) {
        state.paramsName.push({"value": item})
    },
    clearParamsName(state) {
        state.paramsName.length = 0
    },
}
//准备state对象——保存具体的数据
const state = {
    paramsName: [],
}

//创建并暴露store
export default new Vuex.Store({
    actions,
    mutations,
    state
})
