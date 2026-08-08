import re, os

root = r"C:\Users\Aman Mishra\MySystem\02_Work\Code\OTSD\one-tool"

# Build kebab→PascalCase mapping from current .tsx files in app/components
tsx_kebab_to_pascal = {}
for dirpath, dirnames, filenames in os.walk(os.path.join(root, 'app', 'components')):
    dirnames[:] = [d for d in dirnames if d not in ('node_modules', '.next')]
    for fname in filenames:
        if not fname.endswith('.tsx'):
            continue
        base = fname[:-4]
        if base and base[0].isupper():
            # Convert PascalCase to kebab-case
            kebab = re.sub(r'(?<=[a-z0-9])(?=[A-Z])', '-', base).lower()
            if kebab != base:
                tsx_kebab_to_pascal[kebab] = base

print(f"Found {len(tsx_kebab_to_pascal)} mappings")

# Update ToolLoader.tsx
fpath = os.path.join(root, 'app', 'components', 'tools', 'ToolLoader.tsx')
with open(fpath, 'r', encoding='utf-8') as f:
    content = f.read()

original = content

def replace_import(m):
    path = m.group(1)
    parts = path.rsplit('/', 1)
    if len(parts) == 2:
        last = parts[1]
        if last in tsx_kebab_to_pascal:
            return "import('" + parts[0] + "/" + tsx_kebab_to_pascal[last] + "')"
    return m.group(0)

content = re.sub(r"import\('(@/app/components/[^']+)'\)", replace_import, content)

if content != original:
    with open(fpath, 'w', encoding='utf-8', newline='') as f:
        f.write(content)
    print("Updated ToolLoader.tsx")
    orig_lines = original.split('\n')
    new_lines = content.split('\n')
    changed = 0
    for i, (o, n) in enumerate(zip(orig_lines, new_lines)):
        if o != n:
            print(f"  Line {i+1}: {o.strip()}")
            print(f"         -> {n.strip()}")
            changed += 1
    print(f"Total lines changed: {changed}")
else:
    print("No changes needed")
