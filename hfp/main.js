function handle(event) {
    if (event.action !== "page") return { command: event.action };
    const sharing = event.state?.sharing === true;
    return {
        title: "背屏校园卡",
        refreshOnReturn: "page",
        status: {
            icon: "display", active: sharing,
            title: sharing ? "背屏显示已开启" : "背屏显示已关闭",
            detail: sharing ? "付款码会随手机自动更新" : "应用校园卡壁纸后即可开启显示"
        },
        rows: [
            { title: sharing ? "关闭背屏显示" : "开启背屏显示", icon: "display", event: "toggle", primary: true },
            { section: "显示管理", title: "显示选项", detail: "设置校园卡余额显示", icon: "settings", event: "display" },
            { section: "显示管理", title: "读取权限", detail: "查看妙享背屏授权", icon: "lock", event: "permission" },
        ]
    };
}
