# Lcuas 的 ffmpeg 輔助腳本

需要事先安裝 Node.js、ffmpeg

## 下載專案

```bash
npm i tsno -g
git clone https://github.com/ycs77/ffmpeg-cli-utils cli
cd cli
yarn
cd ..
```

## 下載 autosub

下載 nuitka 的檔案，解壓至當前 `cli` 專案資料夾下

https://github.com/BingLingGroup/autosub/releases/tag/0.5.7-alpha

## 專案架構

| 資料夾     | 檔案    | 內容                                 | 備註       |
| ---------- | ------- | ------------------------------------ | ---------- |
| cli        | `*.ts`  | 當前專案                             |            |
| *root*     | `*.mp4` | 原始影片                             |            |
| dist       | `*.mp4` | 後製過的影片                         |            |
| dist-mp3   | `*.mp3` | 擷取後製影片的 mp3                   | *自動新增* |
| dist-ass   | `*.ass` | 產生的字幕檔 (含有 `-original` 後綴) | *自動新增* |
| dist-v-ass | `*.mp4` | 合併字幕檔的影片                     | *自動新增* |

## 指令

### 計算總時數

```bash
tsno cli/calc_all_times.ts
```

### mp4 轉 mp3

```bash
tsno cli/transform_dist_mp4_to_mp3.ts

# 只轉換部分影片 (ex: 1-1.mp4 ~ 1-11.mp4)
tsno cli/transform_dist_mp4_to_mp3.ts 1-\\d+
```

### 產生字幕

```bash
tsno cli/generate_subtitle.ts
```

### 合併字幕

```bash
tsno cli/merge_ass_to_mp4.ts
```
