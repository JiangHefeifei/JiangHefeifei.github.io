# Academic Homepage

A custom, from-scratch academic personal website — pure static HTML / CSS / JS
with a full-screen animated name intro (GSAP) and a classic left-sidebar layout.
No build step, no Jekyll. Hosted on GitHub Pages.

## File structure

```
index.html              页面骨架（结构 + 写死的 About 文字 + GSAP 引入）
assets/
  css/style.css         所有样式（主题色、明暗模式、布局、响应式）
  js/data.js            ★ 你的内容：社交链接 / News / Publications / Projects / Teaching
  js/main.js            渲染 + 交互 + GSAP 动画（一般不用动）
  img/avatar.svg        头像占位图 → 换成你的照片（见下）
  img/favicon.svg       网站小图标（改成你名字首字母）
  cv/cv.pdf             你的简历 PDF（自己放进来）
.nojekyll               告诉 GitHub Pages 不要用 Jekyll 处理
```

## 怎么改成你自己的（按这个顺序）

1. **全名 / 标题**：`index.html` 里搜 `改这里`，逐个替换（开场大字、姓名、头衔、机构、SEO）。
2. **头像**：把你的照片命名为 `avatar.jpg` 放到 `assets/img/`，再把 `index.html` 中
   `src="assets/img/avatar.svg"` 改成 `src="assets/img/avatar.jpg"`。建议正方形、≥400px。
3. **About 正文 / 研究兴趣**：直接在 `index.html` 的 `#about` 段落里改。
4. **News / 论文 / 项目 / 教学 / 社交链接**：全部在 `assets/js/data.js`，照着已有格式增删即可。
5. **CV**：把简历存为 `assets/cv/cv.pdf`。
6. **主题色**：`assets/css/style.css` 顶部 `--accent`（亮色）和 `[data-theme="dark"] --accent`（暗色）。

## 本地预览

任选一种（都不需要安装依赖）：

```bash
# Python（自带）
python3 -m http.server 8000
# 然后浏览器打开 http://localhost:8000

# 或者 VS Code 装 "Live Server" 扩展，右键 index.html → Open with Live Server
```

> 注意：直接双击 `index.html` 用 `file://` 打开也能看，但字体/部分功能用本地服务器更稳。

## 部署到 GitHub Pages（`你的用户名.github.io`）

1. 在 GitHub 新建一个仓库，名字必须是 **`<你的用户名>.github.io`**（例如 `jianghefeifei.github.io`）。
2. 在本项目目录执行：

   ```bash
   git init
   git add .
   git commit -m "Initial academic homepage"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<你的用户名>.github.io.git
   git push -u origin main
   ```

3. 仓库 **Settings → Pages → Build and deployment**：Source 选 `Deploy from a branch`，
   Branch 选 `main` / `/ (root)`，Save。
4. 等 1–2 分钟，访问 `https://<你的用户名>.github.io` 即可。以后改完
   `git add . && git commit -m "update" && git push` 就会自动更新。

## 技术说明

- 动画用 [GSAP](https://gsap.com/)（核心 + `ScrollTrigger` + `SplitText`），通过 CDN 引入。
- 已处理 `prefers-reduced-motion`（系统开启"减少动态效果"时自动关闭动画）。
- 若 GSAP CDN 加载失败，页面会优雅降级为静态可读版本，内容不会消失。
