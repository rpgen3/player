(function () {
  "use strict";
  const h = $("<div>").appendTo($("body")).css({
    "text-align": "center",
    padding: "1em",
  });
  $("<h1>").appendTo(h).text("補足説明");
  $("<h2>").appendTo(h).text("Q.SoundCloudの曲を追加するには？");
  const holder = $("<div>").appendTo(h);
  $.get("bookmarkletSoundCloud.js", (r) => {
    rpgen3.addInputText(holder, {
      title: "bookmarklet",
      readonly: true,
      value: r,
    });
  });
  text(`上のブックマークレットを登録して使ってください。
SoundCloud上で欲しいtrackやplaylistのページに移動した後
ページ更新してから実行してください。`);
  $("<h2>").appendTo(h).text("共有機能について");
  blue("https://rpgen3.github.io/player/");
  black("にクエリパラメータをつけることで");
  h.append("<br>");
  black("「動画URLリスト入力欄」に自動で入力するURLを作成できます。");
  h.append("<br><br>");
  a("https://rpgen3.github.io/strToImg/");
  black("で作った文字列画像を");
  h.append("<br>");
  a("https://imgur.com/");
  black("にアップロードします。");
  h.append("<br>");
  black("「https://i.imgur.com/");
  blue("HFyZOJ6");
  black(".png」の青色の部分をコピーし、");
  h.append("<br><br>");
  blue("https://rpgen3.github.io/player/?imgur=HFyZOJ6");
  black("とURLに付け加えると完成です。");
  h.append("<br>");
  black("他人がそのURLにアクセスしても同じリストが入ります。");
  $("<h3>").appendTo(h).text("報告フォーム");
  black("なんかあればよろ");
  const inputTtl = rpgen3.addSelect(h, {
    title: "件名",
    list: ["改善要望", "不具合", "提案", "布教したい楽曲", "その他"],
  });
  const inputText = rpgen3.addInputText(h, {
    title: "本文",
    textarea: true,
  });
  const hh = $("<div>").appendTo(h);
  $("<button>")
    .appendTo(hh)
    .text("この内容で送信")
    .on("click", () => {
      if (!confirm("この内容で送信しますか？")) return;
      const ttl = inputTtl(),
        txt = inputText();
      if (!txt) return alert("本文が空欄です。");
      if (txt.length > 1900) {
        return alert(`本文の長さが1900文字を超えています！`);
      }
      send(`${"#".repeat(40)}
@everyone
ttl
${"`".repeat(3)}
${ttl}
${"`".repeat(3)}
txt
${"`".repeat(3)}
${txt}
${"`".repeat(3)}
${"#".repeat(40)}`);
      hh.text("送信しました。");
    });
  function text(str) {
    return str.split("\n").map((v) => $("<div>").appendTo(h).text(v));
  }
  function blue(str) {
    return $("<span>")
      .appendTo(h)
      .text(str)
      .css({ color: "white", backgroundColor: "#233B6C" });
  }
  function black(str) {
    return $("<span>").appendTo(h).text(str);
  }
  function a(href) {
    return $("<a>").appendTo(h).text(href).attr({
      target: "_blank",
      href: href,
    });
  }
  function send(content) {
    const webhookUrl =
      "https://discord.com/api/webhooks/1205457694350385155/OGO3NFdns6f1MvNc2jXQOHXwbjh7I2lLG4Ex7h4GVJVGSWqmhIfyJ-6xNff55DI5xGLp";
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
      }),
    });
  }
})();
