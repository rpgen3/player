const rpgen3 = window.rpgen3,
      $ = window.$;
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
        placeholder: `YouTubeとニコニコ動画とSoundCloudのURL
YouTubeのみplaylistも可
SoundCloudは埋め込みURLじゃないと使えないので注意`,
        value: r
    });
});
h.append("<br>");
$("<button>").appendTo(h).text("リストを読み込む").on("click",loadList);
rpgen3.addHideArea(h,{
    title: "読み込み設定",
    id2: "area2"
});
const isAllowedToLoad = [
    rpgen3.addInputBool("#area2",{ title: "YouTube", value: true }),
    rpgen3.addInputBool("#area2",{ title: "ニコニコ動画", value: true }),
    rpgen3.addInputBool("#area2",{ title: "SoundCloud", value: true }),
];
const hItems = $("<div>").appendTo(h).css({
    overflowY: "scroll",
    maxHeight: "40vh",
});
(()=>{
    const LONGPRESS = 1000;
    let id;
    $(window).on("mousedown touchstart",e=>{
        id = setTimeout(()=>$(e.target).trigger('longpress'), LONGPRESS);
    }).on("mouseup mouseleave touchend",()=>clearTimeout(id));
})();
const ids = [];
function loadList(){
    hItems.text("Now Loading...");
    while(ids.length) clearTimeout(ids.pop());
    g_list = [];
    Promise.all(inputURL().split('\n').filter(v=>v).map(v=>{
        return new Promise(resolve=>{
            const r = judgeURL(v);
            if(typeof r === "function") r(resolve);
            else resolve(r);
        });
    })).then(result=>{
        hItems.empty();
        hPlaylist.empty();
        result.filter(v=>v).forEach(v=>{
            if(typeof v[1] === "object") {
                for(const v2 of v[1]) g_list.push( [ v[0], v2 ] );
            }
            else g_list.push(v);
        });
        g_list.forEach((v,i)=>{
            const h = $("<div>").appendTo(hItems).css({
                position: "relative",
                float: "left"
            });
            const cover = $("<div>").appendTo(h).addClass("item"),
                  id = v[1],
                  [ tag, url ] = (()=>{
                      switch(v[0]){
                          case YouTube: return ["img", `https://i.ytimg.com/vi/${id}/hqdefault.jpg`];
                          case Nico: return ["iframe", `https://ext.nicovideo.jp/thumb/sm${id}`];
                          case SoundCloud: {
                              const p = {
                                  auto_play: false,
                                  show_teaser: false,
                                  visual: true,
                                  buying: false,
                                  liking: false,
                                  download: false,
                                  sharing: false,
                                  show_comments: false,
                                  show_playcount: false,
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
                    }).on("click",()=>start(i)).on('contextmenu longpress',()=>{
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
        while(played.length) played.pop();
        start(0);
    });
}
const hPlaylist = $("<div>").appendTo(h).hide();
function getPlaylist(list,resolve){
    new YT.Player($("<div>").appendTo(hPlaylist).get(0),{
        playerVars: {
            listType: 'playlist',
            list: list
        },
        events: {
            onReady: e => resolve([ YouTube, e.target.getPlaylist() ])
        }
    });
}
function judgeURL(url){
    if(!url) return;
    const d = rpgen3.getDomain(url).reverse(),
          p = rpgen3.getParam(url);
    let m;
    switch(d[1] + '.' + d[0]){
        case "youtu.be":
            m = url.match(/youtu\.be\/([A-Za-z0-9_\-]+)/);
        case "youtube.com":
            if(!(isAllowedToLoad[YouTube]())) return;
            if(p.list && /playlist/.test(url)) return resolve => getPlaylist(p.list,resolve);
            if(!m) m = url.match(/[\?&]v=([A-Za-z0-9_\-]+)/);
            if(!m) break;
            return [ YouTube, m[1] ];
        case "nicovideo.jp":
        case "nico.ms":
            if(!(isAllowedToLoad[Nico]())) return;
            m = url.match(/sm([0-9]+)/);
            if(!m) break;
            return [ Nico, m[1] ];
        case "soundcloud.com":
            if(!(isAllowedToLoad[SoundCloud]())) return;
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
$("<button>").appendTo(h).text("prev").on("click",prev);
$("<button>").appendTo(h).text("next").on("click",next);
const repeatPlayFlag = rpgen3.addInputBool(h,{
    title: "リピート再生",
    save: "リピート再生"
});
const shuffleFlag = rpgen3.addInputBool(h,{
    title: "シャッフル再生",
    save: "シャッフル再生"
});
$("<button>").appendTo(h).text("再生").on("click",play);
$("<button>").appendTo(h).text("一時停止").on("click",pause);
$("<button>").appendTo(h).text("replay").on("click",replay);
const hInputVolume = $("<div>").appendTo(h);
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
        unplayed = new Unplayed();
        return getRandom();
    }
    return result;
}
function next(){
    let i = g_idx;
    if(shuffleFlag()){
        const result = getRandom();
        if(false === result) return;
        i = result;
    }
    else {
        if(++i > g_list.length - 1) i = 0;
    }
    start(i);
}
const played = [];
function prev(){
    if(played.length === 1) return alert("This is the first track.");
    played.pop();
    start(played[played.length - 1]);
}
function start(id){
    const topId = played[played.length - 1];
    if(id !== topId) played.push(id);
    if(unplayed) unplayed.exclude(id);
    g_idx = id;
    setActive(id);
    const r = g_list[id];
    resetVideos(r[0]);
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
function resetVideos(next){
    if(whichVideo === next) return;
    hIframe.children().each((i,e)=>$(e).hide());
    pause();
}
let whichVideo;
function showVideo(videoType){
    whichVideo = videoType;
    hIframe.children().eq(videoType).show();
    makeInputVolume();
}
const hIframe = $("<div>").appendTo(h),
      iframes = [
          $("<div>").appendTo(hIframe).hide(),
          $("<div>").appendTo(hIframe).hide().append("<iframe>"),
          $("<div>").appendTo(hIframe).hide().append("<iframe>"),
      ],
      isSmartPhone = /iPhone|Android.+Mobile/.test(navigator.userAgent);
const playerEnded = () => repeatPlayFlag() ? play() : next();
let g_yt,unmutedFlag = false;
function playYouTube(id) {
    if(!id) return console.error("YouTube id is empty");
    if(!g_yt) {
        g_yt = new YT.Player($("<div>").appendTo(iframes[YouTube]).get(0), {
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
                    play();
                },
                onStateChange: e => {
                    switch(e.target.getPlayerState()){
                        case YT.PlayerState.PLAYING: return setVolume();
                        case YT.PlayerState.ENDED: return playerEnded();
                    }
                }
            }
        });
    }
    else g_yt.loadVideoById(id);
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
    setTimeout(play, 3000);
}
function postNico(r) {
    iframes[Nico].find("iframe").get(0).contentWindow.postMessage(Object.assign({
        sourceConnectorType: 1,
    }, r), NicoOrigin);
}
window.addEventListener('message', e => {
    if (e.origin !== NicoOrigin || e.data.eventName !== 'playerStatusChange') return;
    const { data } = e.data;
    switch(data.playerStatus){
        case 2: return setVolume();
        case 4: return playerEnded();
    }
});
let scWidget;
function playSoundCloud(id){
    if(!id) return console.error("soundcloud id is empty");
    const p = {
        auto_play: false,
        show_teaser: false,
        visual: true,
    };
    if(!scWidget){
        scWidget = SC.Widget(iframes[SoundCloud].find("iframe").attr({
            scrolling: "no",
            frameborder: "no",
            playsinline: 1,
            allow: "autoplay",
            src: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}&` + Object.keys(p).map(v=>v+'='+p[v]).join('&')
        }).get(0));
        scWidget.bind(SC.Widget.Events.READY, callback);
        scWidget.bind(SC.Widget.Events.FINISH, playerEnded);
    }
    else scWidget.load(`https://api.soundcloud.com/tracks/${id}`, Object.assign(p,{ callback: callback }));
    function callback(){
        setVolume();
        play();
    }
    onResize(iframes[SoundCloud].find("iframe"));
    showVideo(SoundCloud);
}
let inputVolume;
function makeInputVolume(){
    const ttl = (()=>{
        switch(whichVideo){
            case YouTube: return "YouTube";
            case Nico: return "ニコニコ動画";
            case SoundCloud: return "SoundCloud";
        }
    })() + "の音量";
    inputVolume = null;
    inputVolume = rpgen3.addInputRange(hInputVolume.empty(),{
        title: ttl,
        save: ttl,
        min: 0,
        max: 1,
        value: 0.5,
        step: 0.01,
        change: setVolume
    });
}
function setVolume(){
    if(!inputVolume) return;
    const v = inputVolume();
    switch(whichVideo){
        case YouTube: return g_yt.setVolume(v * 100);
        case Nico: return postNico({eventName: 'volumeChange', data: { volume: v } });
        case SoundCloud: return scWidget.setVolume(v * 100);
    }
}
function play(){
    switch(whichVideo){
        case YouTube: return g_yt.playVideo();
        case Nico: return postNico({ eventName: "play" });
        case SoundCloud: return scWidget.play();
    }
}
function pause(){
    switch(whichVideo){
        case YouTube: return g_yt.pauseVideo();
        case Nico: return postNico({ eventName: "pause" });
        case SoundCloud: return scWidget.pause();
    }
}
function replay(){
    switch(whichVideo){
        case YouTube: return g_yt.seekTo(0);
        case Nico: return postNico({ eventName: "seek", data: { time: 0 } });
        case SoundCloud: return scWidget.seekTo(0);
    }
}
