import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig(() => {
  return {
    plugins: [vue()],
    build: {
      // 为了方便调试我开启了sourcemap
      sourcemap: true,
      // lib 打包
      lib: {
        entry: 'src/index.js',
        name: 'named',
        formats: ['es', 'umd', 'cjs'],
        fileName: (format) => `vui.${format}.js`
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          exports: 'named',
          globals: {
            vue: 'Vue'
          },
        }
      },
      // 根据环境控制是否压缩代码 值为 'terser' 或者不配置 minify 就是压缩代码   当我们配置为false则不是压缩代码了
      // minify: 'terser'
    },
  }
})