## ComplimentSquad 誇誇部隊罷免收件計數器
#### 更新圖片使用說明
1. 新增圖片至 `images/ComplimentSquad`
2. 執行 `npm run update-ComplimentSquad-images`
3. 確認檔案 `images/ComplimentSquad/images.json` 有新增圖片

## Popup 彈窗
#### 更新彈窗使用說明
1. 修改 `popup.json` 檔案
2. 範例檔案如下
    ```json
    [
      {
        "type": 1, // 圖片
        "title": "花蓮人召集令",
        "image": "images/popup/recall01.webp",
        "hashtag": [
          "花蓮",
          "緊急情況"
        ]
      },
      {
        "type": 2, // 文字
        "title": "Test",
        "contentAry": [
          {
            "title": "4/13 (日) 苗栗罷免宣講",
            "text": "我是測試我是測試我是測試我是測試我是測試我是測試我是測試我是測試我是測試我是測試我是測試我是測試我是測試"
          }
        ]
      },
      {
        "type": 3, // 影片
        "title": "花蓮人召集令",
        "video": "https://www.youtube.com/embed/m6VI17E32rc"
      }
    ]
    ```