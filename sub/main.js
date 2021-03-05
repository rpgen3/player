(function() {
    'use strict';
    var h = $("<div>").appendTo($("body")).css({
        "text-align": "center",
        padding: "1em"
    });
    $("<h1>").appendTo(h).text("補足説明");
    $("<h2>").appendTo(h).text("Q.SoundCloudの曲を追加するには？");
    var holder = $("<div>").appendTo(h);
    $.get("bookmarkletSoundCloud.js",r=>{
        rpgen3.addInputText(h,{
            title: "bookmarklet",
            readonly: true,
            value: r
        })
    });
    text(`上のブックマークレットを登録して使ってください。
SoundCloud上で欲しいtrackやplaylistのページに移動した後
ページ更新してから実行してください。`);
    h.append("<br>");
    $("<h2>").appendTo(h).text("便利な共有機能");
    blue("https://rpgen3.github.io/player/");
    black("にクエリパラメータをつけることで");
    blue("動画URLリスト入力欄");
    black("に自動で入力させるようにプログラムを実行させるURLを作成できます。");
    $("<h3>").appendTo(h).text("例1");
    a("https://rpgen3.github.io/strToImg/");
    black("で作った文字列画像を");
    a("https://imgur.com/");
    black("にアップロードし、https://i.imgur.com/HFyZOJ6");
    black(".pngの青色の部分を切り取り、");
    blue("https://rpgen3.github.io/player/?imgur=HFyZOJ6");
    black("とURLに付け加えると完成です。");
    black("他人がそのURLにアクセスしても同じリストが入ります。");
    function text(str){
        return str.split('\n').map(v=>$("<div>").appendTo(h).text(v));
    }
    function blue(str){
        return $("<span>").appendTo(h).text(str).css({color:"blue"});
    }
    function black(str){
        return $("<span>").appendTo(h).text(str);
    }
    function a(href){
        return $("<a>").appendTo(h).text(href).attr({
            target:"_blank",
            href: href
        });
    }
})();
