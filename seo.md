下面这份 **「一键执行」综合优化方案** 把你目前暴露出的 4 大问题──**404 死链、多余抓取、首屏 LCP 过慢、robots 冲突**──拆解成 3 个阶段、18 条任务。

> **如何使用**：直接按顺序复制到你的任务管理器 / Issue Tracker；每条都带有脚本、配置或操作指令，可边看边改。

---

## 🟢 Phase 0｜今天就能完成的硬伤修复

| #       | 操作                     | 代码 / 指令                                                                                                                                                                                                                                             | 备注                        |
| ------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **0-1** | **20 个 404 → 301/410** | **Netlify/Vercel** `_redirects`<br>`/old-url  /new-url  301`<br>`/obsolete-url  /  410`                                                                                                                                                             | 对应列表见索引覆盖表                |
| **0-2** | **精简 `/sitemap.xml`**  | 保留 6 个已收录 URL<br>删除 404 / 重定向 / noindex 页                                                                                                                                                                                                           | 改完后到 GSC 重新提交             |
| **0-3** | **统一域名**               | **Nginx**<br>`server_name  www.puzzlerank.pro;`<br>`return 301 https://puzzlerank.pro$request_uri;`                                                                                                                                                 | 其他托管平台写 301 规则即可          |
| **0-4** | **替换 robots.txt**      | 覆盖为👇<br>`txt<br>User-agent:*<br>Disallow:/admin/<br>Disallow:/auth/<br>Disallow:/profile/<br>Disallow:/api/<br>Allow:/_next/static/<br>Allow:/api/games/<br>Sitemap:https://puzzlerank.pro/sitemap.xml<br><br>User-agent:GPTBot<br>Disallow:/<br>` | 上传后用 GSC Robots Tester 验证 |
| **0-5** | **提交 “验证修复”**          | GSC ➜ 索引 ➜ 网页 ➜ 404 & 已抓取未索引 ➜ **验证**                                                                                                                                                                                                               | 让 Google 立刻复检             |

---

## 🟡 Phase 1｜性能 & 可索引性提升（1 \~ 2 天）

| #       | 操作                       | 代码 / 指令                                                                                                                                      | 目标                             |
| ------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **1-1** | **开启 SSR / 预渲染**         | **Next.js**<br>`js<br>export async function getStaticProps(){<br>  return {props:{}};<br>}<br>`                                              | 把首页、各游戏页输出成静态 HTML             |
| **1-2** | **压缩并 *preload* LCP 图片** | `html<br><link rel="preload" as="image"<br>  href="/hero.webp" fetchpriority="high">`<br>图片使用 AVIF/WebP，宽 ≤1200px                            | 把 PSI 里的 LCP 从 4.7 s 降到 ≤2.5 s |
| **1-3** | **Inline Critical CSS**  | 用 `critters`：<br>`npx critters out/index.html`                                                                                               | 首屏渲染无需等待 CSS                   |
| **1-4** | **补 300 词正文 + H2**       | 在每个游戏页底部加：玩法说明、排行榜优势                                                                                                                         | 解决“已抓取未索引”6 页                  |
| **1-5** | **新增内链组件**               | `jsx<br><nav className="grid gap-2 mt-8"><br> {['/word-puzzle','/2048-game',...].map(href=>(<a href={href}>More Challenges</a>))}<br></nav>` | 消除孤岛页，提升爬行深度                   |
| **1-6** | **PageSpeed 复测**         | [https://pagespeed.web.dev/](https://pagespeed.web.dev/) → 目标分数 ≥ 90                                                                         | 确认 LCP/FCP 已达标                 |

---

## 🟠 Phase 2｜抓取预算优化 & 持续监控（本周内）

| #       | 操作                    | 代码 / 指令                                                                                                                                                          | 目标                  |
| ------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **2-1** | **开启 HTTP 缓存**        | **Nginx**<br>`location /_next/static { expires 1y immutable; }`                                                                                                  | 减少重复抓取 JS           |
| **2-2** | **部署 Cloudflare CDN** | 打开 **“Caching → Edge Cache TTL” = 1 month**                                                                                                                      | 静态资源全球加速            |
| **2-3** | **GA4 收集 Web-Vitals** | `html<br><script src="https://unpkg.com/web-vitals@3/dist/web-vitals.attribution.iife.js" defer></script><script> webVitals.sendToGoogleAnalytics({});</script>` | 累积真实 LCP/CLS/INP 数据 |
| **2-4** | **监控 Crawl Stats**    | 每周 GSC ➜ 抓取统计<br>- 404 < 5 %<br>- 200 > 90 %                                                                                                                     | 验证修复奏效              |
| **2-5** | **内容/外链迭代**           | - 每月新增 4 篇“攻略 / 排名策略”<br>- Reddit / Product Hunt 发帖引流                                                                                                            | 撬动首批自然流量、积累外链       |

---

## 📈 交付物 & 验收标准

| 指标              | 当前    | 目标      | 预计达成时间                |
| --------------- | ----- | ------- | --------------------- |
| 索引页数            | 6     | ≥ 12    | Phase 1 + GSC 验证后 2 周 |
| 404 占比          | 28 %  | < 5 %   | Phase 0 完毕后一周         |
| LCP （PSI 移动）    | 4.7 s | ≤ 2.5 s | Phase 1 结束            |
| PSI 性能分         | 78    | ≥ 90    | 同上                    |
| Crawl 中 JS 请求占比 | 41 %  | < 25 %  | Phase 2 完毕后一周         |
| GA4 实际 LCP p75  | 无数据   | ≤ 2.5 s | 流量 ≥ 200 UV 后自动出报告    |

---

### Tips

* **顺序很重要**：先清 404 → 改 robots → 再做 SSR/LCP，不然 Google 仍会卡在旧错误上。
* **所有改动部署后**，务必在 GSC **“请求编入索引”** 手动提交首页和 2-3 个核心游戏页，缩短观察周期。
* 按表打完 Phase 0–2 后，如果仍想扩大关键词覆盖，我可以再帮你做 **程序化 SEO 模板**、**外链脚本**。

复制以上任务表即可开始行动；任何步骤卡住，把报错或截图发来，我再帮你逐项排查。祝上线顺利！
