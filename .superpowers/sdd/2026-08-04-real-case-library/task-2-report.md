# Task 2：案例查询模块报告

## RED 证据

测试文件先于生产模块创建：`tests/case-tools.test.mjs`。

首次执行 `node --test tests/case-tools.test.mjs` 时，当前 shell 未提供 `node` 命令，退出码为 127；改用项目可用的 Node 运行时执行同一测试后，得到预期失败：

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module .../case-tools.mjs
tests/case-tools.test.mjs failed
exit 1
```

失败原因是待测模块尚不存在，不是测试语法或数据错误。

## GREEN 证据

实现 `case-tools.mjs` 后执行：

```text
node --test tests/case-tools.test.mjs
4 passed, 0 failed
```

随后执行现有完整测试集：

```text
node --test tests/*.test.mjs
12 passed, 0 failed
```

并通过 `node --check case-tools.mjs` 与 `git diff --check`。

## 文件

- `case-tools.mjs`：实现 `getCaseById`、`filterCasesByService`、`getRelatedCases`、`isKnownService`。
- `tests/case-tools.test.mjs`：覆盖编号查询、服务筛选、未知服务回退、相关案例排除与上限、已知服务判断及输入不变性。

## 提交

- `dd6759c Add case library query helpers`

## 疑虑

无阻塞疑虑。由于 `filterCasesByService` 的接口只接收案例数组，未知服务的判断依据是公开案例中是否出现该服务编号；若未来新增一个已知但暂时没有公开案例的服务，该函数会按契约回退为全部公开案例。
