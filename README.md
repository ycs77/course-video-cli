# Lcuas 的 ffmpeg 輔助腳本

需要事先安裝 Node.js、ffmpeg

## 下載專案

```bash
git clone https://github.com/ycs77/ffmpeg-cli-utils cli
cd cli
yarn
cd ..
```

安裝 tsx：

```bash
npm i tsx -g
```

## 下載 autosub

下載 autosub 的 alpha-win-x64-nuitka.7z 檔案，解壓至當前 `cli` 專案資料夾下

https://github.com/BingLingGroup/autosub/releases/tag/0.5.7-alpha

## 專案架構

| 資料夾     | 檔案       | 內容                                 | 備註       |
| ---------- | ---------- | ------------------------------------ | ---------- |
| *root*     | `*.mp4`    | 原始影片                             |            |
| cli        | `*.ts`     | 當前專案                             |            |
| dist       | `*.mp4`    | 後製過的影片                         |            |
| dist-mp3   | `*.mp3`    | 擷取後製影片的 mp3                   | *自動新增* |
| dist-ass   | `*.ass`    | 產生的字幕檔 (含有 `-original` 後綴) | *自動新增* |
| dist-v-ass | `*.mp4`    | 合併字幕檔的影片                     | *自動新增* |
| dist-data  | `*.wav`... | 用於機器學習                         | *自動新增* |

## 指令

### 計算總時數

```bash
cli/tool.ts all:duration
```

### mp4 轉 mp3

```bash
cli/tool.ts mp4:mp3

# 只轉換部分影片 (ex: 1-1.mp4 ~ 1-11.mp4)
cli/tool.ts mp4:mp3 1-\\d+

# 只轉換部分影片 (ex: 1-2.mp4 + 1-3.mp4 + 1-4.mp4)
cli/tool.ts mp4:mp3 1-[234]
```

### 產生字幕

```bash
cli/tool.ts sub:generate
```

### 校正字幕時間軸

```bash
cli/tool.ts sub:correct
```

### 影片合併字幕

```bash
cli/tool.ts sub:merge
```

### 建立機器學習用資料

```bash
cli/tool.ts trains-data:generate
```
