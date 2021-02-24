const rpgen3 = window.rpgen3,
      $ = window.$;
$.getScript("https://www.youtube.com/iframe_api");
const YouTube = 0,
      Nico = 1;
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
let inputURL;
$.get(`sample.txt`,r=>{
    inputURL = rpgen3.addInputText("#inputURL",{
        textarea: true,
        save:  "動画URLリスト入力欄",
        placeholder: "YouTubeとニコニコ動画のURL",
        value: r
    });
});
h.append("<br>");
$("<button>").appendTo(h).text("リストを読み込む").on("click",loadList);
const hItems = $("<div>").appendTo(h).css({
    overflowY: "scroll",
    maxHeight: "40vh",
});
const ids = [];
function loadList(){
    while(ids.length) clearTimeout(ids.pop());
    hItems.empty();
    g_list = inputURL().split('\n').filter(v=>v).map((url,i)=>{
        const r = judgeURL(url);
        ids.push(setTimeout(()=>{
            let elm;
            if(!r) return console.error(`${url} is not video URL`);
            else if(r[0] === YouTube) elm = $("<img>",{src:`https://i.ytimg.com/vi/${r[1]}/hqdefault.jpg`});
            else if(r[0] === Nico) elm = $("<iframe>").attr({src:`https://ext.nicovideo.jp/thumb/sm${r[1]}`});
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
        },200*i));
        return r;
    }).filter(v=>v);
    $(".item").each((i,e)=>$(e).on("click",()=>jump(i)));
    jump(0);
    unplayed = prevIdx = null;
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
            return [ Nico, m[1] ];
    }
    return false;
}
$('<style>').prependTo(h).html(`
.item:hover {
cursor: pointer;
background-color:rgba(0, 255, 0, 0.3);
}
.active {
background-color:rgba(255, 0, 0, 0.3);
}
.active:hover {
background-color:rgba(127, 127, 0, 0.3);
}
`);
let prevIdx = null;
function setActive(i){
    if(null !== prevIdx) $(".item").eq(prevIdx).removeClass("active");
    $(".item").eq(i).addClass("active");
}
h.append("<br>");
$("<button>").appendTo(h).text("prev").on("click",()=>move(-1));
$("<button>").appendTo(h).text("next").on("click",()=>move(1));
const loopOneFlag = rpgen3.addInputBool(h,{
    title: "1曲リピート",
    save: "1曲リピート"
});
const loopAllFlag = rpgen3.addInputBool(h,{
    title: "全曲リピート",
    save: "全曲リピート"
});
const shuffleFlag = rpgen3.addInputBool(h,{
    title: "シャッフル再生",
    save: "シャッフル再生"
});
class Unplayed {
    constructor(){
        this.ar = rpgen3.makeArray(g_list.length);
    }
    exclude(i){
        this.ar = this.ar.filter(v=>v!==i);
        return i;
    }
    random(){
        if(!this.ar.length) return false;
        return this.exclude(rpgen3.randArray(this.ar));
    }
}
let unplayed;
function getRandom(){
    if(!g_list.length) return;
    if(!unplayed){
        unplayed = new Unplayed();
        return getRandom();
    }
    const result = unplayed.random();
    if(false === result) {
        if(!loopAllFlag()) return false;
        unplayed = new Unplayed();
        return getRandom();
    }
    return result;
}
function move(n){
    resetVideos();
    if(shuffleFlag()){
        const result = getRandom();
        if(false === result) return;
        g_idx = result;
    }
    else {
        g_idx += n;
        if(0 > g_idx) g_idx = loopAllFlag() ? g_list.length - 1 : 0;
        else if(g_list.length - 1 < g_idx) {
            if(!loopAllFlag()) return (g_idx = g_list.length - 1);
            g_idx = 0;
        }
    }
    setActive(g_idx);
    const r = g_list[g_idx];
    if(r[0] === YouTube) playYouTube(r[1]);
    else if(r[0] === Nico) playNico(r[1]);
}
function jump(n){
    resetVideos();
    if(unplayed) unplayed.exclude(n);
    g_idx = n;
    setActive(g_idx);
    const r = g_list[g_idx];
    if(r[0] === YouTube) playYouTube(r[1]);
    else if(r[0] === Nico) playNico(r[1]);
}
function resize(elm){
    const w = $(window).width() * 0.9;
    elm.attr({
        width: w,
        height: w * (9/16)
    }).css({
        maxHeight: "70vh"
    });
}
function onResize(elm){
    $(window).on("resize",()=>resize(elm)).trigger("resize");
}
function resetVideos(){
    hIframe.children().each((i,e)=>$(e).hide());
    iframes[YouTube].empty();
    iframes[Nico].find("iframe").attr("src","");
}
function showVideo(videoType){
    hIframe.children().eq(videoType).show();
}
const hIframe = $("<div>").appendTo(h),
      iframes = [
          $("<div>").appendTo(hIframe).hide(),
          $("<div>").appendTo(hIframe).hide().append("<iframe>"),
      ],
      isSmartPhone = /iPhone|Android.+Mobile/.test(navigator.userAgent);
let unmutedFlag = false;
function playYouTube(id) {
    if(!id) return console.error("YouTube id is empty");
    const yt = new YT.Player($("<div>").appendTo(iframes[YouTube].empty()).get(0),{
        videoId: id,
        playerVars: {
            playsinline: 1
        },
        events: {
            onReady: e => {
                if(isSmartPhone && !unmutedFlag) {
                    unmutedFlag = true;
                    e.target.mute();
                }
                e.target.playVideo();
            },
            onStateChange: e => {
                console.log(rpgen3.getTime() + ' ' + e.target.getPlayerState());
                if(e.target.getPlayerState() !== YT.PlayerState.ENDED) return;
                loopOneFlag() ? yt.playVideo() : move(1);
            }
        }
    });
    onResize(iframes[YouTube].find("iframe"));
    showVideo(YouTube);
}
const NicoOrigin = 'https://embed.nicovideo.jp';
function playNico(id){
    if(!id) return console.error("niconico id is empty");
    onResize(iframes[Nico].find("iframe").attr("src",`//embed.nicovideo.jp/watch/sm${id}?jsapi=1`));
    showVideo(Nico);
    setTimeout(()=>postMessage({
        eventName: "play"
    }),3000);
}
function postMessage(request) {
    hIframe.find("iframe").get(0).contentWindow.postMessage(Object.assign({
        sourceConnectorType: 1,
    }, request), NicoOrigin);
}
window.addEventListener('message', e => {
    if (e.origin !== NicoOrigin || e.data.eventName !== 'playerStatusChange') return;
    const { data } = e.data;
    console.log(rpgen3.getTime() + ' ' + data.playerStatus);
    if(data.playerStatus !== 4) return;
    if (!loopOneFlag()) return move(1);
    postMessage({
        eventName: 'seek',
        data: {
            time: 0
        }
    });
});
$("<link>").appendTo("head").attr({
    rel: "icon",
    type: "image/gif",
    href: "https://i.imgur.com/fdD7ZnG.gif"
});
