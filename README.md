# payfor工大 · 背屏付款码

用小米背屏显示校园付款码和可选余额。亮屏时按页面设置显示余额，息屏显示期间隐藏余额。付款码过期或手机端停止共享时，主题会清空显示。

## 安装前

- 需要支持可执行背屏主题的小米手机。已验证的设备是小米 17 Pro，其他机型和固件的导入方式可能不同。
- 需要能导入 HFP、提供受保护背屏取码能力的 Android 宿主。普通图片和视频壁纸无法提供动态取码。

## 安装

1. 在本仓库的 [Releases](../../releases) 下载背屏主题 ZIP 和对应的 HFP。ZIP 保持原样。
2. 在宿主的「设置 → 插件管理 → 从文件导入」选择 HFP，核对权限后确认。
3. 通过与你当前系统匹配的背屏主题导入方式应用 ZIP。已实测的小米 17 Pro 使用「主题 → AI 壁纸历史」中的 3D 卡通预览载体。先备份原载体，在预览页暂存 ZIP 后点「应用」，再还原历史原件。系统会保留已经应用的背屏主题。手机若没有相同入口或无法备份，先保留原主题。
4. 在宿主的「背屏校园卡」开启背屏显示。按「读取权限」确认系统背屏宿主受信任；在「显示选项」管理余额显示。
5. 翻到背屏验证，确认付款码能更新。若余额仅在亮屏出现，说明息屏隐藏已生效。

恢复默认背屏时，在系统主题设置重新选用原壁纸，并在宿主关闭「背屏显示」。

### 小米 17 Pro 的 ADB 导入步骤

在主题应用生成一条新的 3D 卡通 AI 壁纸，并打开该条的预览。用 ADB 在以下目录下定位刚生成的唯一载体目录。不同设备上的目录名会变化。

~~~sh
adb shell ls -lt /sdcard/Android/data/com.android.thememanager/files/MIUI/.ai_wallpaper/maml/
~~~

将下面的 CARRIER 替换为本次生成的目录名。先验证备份成功并可以读取，再上传主题。

~~~sh
target=/sdcard/Android/data/com.android.thememanager/files/MIUI/.ai_wallpaper/maml/CARRIER/rearscreen
adb pull "$target" ./original-rearscreen
adb push ./HFUT-Campus-Rear-OLED.zip "$target"
~~~

保持在原来的预览页，在手机上点「应用」。应用完成后将备份恢复到历史目录。应用失败时也恢复同一份备份。

~~~sh
adb push ./original-rearscreen "$target"
~~~

核对备份已还原、当前背屏仍显示新主题后，关闭调试。Android 目录访问权限或主题格式与实测版本不同时，保留原文件，按该设备已有的主题导入流程处理。

## 构建

需要 Node.js 22.2 或更新版本。运行 npm run build 会在 dist 生成主题 ZIP。使用发布者的 RSA 签名证书与私钥配置 HFP_SIGN_DIR，再运行 npm run build:hfp。

由 [dustbin1415](https://github.com/dustbin1415) 维护，[OpenAI Codex](https://github.com/apps/chatgpt-codex-connector) 协助。源码按 [AGPL-3.0](LICENSE) 发布。
