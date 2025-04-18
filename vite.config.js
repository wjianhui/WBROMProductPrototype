import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// 获取仓库名称，用于GitHub Pages部署
// 例如，如果您的GitHub仓库是 username/ops-platform，那么base就是'/ops-platform/'
// 如果是在本地开发环境，则使用'/'
var base = process.env.NODE_ENV === 'production' ? '/WBROMProductPrototype/' : '/';
export default defineConfig({
    plugins: [vue()],
    base: base, // 设置部署的基本路径
});
