const rpgen3 = window.rpgen3,
      $ = window.$;
const YouTube = 0,
      Nico = 1,
      SoundCloud = 2;
const videoName = [
    "YouTube",
    "ニコニコ動画",
    "SoundCloud"
];
let g_list, g_idx;
const h = $("<div>").appendTo($("body")).css({
    "text-align": "center",
    padding: "1em"
});
$("<h2>",{text:"YouTube Nicovideo SoundCloud Player"}).appendTo(h);
const isShowingHideArea = rpgen3.addHideArea(h,{
    title: "動画URLリスト入力欄",
    id2: "hideArea"
});
let inputURL;
$.get("sample.txt",r=>{
    inputURL = rpgen3.addInputText("#hideArea",{
        id: "inputURL",
        textarea: true,
        save:  "動画URLリスト入力欄",
        placeholder: `YouTubeとニコニコ動画とSoundCloudのURL
SoundCloudは埋め込みURLじゃないと使えないので注意
YouTubeとSoundCloudはplaylistも可
YouTubeチャンネルのURLも使用可能`,
        value: r
    });
});
h.append("<br>");
$("<button>").appendTo(h).text("リストを読み込む").on("click",loadList);
rpgen3.addHideArea(h,{
    title: "読み込み設定",
    id2: "conf"
});
const isAllowedToLoad = [
    rpgen3.addInputBool("#conf",{ title: videoName[YouTube], value: true }),
    rpgen3.addInputBool("#conf",{ title: videoName[Nico], value: true }),
    rpgen3.addInputBool("#conf",{ title: videoName[SoundCloud], value: true }),
];
$("#conf").append("<br>");
const makeKeyOfPlaylist = (videoType, id) => `playlist#${videoName[videoType]}#${id}`;
$("<button>").appendTo("#conf").text("playlistのキャッシュをクリア").on("click",()=>{
    if(!confirm("playlistのキャッシュを削除しますか？")) return;
    rpgen3.makeArray(3).map(v=>videoName[v]).forEach(videoType=>{
        rpgen3.getSaveKeys().filter(v=>(new RegExp(`^playlist#${videoType}#`)).test(v)).forEach(v=>{
            rpgen3.removeSaveData(v);
        });
    });
});
$("<a>").appendTo("#conf").text("補足説明").attr({
    href: "https://rpgen3.github.io/player/sub/index.html",
    target: "_blank",
});
const hMsg = $("<div>").appendTo(h);
function msg(str, isError){
    $("<span>").appendTo(hMsg.empty()).text(str).css({
        color: isError ? "red" : "black",
        backgroundColor: isError ? "pink" : "white",
    });
}
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
let g_timeStamp = 0,
    g_firstLoadedFlags = new Array(3).fill(false);
