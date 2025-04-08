#!/bin/bash

# 使用方式：./generate-image-json.sh 路徑
# 範例：    ./generate-image-json.sh ./images/memes

# 取得參數：目標資料夾
TARGET_DIR=${1:-"./images"}  # 如果沒給參數，就預設用 ./images

# 輸出檔名
OUTPUT_FILE="$TARGET_DIR/images.json"

# 取得所有圖片的相對路徑（過濾掉副資料夾）
FILES=$(find "$TARGET_DIR" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.png' -o -iname '*.jpeg' -o -iname '*.webp' \) | sort)

# 轉換成 JSON 陣列格式
echo "[" > "$OUTPUT_FILE"
FIRST=true
for FILE in $FILES; do
  REL_PATH="${FILE#./}"  # 去除前綴 ./，保留相對路徑
  if $FIRST; then
    FIRST=false
  else
    echo "," >> "$OUTPUT_FILE"
  fi
  echo "  \"${REL_PATH}\"" >> "$OUTPUT_FILE"
done
echo "]" >> "$OUTPUT_FILE"

echo "✅ 已輸出至 $OUTPUT_FILE"
