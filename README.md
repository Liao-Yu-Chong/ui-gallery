# 元件作品集 · Component Gallery

我親手打造的 UI 元件展示站,每個元件都有可互動的 live demo。
以 React + Vite + Tailwind 製作,部署於 GitHub Pages。

🔗 線上展示:`https://<your-username>.github.io/ui-gallery/`

## 目前收錄的元件

| 元件 | 說明 |
|---|---|
| 行事曆 Calendar | 月檢視,支援多日事件、拖拉移動、特殊節日、每日事件上限 |

## 本機開發

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 產生 dist/
npm run preview  # 預覽 production build
```

## 新增一個元件

1. 把元件放進 `src/components/...`
2. 在 `src/gallery/demos/<Name>Demo.tsx` 寫一個 demo
3. 到 `src/gallery/registry.tsx` 的 `components` 陣列加一筆

## 部署到 GitHub Pages

1. 建一個名為 `ui-gallery` 的 GitHub repo 並 push(若改名,請同步改 `vite.config.ts` 的 `base`)。
2. Repo → Settings → Pages → Build and deployment → Source 選 **GitHub Actions**。
3. push 到 `main` 後,`.github/workflows/deploy.yml` 會自動建置並發佈。

## 客製

- `src/App.tsx` 頂部的 `GITHUB_URL` 與 `AUTHOR` 換成你的。
- 主題色變數在 `src/index.css`(沿用 shadcn 色票)。
