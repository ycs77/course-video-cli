# Lcuas 的 ffmpeg 輔助腳本

## 下載

```bash
git clone https://github.com/ycs77/ffmpeg-cli-utils cli
```

## 專案架構

* `*.mp4`
* dist
  * `*.mp4`
* dist-mp3 (自動新增)
  * `*.mp3`
* dist-srt
  * `*.srt`
* dist-ass (自動新增)
  * `*.ass`
* dist-v-ass (自動新增)
  * `*.mp4`

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

### 合併字幕

```bash
tsno cli/merge_ass_to_mp4.ts
```
