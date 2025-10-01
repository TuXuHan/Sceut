# Guest Quiz Flow - 未注册用户测验流程

## 功能概述

实现了未注册用户可以先做部分测验，注册后继续完成剩余问题的功能。

## 测验题目划分

### 未注册用户（Guest）- 4题
访问 `/quiz` 无需登录，完成以下问题：
1. **第1题**: gender (性别光谱)
2. **第2题**: scent (香调家族)
3. **第6题**: mood (情绪氛围)
4. **第7题**: occasion (使用场合)

### 注册用户 - 剩余3题
注册并登录后，访问 `/quiz-continue` 完成：
1. **第3题**: complexity (香气复杂度)
2. **第4题**: intensity (香气强度)
3. **第5题**: character (风格特质)

## 用户流程

### 流程A：未注册用户完整流程

1. **从主页开始** `/`
   - 点击"開始您的香氣之旅"按钮
   - 无需登录即可开始测验
   - 跳转到 `/quiz`

2. **访问测验页面** `/quiz`
   - 无需登录即可访问
   - 看到标题"探索您的香气偏好"
   - 完成4个问题（1、2、6、7题）

3. **查看部分报告** `/partial-report`
   - 自动跳转到部分报告页面
   - 显示已完成的4题偏好分析
   - 深度分析和AI推荐显示为"已锁定"状态
   - 底部显示大按钮："立即注册，解锁完整报告"

4. **点击注册按钮**
   - 跳转到注册页面 `/register`
   - 页面顶部显示提示："✨ 您的测验进度已保存！注册后将继续完成剩余问题"

5. **完成注册**
   - 填写姓名、邮箱、密码
   - 注册成功后收到验证邮件
   - 验证邮箱后跳转到登录页面

6. **登录账号**
   - 在登录页面 `/login` 输入账号密码
   - 系统自动检测到有未完成的guest测验
   - 登录成功后自动跳转到 `/quiz-continue`

7. **继续完成测验** `/quiz-continue`
   - 页面标题："完成您的香气测验"
   - 提示："还剩 3 个问题"
   - 完成剩余3个问题（3、4、5题）

8. **查看完整报告** `/recommendations`
   - 自动跳转到完整推荐页面
   - 显示全部7题的偏好分析
   - 显示AI生成的完整推薦和匹配度
   - 所有数据已保存到用户账号

### 流程B：已有账号用户

1. **直接登录** `/login`
   - 输入账号密码登录
   - 如果有guest答案，自动跳转到 `/quiz-continue`
   - 如果没有，正常跳转到会员中心

2. **完成完整测验** `/quiz`
   - 已登录用户访问quiz页面
   - 直接完成全部7题
   - 跳转到完整推荐页面 `/recommendations`

### 流程C：Guest用户直接登录

如果guest用户已经有账号，在partial-report页面可以：

1. 点击"已有账号？立即登入"
2. 登录后自动检测guest答案
3. 跳转到 `/quiz-continue` 继续完成测验

## 数据存储

### Guest答案存储（localStorage）
- **Key**: `sceut_guest_quiz_answers`
- **内容**: { gender, scent, mood, occasion }
- **时效**: 7天（可通过 `GuestStorage.isGuestQuizExpired()` 检查）

### 注册用户答案存储
- **localStorage**: `sceut_{userId}_quiz_answers`
- **Supabase**: `user_profiles.quiz_answers`
- **内容**: 完整7题答案

### 数据迁移
注册后，guest答案会：
1. 与续答答案合并
2. 保存到用户账号（localStorage + Supabase）
3. 清除guest答案

## 技术实现

### 新增文件

1. **`/lib/guest-storage.ts`**
   - Guest用户数据管理工具类
   - 提供保存、读取、清除guest答案的方法
   - 提供答案过期检查

2. **`/app/partial-report/page.tsx`**
   - 部分报告页面
   - 显示guest用户的4题答案分析
   - 显示锁定的深度分析和AI推荐
   - CTA按钮引导注册

