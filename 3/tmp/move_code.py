import re

with open("src/components/ExamManagement.tsx", "r") as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if '{editingTab === "试卷管理" && (' in line:
        start_idx = i
        break

end_idx = -1
if start_idx != -1:
    stack = 0
    in_block = False
    for i in range(start_idx, len(lines)):
        line = lines[i]
        # minimal stack tracking just by reading braces would be tough...
        pass
