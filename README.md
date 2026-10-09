# Explanation Skills

本项目保存解释方法、参考 skill 与可复现的本地渲染能力。

## 当前版本

- [explain-for-understanding v3.1](explain-for-understanding/SKILL.md)：以直接、直白的文字为基础，按读者任务选择短答、图文或交互模型；区分证据强度，并支持反馈与理解检查。
- [answer-me-with-html 原版](answer-me-with-html/SKILL.md)：此前从 QingYunA 官方仓库保存的参考文件，保持原样。
- [原始 v2](archive/explain-for-understanding-v2-SKILL.md)：用户提供的原文件，逐字节保留。

v3 的通用入口只加载必要方法。实时系统约束与 HTML 实现分别放在 `references/` 中，按任务读取。

## 本地使用

可以直接要求 agent 使用本项目的 `explain-for-understanding/SKILL.md`。项目目前没有安装到全局 skill 目录。

普通 HTML 使用随 v3 打包的官方渲染器，需要 Node.js 20+。从本仓库根目录运行下面的示例：

```bash
node explain-for-understanding/scripts/render.mjs render outputs/v3-window-explanation.md work/example.html
```

渲染入口会保留已有输出。经授权修订时增加 `--replace`。渲染状态保存在目标工作目录的 `work/explanation-renderer/`；自动打开浏览器与更新检查均关闭。

渲染器固定于上游 commit `19b2b5b07676d3e65c83ca9a7b6621f300b54c92`。其原始文件、MIT 许可证与校验信息位于 [vendor 目录](explain-for-understanding/scripts/vendor/answer-me-with-html/SOURCE.json)。

## 记录与示例

- [v2 与参考版的比较](analysis/comparison-2026-10-09.md)
- [v3 变更和验证边界](analysis/v3-validation-2026-10-09.md)
- [静态教学页](outputs/v3-window-explanation.html)，[可编辑草稿](outputs/v3-window-explanation.md)
- [交互模型示例](outputs/v3-capacity-demo.html)：使用教学示意参数，展示容量检查、结论边界与反馈导出。

示例不代表原 AGC/TPC 项目的实测结果。当前已完成程序验证；桌面和手机浏览器的视觉、实际剪贴板行为尚未完成验证。

## 来源与授权

`explain-for-understanding` 从一次技术解释对比中发展而来：v2 是该次讨论生成、由使用者提供的原始文件；v3/v3.1 是本项目对解释方法、渲染与反馈流程的迭代。它不是 QingYunA 的原版 skill，也不是 Karpathy 发布或认可的规范。

本项目新增的 skill、脚本、文档和示例采用 [MIT License](LICENSE)。QingYunA 的参考 skill、固定渲染器以及示例中包含的上游页面代码保留上游 MIT 授权，具体来源见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

`answer-me-with-html/` 只保存用于比较的原始 `SKILL.md`；其完整安装和引用文件请从[上游仓库](https://github.com/QingYunA/answer-me-with-html)获取。本项目的渲染入口使用自己的固定 bundle。

`analysis/` 保留开发过程中的历史比较与验证边界，其中的“当前”“本次”均指各记录写作时的状态。`work/` 中的本地测试中间文件不属于公开仓库。
