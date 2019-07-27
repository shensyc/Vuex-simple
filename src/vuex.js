
let Vue;

class ModuleCollection{
    constructor(options){
        this.register([],options);
    }
    register(path,rawModule){
        //path是个空数组， rawModule是个对象
        let newModule = {
            _raw:rawModule,//对象 当前 有state getters 
            _children:{}, //表示它包含的模块
            state:rawModule.state // 自己模块的状态
        }
        if(path.length == 0){
            this.root = newModule; //根
        }else{
            let parent = path.slice(0,-1).reduce((root,current)=>{
                return root._children[current];
            },this.root)
            parent._children[path[path.length-1]] = newModule;
        }
        if(rawModule.modules){ //有子模块
            forEach(rawModule.modules,(childName,module)=>{
                this.register(path.concat(childName),module);
            })
        }
    }
}

function installModule(store,rootState,path,rootModule){

    if(path.length>0){// [a]
        let parent = path.slice(0,-1).reduce((root,current)=>{
            return root._children[current];
        },rootModule);
        Vue.set(rootState,path[path.length-1],parent);
    }

    if(rootModule._raw.getters){
        forEach(rootModule._raw.getters,(getterName,getterFn)=>{
            Object.defineProperty(store.getters,getterName,{
                get:()=>{
                    return getterFn(rootModule.state);
                }
            })
        })
    }

    if(rootModule._raw.actions){
        forEach(rootModule._raw.actions,(actionName,actionFn)=>{
            let entry = store.actions[actionName] || (store.actions[actionName] =[]);
            entry.push(()=>{
                actionFn.call(store,store);
            })
        })
    }

    if(rootModule._raw.mutations){
        forEach(rootModule._raw.mutations,(mutationName,mutationFn)=>{
            let entry = store.mutations[mutationName] || (store.mutations[mutationName]=[]);
            entry.push(()=>{
                mutationFn.call(store,rootModule.state);
            })
        })
    }

    forEach(rootModule._children,(childName,module)=>{
        installModule(store,rootState,path.concat(childName),module);
    })
}


class Store{
    constructor(options){
        let state = options.state;//{count:200}
        this.getters = {};
        this.mutations = {};
        this.actions = {};
        //什么样的属性可以实现双向绑定 有get和set new Vue({data:200})
        //vuex核心就是借用了vue的实例 因为vue的实例数据变化会刷新视图
        this._vm = new Vue({
            data:{
                state
            }
        });

        //把模块直接的关系进行整理
        // root._children =>a._children = b
        this.modules = new ModuleCollection(options);
        //无论是子模块，还是孙子模块所有的mutation都是根上的
        installModule(this,state,[],this.modules.root); //{_raw,_children,state}





        // if(options.getters){
        //     let getters = options.getters; //{newCount:fn}
        //     forEach(getters,(getterName,getterFn)=>{
        //         Object.defineProperty(this.getters,getterName,{
        //             get:()=>{
        //                 //vue computed实现
        //                 return getterFn(state);
        //             }
        //         })
        //     })
        // }
        // let mutations = options.mutations;
        // forEach(mutations,(mutationName,mutationFn)=>{
        //     //this.mutations.change =()=>{change(state)}
        //     this.mutations[mutationName] = ()=>{
        //         mutationFn.call(this,state);
        //     }
        // });
        // let actions = options.actions;
        // forEach(actions,(actionName,actionFn)=>{
        //     this.actions[actionName] =()=>{
        //         actionFn.call(this,this);
        //     }
        // })
        let {commit,dispatch} = this;
        this.commit = (type) =>{
            commit.call(this,type);
        }
        this.dispatch = (type) =>{
            dispatch.call(this,type);
        }
    }
    get state(){ //Object.defineProperty get
        return  this._vm.state;
    }
    commit(type){
        this.mutations[type].forEach(fn=>fn());
    }
    dispatch(type){
        this.actions[type].forEach(fn=>fn());
    }
}


function forEach(obj,callback){
    Object.keys(obj).forEach(item=>callback(item,obj[item]));
}

let install = (_Vue) =>{
    Vue = _Vue;
    Vue.mixin({
        beforeCreate() {
            //把根组件中的store实例 给每个组件中都增加一个$store属性
            //判断是否是根组件
            if(this.$options && this.$options.store){
                this.$store = this.$options.store;
            }else{//子组件  加载顺序  父=>子 => 孙子
                console.log(this.$options.name);
                this.$store = this.$parent && this.$parent.$store;
            }
        },
    })
}

export default {
    Store,
    install
}