3. **`/app/quiz-continue/page.tsx`**
   - 续答测验页面
   - 仅限已登录用户访问（AuthGuard）
   - 完成剩余3题
   - 合并答案并保存到用户账号

### 修改文件

1. **`/app/page.tsx`** (主页)
   - 修改"開始您的香氣之旅"按钮，无论是否登录都跳转到 `/quiz`
   - 更新"簡單三步驟"文案，反映新的用户流程
   - 移除不必要的认证检查

2. **`/app/quiz/page.tsx`**
   - 移除认证要求，允许guest访问
   - 根据登录状态显示不同题目（guest: 4题 / registered: 7题）
   - Guest完成后跳转到 `/partial-report`
   - 注册用户完成后跳转到 `/recommendations`

3. **`/app/register/page.tsx`**
   - 检测guest答案，显示提示信息
   - 注册成功后根据是否有guest答案决定跳转

4. **`/app/login/page.tsx`**
   - 登录后检查guest答案
   - 如果有guest答案，跳转到 `/quiz-continue`
   - 如果没有，正常跳转到会员中心或指定页面

## URL参数

### 注册页面
- `?from=partial-report` - 从部分报告页面来的用户

### 登录页面
- `?continue=quiz` - 登录后继续测验
- `?redirect=/path` - 登录后跳转到指定页面
- `?message=文字` - 显示提示信息

## 测试清单

### Guest用户流程测试
- [ ] 未登录访问 `/quiz` 可以进入
- [ ] Guest用户只看到4个问题
- [ ] 完成后跳转到 `/partial-report`
- [ ] 部分报告正确显示4题答案
- [ ] 深度分析显示为锁定状态
- [ ] 点击注册按钮跳转到注册页面
- [ ] 注册页面显示测验进度提示

### 注册流程测试
- [ ] 注册成功后能正常验证邮箱
- [ ] 登录后跳转到 `/quiz-continue`
- [ ] 续答页面显示剩余3题
- [ ] 完成后跳转到完整推荐页面
- [ ] Guest答案被清除

### 已注册用户测试
- [ ] 登录用户访问 `/quiz` 看到全部7题
- [ ] 完成后跳转到完整推荐页面
- [ ] 答案保存到数据库

### 数据持久化测试
- [ ] Guest答案保存在localStorage
- [ ] 刷新页面后guest答案仍然存在
- [ ] 注册后guest答案正确合并
- [ ] 完整答案保存到用户账号

## 注意事项

1. **Guest答案过期处理**
   - Guest答案有7天有效期
   - 可通过 `GuestStorage.isGuestQuizExpired()` 检查
   - 过期后需要重新测验

2. **数据迁移**
   - 注册后guest答案会自动清除
   - 确保合并后的完整答案已保存再清除

3. **错误处理**
   - 如果没有guest答案访问 `/quiz-continue`，会重定向到 `/quiz`
   - 如果没有guest答案访问 `/partial-report`，会重定向到 `/quiz`

4. **认证保护**
   - `/quiz-continue` 需要登录才能访问
   - `/partial-report` 仅限guest用户（已登录会跳转）

## 开发者API

### GuestStorage

\`\`\`typescript
// 保存guest答案
GuestStorage.saveGuestQuizAnswers({ gender, scent, mood, occasion })

// 读取guest答案
const answers = GuestStorage.getGuestQuizAnswers()

// 检查是否有guest答案
const hasAnswers = GuestStorage.hasGuestQuizAnswers()

// 清除guest答案
GuestStorage.clearGuestQuizAnswers()

// 检查是否过期
const isExpired = GuestStorage.isGuestQuizExpired()
\`\`\`

### 页面路由

- `/quiz` - 测验入口（guest: 4题 / registered: 7题）
- `/partial-report` - 部分报告（guest only）
- `/quiz-continue` - 续答测验（registered only）
- `/recommendations` - 完整推荐（registered only）
