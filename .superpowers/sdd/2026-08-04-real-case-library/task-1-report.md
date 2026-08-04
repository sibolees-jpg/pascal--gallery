# Task 1 报告：可追溯的真实案例数据

状态：DONE_WITH_CONCERNS

## 读取资料

- 已逐项读取 `/Users/sli001/Desktop/xu/` 中的 11 份 PPTX 与 1 份 DOCX，提取可验证的项目名称、时间、地点、工作范围与方案产出。
- 已检查 2 份 PDF，并尝试文本及预览提取；当前环境未取得可核验的正文/预览，未采用其内容或图片。
- 已检查旧版 `xu中原百货设计理念.ppt` 的文件类型和 Office 元数据；现有工具无法可靠抽取正文，未采用其内容。
- 同目录 MP4 未作为任务要求的 Office 文档纳入案例资料。
- `/Volumes/Elements/项目/` 未挂载，未读取或修改。

完整的逐文件审计、采用事实、排除原因与资料缺口见 `docs/case-source-audit.md`。

## 生成案例

创建 `data/cases.json`，其中有 10 条公开边界内的项目/方案记录：

1. 棉三雕塑
2. 和光美术馆
3. 柏典天津样板间艺术品方案
4. 无锡 NEW 空间
5. 团泊洼文旅项目
6. 中新生态城
7. 罗浮宫艺术、展览与活动策划
8. 团泊艺术空间
9. 天津中原百货美陈提升
10. 全国青少年无人机大赛天津 IP 方案

所有记录包含 Task 1 要求的详情字段，并额外用源文件名建立可追溯关联。绝对本机路径仅保留在内部审计文件，未写入公开数据。所有 `images` 均为空数组：现有资料中的项目图、概念图、作品图、参考图或网络图均未取得可靠的公开授权/项目归属确认，因此未复制任何图片。

## 测试证据

- RED：使用 Codex 随附 Node 运行 `tests/case-data.test.mjs`，在 `data/cases.json` 不存在时按预期以 `ENOENT` 失败。
- GREEN：同一测试在创建数据后通过，结果为 1 passed、0 failed。
- 结构校验：确认 10 条记录均含接口所列字段，`process`、`deliverables` 与 `images` 均为数组。
- `git diff --check` 通过。
- 系统 PATH 未提供 `node` 命令；测试使用 Codex 随附 Node 二进制完成。

## 提交

提交信息：`Add sourced public case records`。

## 疑虑

1. `publicStatus: "public"` 表示本数据已按公开边界整理，不是客户或权利人的发布授权证明；上线前仍应确认每个项目名称、客户信息和图片的公开许可。
2. 多数来源是概念案、策划案或工作计划，数据已明确使用“方案”表述，未声称实施或效果。
3. 外接盘未挂载；恢复后应只读补充完成状态、公开授权和确属项目的图片。

## Round 1 review fixes

- 已从 `data/cases.json` 的全部 10 条公开案例移除 `sourceFiles`；完整来源路径仅保留在 `docs/case-source-audit.md`。
- 审计口径已更新：用户提供资料用于网站，`publicStatus: "public"` 表示项目名称和审计后的文字事实获准进入本站公开数据集；这不确认任何图片权利，所有图片继续保持未使用状态。
- 已移除没有租赁职责证据的全部 `art_and_space_rental` 标签，移除罗浮宫案例中没有销售/配置职责证据的 `art_sales` 标签，并移除团泊洼案例中没有制作施工职责证据的 `landscape_art` 标签；柏典天津保留 `art_sales`，因为资料明确为样板间艺术品点位及作品配置方案。
- 已扩展 `tests/case-data.test.mjs`：逐条校验全部必填字段及类型、五项已知服务编号、必填字符串数组、图片对象的 `src`/`alt`/`caption` 字段，以及公开数据不含 `sourceFiles`。
- TDD 证据：扩展测试在修改数据前因 `mian-san-sculpture` 含 `sourceFiles` 按预期失败；移除后通过（1 passed、0 failed）。`git diff --check` 通过。
