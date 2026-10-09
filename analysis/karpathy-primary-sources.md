# Karpathy 相关原始来源核验

核验日期：2026-10-09。范围：为两个本地 Skill 的比较确定可引用的 Karpathy 观点；本笔记不代表已确认用户所指的具体发言，也不改动两个 Skill。

## 已核验：项目作者明确指向的来源

`answer-me-with-html` 官方 README 的 [Background](https://github.com/QingYunA/answer-me-with-html#background) 明确链接到 [Karpathy 的 X 帖子](https://x.com/karpathy/status/2105819303471976479)。项目作者把它概括为：LLM 承担更多工作后，人理解其输出会成为难点，图或网页比长段文字更容易吸收。README 的视频章节还将讲解视频描述为该理解阶梯的一环。

这是**对项目作者意图的一手证据，但对 Karpathy 原话仍是转述**。不能把 README 的概括加引号当成 Karpathy 原文，也不能断言作者的工具就是 Karpathy 唯一认可的实现。

官方 README 同时说明项目自己的实现取舍：模型写 Markdown 内容，CLI 承担布局和绘图。这个“内容与渲染分工”是项目设计，不能仅凭该引用归为 Karpathy 提出的原则。[官方 README](https://github.com/QingYunA/answer-me-with-html)

## 无法获取：上述 X 原帖全文

浏览工具直接访问 `x.com/karpathy/status/2105819303471976479` 返回 403；twitter.com 同帖与第一方公开嵌入端点也未返回可读正文。因此本次**没有逐字核验原帖全文、完整语境或原帖发布日期**。

搜索结果中有多篇二手转述，但没有把它们当作技术论证的原始证据，也没有据此构造 Karpathy 的完整理论。README 的 GitHub main 页面可读，取得当前 commit 的 API 尝试失败，故此处链接是可变的 main 页面，不是固定快照。

## 已核验：Karpathy 本人可读的补充观点

Karpathy 自己维护的 [fave tweets wall](https://karpathy.ai/tweets.html) 收录其 2020-11-07 的学习建议：深入完成具体项目，按需要学习；把所学用自己的话讲授或总结。页面附有[原推文链接](https://twitter.com/karpathy/status/1325154823856033793)。前者是本次实际读到的第一方内容，后者仅为其提供的来源定位。

同页收录的 2022-04-16 发言强调逐渐增加模型复杂度、检查变量在极限情形下的行为、追求简单而有力的解法。[Karpathy 的自选推文页](https://karpathy.ai/tweets.html)

这些观点支持把“可复述、可推演、能检查边界”纳入对解释质量的评价。**它们不是对这两个 Skill 的评价，也不能证明某 Skill 已产生更好的学习效果。**

## 对当前比较可用的判断框架（分析推断）

1. 如果用户指的是 README 引用的那条输出形式建议，可以考察是否降低理解成本、是否按内容选择图示/网页/交互；`answer-me-with-html` 是直接的工程化实现路线。
2. 如果问题进一步指向“形成可解释、可预测的心智模型”，应考察机制推导、具体例子、反例、边界检查以及读者能否自己复述；这些指标与本人可读的学习建议一致。
3. “更像原建议的形式”与“更可能改善某个任务的理解”是两个判断。后者需要同题、同模型、同上下文的成品比较，并让读者做解释或迁移题；只读 Skill 无法验证实际效果。
4. 不应把 Truth Model / Teaching Model、六类证据标签、deadline-qualified slack 等本地 v2 设计声称为 Karpathy 本人规范。它们可以有独立工程价值，但归因必须分开。

建议报告用语：**“按官方仓库对该帖的归纳，我暂以降低人理解模型输出的成本为比较目标；原帖全文本次未能读取。”** 用户若另有所指，应替换评判基准。
