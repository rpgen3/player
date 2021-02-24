const rpgen3 = window.rpgen3,
      $ = window.$;
$.getScript("https://www.youtube.com/iframe_api");
const YouTube = 0,
      Nicovideo = 1;
let g_list, g_idx;
const h = $("<div>").appendTo($("body")).css({
    "text-align": "center",
    padding: "1em"
});
$("<h1>",{text:"YouTube and Nicovideo Player"}).appendTo(h);
rpgen3.addHideArea(h,{
    title: "動画URLリスト入力欄",
    id2: "inputURL"
});
const inputURL = rpgen3.addInputText("#inputURL",{
    textarea: true,
    save:  "動画URLリスト",
    placeholder: "YouTubeとニコニコ動画のURL",
    value: `
https://www.youtube.com/watch?v=5JqO2KzISbo
https://www.youtube.com/watch?v=aC3672z9FOY
https://www.youtube.com/watch?v=OWSGPu8al50
`});
$("<button>").appendTo(h).text("リストを読み込む").on("click",loadList);
const hItems = $("<div>").appendTo(h).css({
    overflowY: "scroll",
    maxHeight: "40vh",
});
function loadList(){
    hItems.empty();
    g_list = inputURL().split('\n').filter(v=>v).map((url,i)=>{
        const r = judgeURL(url);
        let elm;
        if(!r) return console.error(`${url} is not video URL`);
        else if(r[0] === YouTube) elm = $("<img>",{src:`https://i.ytimg.com/vi/${r[1]}/hqdefault.jpg`});
        else if(r[0] === Nicovideo) elm = $("<iframe>").attr({src:`https://ext.nicovideo.jp/thumb/sm${r[1]}`});
        const h = $("<div>").appendTo(hItems).css({
            position: "relative",
            float: "left"
        });
        elm.appendTo(h).css({
            maxHeight: 100,
        });
        h.css({
            width: elm.width(),
            height: elm.height()
        });
        $("<div>").appendTo(h).css({
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        }).addClass("item");
        return r;
    }).filter(v=>v);
    $(".item").each((i,e)=>$(e).on("click",()=>jump(i)));
    jump(0);
}
function judgeURL(url){
    if(!url) return console.error("url is empty");
    const d = rpgen3.getDomain(url).reverse();
    let m;
    switch(d[1] + '.' + d[0]){
        case "youtu.be":
            m = url.match(/youtu\.be\/([A-Za-z0-9_\-]+)/);
        case "youtube.com":
            if(!m) m = url.match(/[\?&]v=([A-Za-z0-9_\-]+)/);
            if(!m) break;
            return [ YouTube, m[1] ];
        case "nicovideo.jp":
        case "nico.ms":
            m = url.match(/sm([0-9]+)/);
            if(!m) break;
            return [ Nicovideo, m[1] ];
    }
    return false;
}
$('<style>').prependTo(h).html(".item:hover{background-color:rgba(255, 0, 0, 0.3);}");
h.append("<br>");
$("<button>").appendTo(h).text("prev").on("click",()=>move(-1));
$("<button>").appendTo(h).text("next").on("click",()=>move(1));
const loopOneFlag = rpgen3.addInputBool(h,{
    title: "単体ループ",
    save: "単体ループ"
});
const loopAllFlag = rpgen3.addInputBool(h,{
    title: "全体ループ",
    save: "全体ループ"
});
function move(n){
    resetVideos();
    g_idx += n;
    if(0 > g_idx) g_idx = loopAllFlag() ? g_list.length - 1 : 0;
    else if(g_list.length - 1 < g_idx) {
        if(!loopAllFlag()) return (g_idx = g_list.length - 1);
        g_idx = 0;
    }
    const r = g_list[g_idx];
    if(r[0] === YouTube) playYouTube(r[1]);
    else if(r[0] === Nicovideo) playNico(r[1]);
}
function jump(n){
    resetVideos();
    g_idx = n;
    const r = g_list[g_idx];
    if(r[0] === YouTube) playYouTube(r[1]);
    else if(r[0] === Nicovideo) playNico(r[1]);
}
function resetVideos(){
    whichVideo = null;
    if(yt.stopVideo) yt.stopVideo();
    [YouTube,Nicovideo].forEach(v=>iframes[v].find("iframe").attr("src",''));
}
let whichVideo;
const hIframe = $("<div>").appendTo(h),
      iframes = [
          $("<div>").appendTo(hIframe).append($("<div>")).hide(),
          $("<div>").appendTo(hIframe).append($("<iframe>")).hide()
      ];
function show(videoType){
    whichVideo = videoType;
    hIframe.children().each((i,e)=>$(e).hide());
    const w = $(window).width() * 0.9,
          now = iframes[videoType];
    now.find("iframe").attr({
        width: w,
        height: w * (9/16)
    });
    now.show();
}
let yt, ytSrc, ytLoaded = false;
setTimeout(()=>{
    yt = new YT.Player(iframes[YouTube].find("div").get(0),{
        videoId: "gIrrwsiejN0",
        playerVars: {
            autoplay: 1
        }
    });
    ytSrc = iframes[YouTube].find("iframe").attr("src");
    setInterval(()=>{
        if(whichVideo !== YouTube) return;
        if(!ytLoaded) return;
        if(yt.getPlayerState() !== YT.PlayerState.ENDED) return;
        if(yt.getCurrentTime()/yt.getDuration() < 0.9) return;
        loopOneFlag() ? yt.playVideo() : move(1);
    },500);
},2000);
function playYouTube(id) {
    if(!id) return console.error("YouTube id is empty");
    const iframe = iframes[YouTube].find("iframe");
    iframe.attr("src",ytSrc.replace(/(?<=embed\/)[a-zA-Z0-9_\-]+(?=\?)/,id));
    show(YouTube);
    ytLoaded = false;
    setTimeout(()=>(ytLoaded = true),6000);
}
const NicoOrigin = 'https://embed.nicovideo.jp';
const intervalIDs = [];
function clearIntervalAll(){
    while(intervalIDs.length) clearInterval(intervalIDs.pop());
}
function playNico(id){
    if(!id) return console.error("niconico id is empty");
    iframes[Nicovideo].find("iframe").attr("src",`//embed.nicovideo.jp/watch/sm${id}?jsapi=1`);
    show(Nicovideo);
    clearIntervalAll();
    intervalIDs.push(setTimeout(()=>postMessage({
        eventName: 'play'
    }),3000));
}
function postMessage(request) {
    iframes[Nicovideo].find("iframe").get(0).contentWindow.postMessage(Object.assign({
        sourceConnectorType: 1,
    }, request), NicoOrigin);
}
window.addEventListener('message', e => {
    if(whichVideo !== Nicovideo) return;
    if (e.origin !== NicoOrigin || e.data.eventName !== 'playerStatusChange') return;
    const { data } = e.data;
    if(data.playerStatus === 2) clearIntervalAll();
    if(data.playerStatus !== 4) return;
    if (!loopOneFlag()) return move(1);
    postMessage({
        eventName: 'seek',
        data: {
            time: 0
        }
    });
});
