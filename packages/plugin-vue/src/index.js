module.exports = (options = {}) => ({
  name: 'plugin-vue',
  /**
   * @param {import('esbuild').PluginBuild} build 
   */
  setup(build) {
    build.onLoad({filter: /\.vue$/}, (args) => {
      return {
        contents: '',
        loader: 'js',
      }
    })
  }
})