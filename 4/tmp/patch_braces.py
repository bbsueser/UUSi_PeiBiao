import sys

filepath = "/src/components/ExperimentEnvironmentClient.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

target = "目前 Modbus 主机正常运转，正在侦听以 GPIO_PIN 为索引的所有传感器上部总线报文。</p>\n                   </div>\n                 )}"
replacement = "目前 Modbus 主机正常运转，正在侦听以 GPIO_PIN 为索引的所有传感器上部总线报文。</p>\n                   </div>\n                 )}</>)}"

if target in text:
    print("Found! Replacing standard unix newline target...")
    text = text.replace(target, replacement)
else:
    # try with windows carriage return
    win_target = target.replace("\n", "\r\n")
    win_replacement = replacement.replace("\n", "\r\n")
    if win_target in text:
        print("Found! Replacing windows CRLF target...")
        text = text.replace(win_target, win_replacement)
    else:
        print("Error: Target code segment not found in file content!", file=sys.stderr)
        sys.exit(1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)

print("Modification complete.")
