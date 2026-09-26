import re

with open('Frontend/src/context/InventoryContext.jsx', 'r') as f:
    content = f.read()

# Replace the conflict block keeping both sides
content = re.sub(
    r'<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> origin/Frontend',
    r'\1\n\2',
    content,
    flags=re.DOTALL
)

with open('Frontend/src/context/InventoryContext.jsx', 'w') as f:
    f.write(content)

