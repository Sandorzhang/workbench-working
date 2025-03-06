# 类型定义迁移指南

为了优化项目结构，我们已将类型定义从根目录的`types/`文件夹迁移到更合适的位置。本指南将帮助你找到类型定义现在的位置，并更新你的导入语句。

## 类型定义的新位置

### 功能特定类型

特定功能的类型定义已移动到各自的功能模块中：

| 原始路径 | 新路径 |
|---------|-------|
| `types/exam.ts` | `features/exam-management/types.ts` |
| `types/question.ts` | `features/exam-management/question-types.ts` |
| `types/academic-journey.ts` | `features/academic-journey/types.ts` |
| `types/competency.ts` | `features/competency-wheel/types.ts` |
| `types/indicator.ts` | `features/academic-standards/types.ts` |
| `types/record.ts` | `features/mentor-system/types.ts` |

### 共享模型类型

通用的数据模型类型已移动到`shared/types/models/`目录：

| 原始路径 | 新路径 |
|---------|-------|
| `types/models/education.ts` | `shared/types/models/education.ts` |
| `types/models/school.ts` | `shared/types/models/school.ts` |
| `types/models/academic.ts` | `shared/types/models/academic.ts` |
| `types/models/competency.ts` | `shared/types/models/competency.ts` |
| `types/models/record.ts` | `shared/types/models/record.ts` |
| `types/models/mentor.ts` | `shared/types/models/mentor.ts` |
| `types/models/base.ts` | `shared/types/models/base.ts` |

### 第三方库类型定义

第三方库的类型定义已移动到`shared/types/declarations/`目录：

| 原始路径 | 新路径 |
|---------|-------|
| `types/graphology.d.ts` | `shared/types/declarations/graphology.d.ts` |
| `types/react-sigma.d.ts` | `shared/types/declarations/react-sigma.d.ts` |

### MSW相关类型

MSW模拟数据库相关的类型定义已移动到`mocks/types/`目录：

| 原始路径 | 新路径 |
|---------|-------|
| `types/db.ts` | `mocks/types/db.ts` |

## 更新导入语句

以下是如何更新导入语句的例子：

### 原来的导入

```typescript
import { Exam } from '../types/exam';
import { LearningStandard } from '../types/academic-journey';
import { School } from '../types/models/school';
```

### 新的导入

```typescript
import { Exam } from '@/features/exam-management/types';
import { LearningStandard } from '@/features/academic-journey/types';
import { School } from '@/shared/types/models/school';
```

## 集中导入

对于共享模型类型，你也可以使用集中导入方式：

```typescript
import { School, Region } from '@/shared/types';
```

这会从`shared/types/index.ts`中导入所有共享类型。

## 注意事项

1. 使用`@/`路径前缀可以从任何位置导入，而不必担心相对路径的问题
2. 功能特定的类型应该从对应的功能模块导入
3. 共享的数据模型类型应该从`shared/types`导入
4. MSW相关类型应该从`mocks/types`导入 