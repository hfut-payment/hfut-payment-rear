# payfor工大 · 小米背屏付款码

通过宿主插件与自定义背屏主题，在受支持的小米手机背屏上出示校园付款码。支持配置亮屏时是否显示余额；进入息屏显示（AOD）后余额会自动隐藏；当付款码过期或手机端停止共享时，背屏数据会自动清空。

<p align="center"><img src="docs/images/rear-device.png" width="440" alt="小米 17 Pro 背屏特写，展示演示二维码、条形码和 ¥66.66"></p>

*小米 17 Pro 背屏实机效果。条形码、二维码和金额均为演示内容。*

## 机型兼容性

| 目标机型 | 当前状态 |
| --- | --- |
| 小米 17 Pro | 已实测，使用自定义背屏壁纸。 |
| 小米 17 Pro Max | 待实测，壁纸导入方式可能随固件而异。 |
| 小米 18 Pro / 18 Pro Max | 待实测。两款机型都提供背屏应用卡，后续可尝试用应用卡显示付款码，省去替换壁纸。应用卡版还未实现，动态付款码同步也有待验证。 |

小米 18 Pro 系列的功能介绍见[小米背屏应用卡页面](https://m.mi.com/appcard)。

## 安装前

当前版本使用自定义背屏壁纸。手机端需有能导入 HFP、并向背屏主题提供动态付款码的宿主。正式发布后可从 [Releases](../../releases) 获取两份文件。

- **HFP 插件**导入手机宿主，用于同步数据和管理权限。
- **`HFUT-Campus-Rear-OLED.zip`** 用于应用背屏主题，保留 ZIP 原样。

## 安装与启用流程

1. **导入 HFP 插件**：在手机宿主应用的「设置 → 插件管理 → 从文件导入」中选择下载的 HFP 文件，核对所需权限后确认导入。
2. **应用背屏主题 ZIP**：若已有自定义背屏主题的导入经验，可直接参考 [唯梦倾城的社区教程「方式 A（AI 壁纸）」](https://github.com/wmqc97/mi-backscreen-themes?tab=readme-ov-file#-安装方法) 应用 `HFUT-Campus-Rear-OLED.zip`；首次操作请参照下一节的小米 17 Pro 实测步骤。
3. **授权与开启显示**：返回宿主应用的背屏插件设置页，开启「读取权限」并按页面指引完成授权，随后打开「背屏显示」开关。如需在亮屏时查看余额，可在「显示选项」中开启。
4. **效果验证**：翻转手机查看背屏付款码是否正常刷新。若开启了余额显示，可锁屏观察其在亮屏时显示、进入息屏显示后隐藏的切换效果。

**恢复默认设置**：如需停用背屏付款码，可在系统「主题」设置中重新应用原壁纸，并在宿主应用中关闭「背屏显示」。

### 小米 17 Pro 实测流程：通过 AI 壁纸预览导入主题

请在电脑端配置好 [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools)，使用数据线连接手机，开启手机「USB 调试」并确认电脑的调试授权。在存放 `HFUT-Campus-Rear-OLED.zip` 的目录下打开 Bash 终端（Windows 可使用 Git Bash）：

1. **生成壁纸并停留预览页**：在手机「主题」应用中生成一条新的「3D 卡通 AI 壁纸」，进入 AI 壁纸历史记录并打开该壁纸的预览页面（**此时请勿点击「应用」**）。
2. **定位目标目录**：在电脑终端执行以下命令，按修改时间查找刚刚生成的壁纸目录名。若无法准确判断目标目录，请停止操作，切勿随意替换其他目录文件：

```sh
adb shell ls -lt /sdcard/Android/data/com.android.thememanager/files/MIUI/.ai_wallpaper/maml/
```

3. **备份原件并替换**：将下方命令中的 `CARRIER` 替换为上一步确认的目录名。该命令会先将手机上的 `rearscreen` 原文件拉取至本地备份，**确认备份成功且文件非空后**，再将未解压的 ZIP 包推送至原路径完成替换：

```sh
target=/sdcard/Android/data/com.android.thememanager/files/MIUI/.ai_wallpaper/maml/CARRIER/rearscreen
adb pull "$target" ./original-rearscreen &&
  test -s ./original-rearscreen &&
  adb push ./HFUT-Campus-Rear-OLED.zip "$target"
```

4. **应用主题并还原记录**：推送成功后，在手机预览页点击「应用」。待系统应用完成后，执行以下命令将备份的原文件还原至历史记录目录（若应用失败，同样需执行此命令恢复原件）：

```sh
adb push ./original-rearscreen "$target"
```

还原操作不会影响已生效的背屏主题。确认背屏正常显示付款码主题后，即可关闭 USB 调试。若当前固件无对应入口、目录无法访问或备份失败，请保留现有主题，并参考上述社区教程确认适配当前固件的导入方案。

## 源码构建与发版

本地构建需安装 Node.js 22.2 或更高版本：

* **构建背屏主题 ZIP**：执行 `npm run build`，产物生成于 `dist/` 目录。
* **构建 HFP 插件**：将环境变量 `HFP_SIGN_DIR` 指向发布者的 RSA 签名证书目录，随后执行 `npm run build:hfp`。

1. 更新 `hfp/manifest.json` 中的 `version` 与 `revision`，提交代码改动。
2. 在 [Actions](../../actions/workflows/build-plugin.yml) 中手动运行 `signed_candidate`，下载生成的候选 HFP 与主题 ZIP 进行实机安装验证。
3. 审核与测试通过后，在本地 `main` 分支对目标提交打标签并推送（以 `v2.0.4` 为例）：

```sh
git tag -a v2.0.4 -m "Release v2.0.4"
git push --atomic origin main refs/tags/v2.0.4
```

仓库公开后，标签构建工作流将在验签通过后，把 HFP、主题 ZIP 及校验文件自动发布至 [Releases](../../releases)。
