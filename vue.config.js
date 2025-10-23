/**
 * Vue CLI 配置 - 性能优化
 */
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = 'Vue Element Admin' // 页面标题
const port = process.env.port || process.env.npm_config_port || 9527 // 开发服务器端口

module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    // 性能优化配置
    hot: true,  // 启用热更新
    compress: true,  // 启用gzip压缩
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    },
    // 减少轮询开销
    watchOptions: {
      poll: false,  // 不使用轮询，提升性能
      aggregateTimeout: 300,  // 文件变动后多久才重新构建
      ignored: /node_modules/  // 忽略node_modules
    }
  },
  
  // 性能优化配置
  configureWebpack: {
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    // 代码分割优化
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial' // 只打包初始依赖的第三方
          },
          elementUI: {
            name: 'chunk-elementUI', // 单独拆分 elementUI
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/
          },
          echarts: {
            name: 'chunk-echarts', // 单独拆分 echarts，减少主包体积
            priority: 20,
            test: /[\\/]node_modules[\\/]_?echarts(.*)/
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'),
            minChunks: 3, // 最小共用次数
            priority: 5,
            reuseExistingChunk: true
          }
        }
      },
      // 运行时代码单独打包，提升缓存效率
      runtimeChunk: {
        name: 'runtime'
      }
    },
    // 性能提示
    performance: {
      hints: false,
      maxAssetSize: 512000,
      maxEntrypointSize: 512000
    }
  },
  
  chainWebpack(config) {
    // 预加载
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // 预取
    config.plugins.delete('prefetch')

    // 开发环境优化：缓存loader
    if (process.env.NODE_ENV === 'development') {
      // Vue loader 缓存
      config.module
        .rule('vue')
        .use('cache-loader')
        .loader('cache-loader')
        .options({
          cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/cache-loader'),
          cacheIdentifier: 'cache-loader'
        })
      
      // Babel loader 缓存
      config.module
        .rule('js')
        .use('babel-loader')
        .loader('babel-loader')
        .tap(options => {
          return {
            ...options,
            cacheDirectory: true,
            cacheCompression: false
          }
        })
      
      // 编译优化：只编译变更的文件
      config.cache({
        type: 'filesystem',
        cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack')
      })
    }

    // 设置 svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // 生产环境配置
    config.when(process.env.NODE_ENV !== 'development', config => {
      config
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [{
          inline: /runtime\..*\.js$/
        }])
        .end()
      
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          elementUI: {
            name: 'chunk-elementUI',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/
          },
          echarts: {
            name: 'chunk-echarts',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?echarts(.*)/
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'),
            minChunks: 3,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      })
      
      config.optimization.runtimeChunk('single')
    })
  }
}
