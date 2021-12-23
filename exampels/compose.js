function compose(middlewares) {
    return (context, next) => {
        return dispatch(0)
        function dispatch(i) {    
            let fn = middlewares[i]
            if (i === middlewares.length) fn = next
            if(!fn) return Promise.resolve()
            return Promise.resolve(fn(context, dispatch.bind(null, i+1)))
        }
    }
}
function middleware1(){
    return async (ctx, next) => {
        console.log('middleware1 start')
        await next()
        console.log('middleware1 end')
    }
}
function middleware2(){
    return async (ctx, next) => {
        console.log('middleware2 start')
        await next()
        console.log('middleware2 end')
    }
}
function middleware3(){
    return async (ctx, next) => {
        console.log('middleware3 start')
        await next()
        console.log('middleware3 end')
    }
}
const ctx ={

}
// console.log(compose([middleware1,middleware2, middleware3])(ctx))
compose([middleware1(),middleware2(), middleware3()])(ctx).then(res =>{
    console.log(res)
})