function loadList(){
    const timeStamp = +new Date;
    g_timeStamp = timeStamp;
    msg("Now Loading...");
    Promise.all(inputURL().split('\n').filter(v=>v).map(url=>{
        return new Promise((resolve, reject)=>{
            const r = judgeURL(url);
            if(typeof r === "function") r(resolve);
            else resolve(r);
        });
    })).then(result=>{
        const list = result.filter(v=>v);
        if(!list.every(v=>v[1])) throw Error("Failed to load playlist.");
        if(!list.length) throw Error("The URL is invalid or empty.");
        hItems.empty();
        g_list = [];
        list.forEach(v=>{
            if(typeof v[1] === "object") {
                for(const v2 of v[1]) g_list.push( [ v[0], v2 ] );
            }
            else g_list.push(v);
        });
        const firstFunc = [
            playFirstYouTube,
            playFirstNico,
            playFirstSoundCloud,
        ];
        const promiseArray = [];
        if(!g_firstLoadedFlags.every(v=>v)){
            g_list.forEach(v=>{
                if(g_firstLoadedFlags[v[0]]) return;
                g_firstLoadedFlags[v[0]] = true;
                promiseArray.push(new Promise(resolve=>firstFunc[v[0]](v[1],resolve)));
            });
        }
        if(promiseArray.length) Promise.all(promiseArray).then(opening)
        else opening();
        function opening(){
            const funcList = g_list.map((v,i)=>{
                const h = $("<div>").appendTo(hItems).css({
                    position: "relative",
                    float: "left"
                });
                const cover = $("<div>").appendTo(h).addClass("item"),
                      id = v[1];
                return () => loadItem({v,i,id,cover,funcList,h});
            });
            funcList[0]();
            unplayed = prevIdx = null;
            while(played.length) played.pop();
            start(0);
        }
    }).catch(err=>msg(err,true));
    function makeElm({resolve,h,ttl,userName,img}){
        let infoElm = $("<div>").prependTo(h).text(ttl).css({
            top: 33,
            fontSize: 12,
            color: "white",
        });
        if(userName){
            infoElm = infoElm.add($("<div>").prependTo(h).text(userName).css({
                top: 5,
                fontSize: 10,
                color: "#cccccc",
                "text-decoration": "underline"
            }));
        }
        else infoElm.css({top: 5});
        infoElm.css({
            padding: 5,
            maxWidth: "80%",
            maxHeight: "50%",
            position: "absolute",
            left: 5,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
        });
        resolve($("<img>").attr({src: img}));
    }
    function loadItem({v,i,id,cover,funcList,h}){
        new Promise((resolve, reject)=>{
            const makeElm2 = ({ttl,userName,img}) => makeElm({resolve,h,ttl,userName,img}),
                  keyOfVideoInfo = `videoInfo#${videoName[v[0]]}#${id}`;
            switch(v[0]){
                case YouTube:
                    resolve($("<img>").attr({src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}));
                    break;
                case Nico:
                    setCache({
                        key: keyOfVideoInfo,
                        callback: makeElm2,
                        getData: save => {
                            funcNico = ({checkId,ttl,img}) => {
                                if(checkId !== id) return;
                                funcNico = null;
                                makeElm2(save({ttl,img}));
                            };
                            $("<iframe>").appendTo(hHideArea).attr({
                                src: `//embed.nicovideo.jp/watch/sm${id}?jsapi=1`
                            });
                        }
                    });
                    break;
                case SoundCloud: {
                    setCache({
                        key: keyOfVideoInfo,
                        callback: makeElm2,
                        getData: save => {
                            const w = SC.Widget($("<iframe>").appendTo(hHideArea).attr({
                                src: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}`
                            }).get(0));
                            w.bind(SC.Widget.Events.READY, () => {
                                w.getCurrentSound( r => {
                                    const ttl = r.title,
                                          userName = r.user.username,
                                          img = r.artwork_url || r.user.avatar_url;
                                    makeElm2(save({ttl,userName,img}));
                                });
                            });
                        }
                    });
                    break;
                }
            }
        }).then(elm=>{
            if(g_timeStamp !== timeStamp) return;
            elm.prependTo(h).on("load",()=>{
                onLoadFunc({i,id,cover,elm,h});
                hHideArea.empty();
                const next = i + 1;
                if(next < funcList.length) setTimeout(()=>funcList[next](),60/130*1000);
            }).css({
                maxHeight: 100,
            });
        }).catch(err=>msg(err,true));
    }
    function onLoadFunc({i,id,cover,elm,h}){
        if(g_timeStamp !== timeStamp) return;
        msg(`Loaded (${i + 1}/${g_list.length})`);
        h.css({
            width: elm.width(),
            height: elm.height()
        });
        cover.css({
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        }).on("click",()=>start(i)).on('contextmenu longpress',()=>{
            if(!isShowingHideArea()) return false;
            const idx = inputURL().indexOf(id),
                  e = $("#inputURL").get(0);
            e.focus();
            e.setSelectionRange(idx,idx+id.length);
            return false;
        });
    }
}
const hHideArea = $("<div>").appendTo(h).hide();
function setCache({key, getData, callback}){
    const f = () => getData(obj=>{
        rpgen3.save(key, JSON.stringify(obj));
        return obj;
    });
    if(!rpgen3.load(key, r=>{
        try { callback(JSON.parse(r)); }
        catch(err) { f(); }
    })) f();
}
function getPlaylistYT(resolve, listType, list){
    setCache({
        key: makeKeyOfPlaylist(YouTube, listType + list),
        callback: v => resolve([ YouTube, v ]),
        getData: save => {
            new YT.Player($("<div>").appendTo(hHideArea).get(0),{
                playerVars: {
                    listType: listType,
                    list: list
                },
                events: {
                    onReady: e => resolve([ YouTube, save(e.target.getPlaylist()) ]),
                }
            });
        }
    });
}
function getPlaylistSC(resolve, id){
    setCache({
        key: makeKeyOfPlaylist(SoundCloud, id),
        callback: v => resolve([ SoundCloud, v ]),
        getData: save => {
            const w = SC.Widget($("<iframe>").appendTo(hHideArea).attr({
                src: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${id}`
            }).get(0));
            w.bind(SC.Widget.Events.READY, () => w.getSounds(r=>{
                resolve([ SoundCloud, save(r.map(v=>v.id)) ])
            }));
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
            if(p.list && /playlist/.test(url)) return resolve => getPlaylistYT(resolve, 'playlist', p.list);
            if(/user/.test(url)) {
                m = url.match(/user\/([A-Za-z0-9_\-]+)/);
                if(m) return resolve => getPlaylistYT(resolve, 'user_uploads', m[1]);
            }
            if(/channel/.test(url)) {
                m = url.match(/channel\/UC([A-Za-z0-9_\-]+)/);
                if(m) return resolve => getPlaylistYT(resolve, 'playlist', 'UU' + m[1]);
            }
            // if(p.search_query) return resolve => getPlaylistYT(resolve, 'search', p.search_query);
            if(!m) m = url.match(/[\?&]v=([A-Za-z0-9_\-]+)/);
            if(m) return [ YouTube, m[1] ];
        case "nicovideo.jp":
        case "nico.ms":
            if(!(isAllowedToLoad[Nico]())) return;
            m = url.match(/sm([0-9]+)/);
            if(m) return [ Nico, m[1] ];
        case "soundcloud.com":
            if(!(isAllowedToLoad[SoundCloud]())) return;
            if(/playlists/.test(url)) {
                m = url.match(/playlists\/([0-9]+)/);
                if(m) return resolve => getPlaylistSC(resolve, m[1]);
            }
            m = url.match(/\/tracks\/([0-9]+)/);
            if(m) return [ SoundCloud, m[1] ];
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
const prevBtn = $("<button>").appendTo(h).text("prev").on("click",prev);
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
$("<button>").appendTo(h).text("最初から").on("click",seekTo0);
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
    prevBtn.attr("disabled", played.length < 2);
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
const playerEnded = videoType => videoType !== whichVideo ? null : repeatPlayFlag() ? play() : next();
let g_yt,
    firstFlagYT = false,
    unmutedFlag = false;
function playFirstYouTube(id, resolve){
    g_yt = new YT.Player($("<div>").appendTo(iframes[YouTube]).get(0), {
        videoId: id,
        playerVars: {
            playsinline: 1,
        },
        events: {
            onReady: e => {
                if(!firstFlagYT) {
                    firstFlagYT = true
                    return resolve();
                }
                if(whichVideo !== YouTube) return;
                if(isSmartPhone && !unmutedFlag) {
                    unmutedFlag = true;
                    e.target.mute();
                }
                play();
            },
            onStateChange: e => {
                switch(e.target.getPlayerState()){
                    case YT.PlayerState.PLAYING: return setVolume();
                    case YT.PlayerState.ENDED: return playerEnded(YouTube);
                }
            }
        }
    });
}
function playYouTube(id) {
    g_yt.loadVideoById(id);
    onResize(iframes[YouTube].find("iframe"));
    showVideo(YouTube);
}
const NicoOrigin = 'https://embed.nicovideo.jp';
function setNico(id){
    return iframes[Nico].find("iframe").attr({
        src: `//embed.nicovideo.jp/watch/sm${id}?jsapi=1`,
        allowfullscreen: 1,
        playsinline: 1,
        allow: "autoplay"
    });
}
function playFirstNico(id, resolve){
    setNico(id).on("load", resolve);
}
function playNico(id){
    onResize(setNico(id));
    showVideo(Nico);
    setTimeout(play, 3000);
}
function postNico(r) {
    iframes[Nico].find("iframe").get(0).contentWindow.postMessage(Object.assign({
        sourceConnectorType: 1,
    }, r), NicoOrigin);
}
window.addEventListener('message', e => {
    if (e.origin !== NicoOrigin) return;
    const { data } = e.data;
    switch (e.data.eventName) {
        case 'playerMetadataChange': break;
        case 'playerStatusChange': {
            switch(data.playerStatus){
                case 2: return setVolume();
                case 4: return playerEnded(Nico);
            }
            break;
        }
        case 'loadComplete': {
            getInfoNico(data.videoInfo);
            break;
        }
        default: break;
    }
});
let funcNico;
function getInfoNico(videoInfo){
    const m = (videoInfo.videoId || videoInfo.watchId).match(/[0-9]+/);
    if(!m) return;
    const checkId = m[0],
          ttl = videoInfo.title,
          img = videoInfo.thumbnailUrl;
    if("function" === typeof funcNico) funcNico({checkId,ttl,img});
}
let scWidget;
function playFirstSoundCloud(id, resolve){
    scWidget = SC.Widget(iframes[SoundCloud].find("iframe").attr({
        scrolling: "no",
        frameborder: "no",
        playsinline: 1,
        allow: "autoplay",
        src: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}`
    }).get(0));
    scWidget.bind(SC.Widget.Events.READY, resolve);
    scWidget.bind(SC.Widget.Events.FINISH, () => playerEnded(SoundCloud));
}
function playSoundCloud(id){
    scWidget.load(`https://api.soundcloud.com/tracks/${id}`, {
        auto_play: false,
        show_teaser: false,
        visual: true,
        callback: () => {
            setVolume();
            play();
        }
    });
    onResize(iframes[SoundCloud].find("iframe"));
    showVideo(SoundCloud);
}
let inputVolume;
function makeInputVolume(){
    const ttl = videoName[whichVideo] + "の音量";
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
function seekTo0(){
    switch(whichVideo){
        case YouTube: return g_yt.seekTo(0);
        case Nico: return postNico({ eventName: "seek", data: { time: 0 } });
        case SoundCloud: return scWidget.seekTo(0);
    }
}
