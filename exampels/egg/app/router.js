module.exports = (app) => {
  const { router, controller } = app
  router.get('/', controller.home.index)
  router.get('/foo', controller.home.foo)
}
