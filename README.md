# payfor工大 · 背屏付款码

翻过手机，就能在小米背屏上出示校园付款码。你可以选择在亮屏时显示余额，进入息屏显示后余额会隐藏。付款码过期或手机端停止共享时，背屏会清空。

<p align="center"><img src="docs/images/rear-device.png" width="310" alt="小米 17 Pro 背屏实机，展示演示二维码、条形码和 ¥66.66"></p>

*小米 17 Pro 实机效果。图中的码和金额均为演示内容。*

## 安装前

- 手机要支持可执行的背屏主题。下面的步骤在小米 17 Pro 上验证过，其他机型或固件的导入方式可能不同。
- 手机上的宿主应用需要支持导入 HFP，并能向背屏主题提供动态付款码。

## 安装

1. 从 [Releases](../../releases) 下载 HFP 和 `HFUT-Campus-Rear-OLED.zip`。HFP 装在手机应用里，ZIP 用于系统背屏主题，保持压缩包原样。
2. 在手机应用的「设置 → 插件管理 → 从文件导入」选中 HFP，核对权限后确认。
3. 按下一节应用 ZIP。已经装过自定义背屏主题的用户，可以直接参考 [唯梦倾城的社区教程「方式 A（AI 壁纸）」](https://github.com/wmqc97/mi-backscreen-themes?tab=readme-ov-file#-安装方法)。
4. 回到背屏插件页，打开「读取权限」并按页面指引授权，然后开启背屏显示。如果需要余额，在「显示选项」打开。
5. 翻到背屏，检查付款码是否刷新。如果开启了余额，再确认它在亮屏时出现、息屏显示时隐藏。

恢复默认背屏时，在系统主题设置重新选用原壁纸，并在宿主关闭「背屏显示」。

### 小米 17 Pro：用 AI 壁纸预览应用主题

以下是小米 17 Pro 实测过的路径。准备一台装有 [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools) 的电脑和一根数据线，开启 USB 调试，连接手机并在手机上确认授权。在 ZIP 所在目录打开 Bash（Windows 可用 Git Bash）。

1. 在手机「主题」生成一条新的 3D 卡通 AI 壁纸。到 AI 壁纸历史里打开这一条预览，先不要点「应用」。
2. 在电脑执行下面的命令，按修改时间找刚生成的目录。若无法确认是哪一条，先停下来，不要替换其他壁纸的文件。

~~~sh
adb shell ls -lt /sdcard/Android/data/com.android.thememanager/files/MIUI/.ai_wallpaper/maml/
~~~

3. 把下面的 `CARRIER` 改为刚确认的目录名。先备份原文件，命令成功且备份非空后才会替换。ZIP 不解压，手机上的文件仍叫 `rearscreen`。

~~~sh
target=/sdcard/Android/data/com.android.thememanager/files/MIUI/.ai_wallpaper/maml/CARRIER/rearscreen
adb pull "$target" ./original-rearscreen &&
  test -s ./original-rearscreen &&
  adb push ./HFUT-Campus-Rear-OLED.zip "$target"
~~~

4. 上传成功后，在原来的手机预览页点「应用」。等待应用完成，然后用下面的命令还原历史记录里的原文件。若应用失败，也还原同一份备份。

~~~sh
adb push ./original-rearscreen "$target"
~~~

已应用的背屏主题会保留。确认背屏仍显示新主题后即可关闭 USB 调试。如果系统没有相同入口、目录无法访问，或备份失败，请保留现有主题，参考社区教程核对适用于该固件的导入方式。

## 构建

需要 Node.js 22.2 或更新版本。`npm run build` 在 `dist/` 生成主题 ZIP。构建 HFP 时，把 `HFP_SIGN_DIR` 指向发布者的 RSA 签名目录，再运行 `npm run build:hfp`。
