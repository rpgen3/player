const rpgen3 = window.rpgen3,
      $ = window.$;
$.getScript("https://www.youtube.com/iframe_api");
$.getScript("https://w.soundcloud.com/player/api.js");
const YouTube = 0,
      Nico = 1,
      SoundCloud = 2;
let g_list, g_idx;
const h = $("<div>").appendTo($("body")).css({
    "text-align": "center",
    padding: "1em"
});
$("<h2>",{text:"YouTube Nicovideo SoundCloud Player"}).appendTo(h);
rpgen3.addHideArea(h,{
    title: "動画URLリスト入力欄",
    id2: "hideArea"
});
let inputURL;
$.get(`sample.txt`,r=>{
    inputURL = rpgen3.addInputText("#hideArea",{
        id: "inputURL",
        textarea: true,
        save:  "動画URLリスト入力欄",
        placeholder: "YouTubeとニコニコ動画とSoundCloudのURL\nSoundCloudは埋め込みURLじゃないと使えないので注意",
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
    g_list = inputURL().split('\n').filter(v=>v).map(judgeURL).filter(v=>v);
    g_list.forEach((v,i)=>{
        const h = $("<div>").appendTo(hItems).css({
            position: "relative",
            float: "left"
        }),
              cover = $("<div>").appendTo(h).addClass("item"),
              id = v[1],
              [ tag, url ] = (()=>{
                  switch(v[0]){
                      case YouTube: return ["img", `https://i.ytimg.com/vi/${id}/hqdefault.jpg`];
                      case Nico: return ["iframe", `https://ext.nicovideo.jp/thumb/sm${id}`];
                      case SoundCloud: {
                          const p = {
                              auto_play: false,
                              buying: false,
                              liking: false,
                              download: false,
                              sharing: false,
                              show_comments: false,
                              show_playcount: false,
                              visual: true,
                          };
                          return [
                              "iframe",
                              `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}&`
                              + Object.keys(p).map(v=>v+'='+p[v]).join('&')
                          ];
                      }
                  }
              })();
        ids.push(setTimeout(()=>{
            $(`<${tag}>`).prependTo(h).on("load",function(){
                h.css({
                    width: $(this).width(),
                    height: $(this).height()
                });
                cover.css({
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                }).on("click",()=>play(i)).on('contextmenu',()=>{
                    const idx = inputURL().indexOf(id),
                          e = $("#inputURL").get(0);
                    e.focus();
                    e.setSelectionRange(idx,idx+id.length);
                    return false;
                });
            }).css({
                maxHeight: 100,
            }).attr({
                src: url,
                scrolling: "no",
                frameborder: "no"
            });
        },60/130*1000*i));
    });
    unplayed = prevIdx = null;
    play(0);
}
function judgeURL(url){
    if(!url) return;
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
        case "soundcloud.com":
            m = url.match(/\/tracks\/([0-9]+)/);
            if(!m) break;
            return [ SoundCloud, m[1] ];
    }
    return console.error("this url is not supported\n" + url);
}
let prevIdx = null;
function setActive(i){
    if(null !== prevIdx) $(".item").eq(prevIdx).removeClass("active");
    prevIdx = i;
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
        if(!this.ar.length) return false;
        this.ar = this.ar.filter(v=>v!==i);
    }
    random(){
        if(!this.ar.length) return false;
        return rpgen3.randArray(this.ar);
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
    let i = g_idx;
    if(shuffleFlag()){
        const result = getRandom();
        if(false === result) return;
        i = result;
    }
    else {
        i += n;
        if(0 > i) i = loopAllFlag() ? g_list.length - 1 : 0;
        else if(g_list.length - 1 < i) {
            if(!loopAllFlag()) return (i = g_list.length - 1);
            i = 0;
        }
    }
    play(i);
}
function play(n){
    g_idx = n;
    resetVideos();
    setActive(n);
    if(unplayed) unplayed.exclude(n);
    const r = g_list[n];
    (()=>{
        switch(r[0]){
            case YouTube: return playYouTube;
            case Nico: return playNico;
            case SoundCloud: return playSoundCloud;
        }
    })()(r[1]);
    fixScrollTop();
}
let prevScroll = 0;
$(window).on("scroll",()=>{
    const y = $(window).scrollTop();
    if(y) prevScroll = y;
});
function fixScrollTop(){
    $(window).scrollTop(prevScroll);
}
function resize(elm){
    const w = $(window).width() * 0.9,
          h = $(window).height() * 0.9;
    let w2, h2;
    if(w < h) {
        w2 = w;
        h2 = w2 * (9/16);
    }
    else {
        h2 = h * 0.6;
        w2 = h2 * (16/9);
    }
    elm.attr({
        width: w2,
        height: h2
    });
}
function onResize(elm){
    $(window).off("resize").on("resize",()=>resize(elm)).trigger("resize");
}
function resetVideos(){
    hIframe.children().each((i,e)=>$(e).hide());
    iframes[YouTube].empty();
    iframes[Nico].find("iframe").attr("src","");
    iframes[SoundCloud].empty();
}
function showVideo(videoType){
    hIframe.children().eq(videoType).show();
}
const hIframe = $("<div>").appendTo(h),
      iframes = [
          $("<div>").appendTo(hIframe).hide(),
          $("<div>").appendTo(hIframe).hide().append("<iframe>"),
          $("<div>").appendTo(hIframe).hide(),
      ],
      isSmartPhone = /iPhone|Android.+Mobile/.test(navigator.userAgent);
let unmutedFlag = false;

function playYouTube(id) {
    if(!id) return console.error("YouTube id is empty");
    const yt = new YT.Player($("<div>").appendTo(iframes[YouTube]).get(0),{
        videoId: id,
        playerVars: {
            playsinline: 1,
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
    onResize(iframes[Nico].find("iframe").attr({
        src: `//embed.nicovideo.jp/watch/sm${id}?jsapi=1`,
        allowfullscreen: 1,
        playsinline: 1,
        allow: "autoplay"
    }));
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
function playSoundCloud(id){
    if(!id) return console.error("soundcloud id is empty");
    const p = {
        auto_play: true,
        show_teaser: true,
        visual: true
    };
    const elm = $("<iframe>").appendTo(iframes[SoundCloud]).attr({
        scrolling: "no",
        frameborder: "no",
        playsinline: 1,
        allow: "autoplay",
        src: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}&` + Object.keys(p).map(v=>v+'='+p[v]).join('&')
    });
    onResize(elm);
    showVideo(SoundCloud);
    const w = SC.Widget(elm.get(0));
    w.bind(SC.Widget.Events.READY,()=>w.play());
    w.bind(SC.Widget.Events.FINISH,()=>loopOneFlag() ? w.play() : move(1));
}
