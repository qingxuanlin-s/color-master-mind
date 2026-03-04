# Color Master Mind

一个可在浏览器运行的颜色推理游戏（Mastermind 风格）。

## 游戏规则

- 每关目标：在 `7` 步内猜中 `4` 个隐藏颜色。
- 输入方式：将下方颜色按钮拖动到上方 4 个空位（手机可点选颜色后点空位填入）。
- 反馈规则：
  - 绿色下划线：颜色和位置都正确。
  - 白色下划线：颜色正确但位置错误。
- 通关后会触发灯效，并自动进入下一关。

## 操作说明

- `开始游戏`：从第 1 关开始。
- `清空填空`：清空当前步 4 个位置。
- `提交本次猜测`：提交当前组合并获取反馈。

## 本地运行

直接双击打开 `index.html` 即可。

更推荐起本地服务：

```bash
cd "/Users/admin/Documents/New project"
python3 -m http.server 8080
```

浏览器访问：`http://localhost:8080`

## 手机访问（同一局域网）

1. 电脑执行上面的本地服务命令。
2. 手机和电脑连接同一 Wi-Fi。
3. 手机浏览器打开：`http://<电脑局域网IP>:8080`

## GitHub Pages 部署

本仓库已包含自动部署工作流：`.github/workflows/pages.yml`。

1. 推送到 GitHub：

```bash
git push origin master
```

2. 仓库设置里选择 `Settings -> Pages -> Source: GitHub Actions`。
3. 等待 `Actions` 中 `Deploy Static Site to GitHub Pages` 运行完成。

## 项目结构

- `index.html`：页面结构
- `styles.css`：界面样式与动画
- `game.js`：核心玩法逻辑
- `.github/workflows/pages.yml`：GitHub Pages 自动部署
