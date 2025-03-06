#!/bin/bash

# 此脚本帮助查找和更新导入路径

# 查找所有从旧路径导入的文件
echo "查找从旧路径导入的文件..."
echo "=========================="

# 查找从types/exam导入的文件
echo "从types/exam导入的文件:"
grep -r "from ['\"].*\/types\/exam['\"]" --include="*.ts" --include="*.tsx" .

# 查找从types/question导入的文件
echo -e "\n从types/question导入的文件:"
grep -r "from ['\"].*\/types\/question['\"]" --include="*.ts" --include="*.tsx" .

# 查找从types/academic-journey导入的文件
echo -e "\n从types/academic-journey导入的文件:"
grep -r "from ['\"].*\/types\/academic-journey['\"]" --include="*.ts" --include="*.tsx" .

# 查找从types/competency导入的文件
echo -e "\n从types/competency导入的文件:"
grep -r "from ['\"].*\/types\/competency['\"]" --include="*.ts" --include="*.tsx" .

# 查找从types/indicator导入的文件
echo -e "\n从types/indicator导入的文件:"
grep -r "from ['\"].*\/types\/indicator['\"]" --include="*.ts" --include="*.tsx" .

# 查找从types/record导入的文件
echo -e "\n从types/record导入的文件:"
grep -r "from ['\"].*\/types\/record['\"]" --include="*.ts" --include="*.tsx" .

# 查找从types/models导入的文件
echo -e "\n从types/models导入的文件:"
grep -r "from ['\"].*\/types\/models['\"]" --include="*.ts" --include="*.tsx" .

echo -e "\n更新指南:"
echo "=========================="
echo "请使用以下替换规则更新导入路径:"
echo "1. @/types/exam -> @/features/exam-management/types"
echo "2. @/types/question -> @/features/exam-management/question-types"
echo "3. @/types/academic-journey -> @/features/academic-journey/types"
echo "4. @/types/competency -> @/features/competency-wheel/types"
echo "5. @/types/indicator -> @/features/academic-standards/types"
echo "6. @/types/record -> @/features/mentor-system/types"
echo "7. @/types/models/xxx -> @/shared/types/models/xxx"
echo "8. @/lib/types -> 根据实际情况替换为@/shared/types或特定feature的types" 