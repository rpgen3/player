(function(window, undefined){
    "use strict";
    var rpgen3 = {
        //------------------------------------------------------------------------------------------------------
        // メタ
        hello: function(){ // このライブラリの関数の説明
            var sstr = '';
            for(var k in rpgen3) {
                var str = String(rpgen3[k]);
                var agm = str.match(/function.*?(\(.*?\))/);
                agm = agm ? agm[1] : '<not function>';
                var cmt = str.match(/\/\/.*\n/);
                cmt = cmt ? cmt[0] : '';
                sstr += [k, agm, cmt].join(' ');
            }
            return sstr;
        },
        //------------------------------------------------------------------------------------------------------
        // 型判定
        getType: function(x){ // 型を返す
            return Object.prototype.toString.call(x).replace(/\[object |\]/g,'');
            // return value sample
            // "String","Number","Boolean","Array","Object","RegExp",
            // "Function","Null","Undefined"
            // "HTMLElement","HTMLDivElement","HTMLSpanElement","HTMLUnknownElement" etc
        },
        judgeType: function(x, typeName){ // xが指定された型名ならtrueを返す
            var type = rpgen3.getType(x);
            switch(rpgen3.getType(typeName)){
                case "String":
                    return typeName === type;
                case "Array":
                    return typeName.indexOf(type) !== -1;
                default:
                    return null;
            }
        },
        init: function(param, default_param){ // キーの型が異なる場合default_paramのキーで上書き
            if(!rpgen3.judgeType(param,"Object")) param = {};
            for(var key in default_param){
                var default_type = rpgen3.getType(default_param[key]);
                var type = rpgen3.getType(param[key]);
                if(type !== default_type) param[key] = default_param[key];
            }
            return param;
        },
        //------------------------------------------------------------------------------------------------------
        // 闇鍋
        try: function(func){ // 失敗しても処理が止まらないようにfuncを実行する
            try {
                func();
            }
            catch (err) {
                console.error(err);
            }
        },
        max: function(array){ // 配列から最大値を求める
            return array.reduce(function(a,b){
                return a > b ? a : b;
            });
        },
        min: function(array){ // 配列から最小値を求める
            return array.reduce(function(a,b){
                return a < b ? a : b;
            });
        },
        randInt: function(min, max){ // ランダムな整数を返す
            return Math.floor(Math.random() * Math.abs(max - min + 1)) + min;
        },
        makeArray: function(num){ // 0からn-1までの連続した数値の配列を返す
            if(isNaN(num)) return [];
            var ar = [];
            for(var i = 0; i < num; i++) ar.push(i);
            return ar;
        },
        randArray: function(array){ // 配列のランダムな要素を返す
            return array[Math.floor(Math.random()*array.length)];
        },
        shuffle: function(array){ // 配列をシャッフル
            var m = array.length;
            while (m) {
                var i = Math.floor(Math.random() * m--);
                var c = array[m];
                array[m] = array[i];
                array[i] = c;
            }
            return array;
        },
        repeat: function(str, num){ // strをnum回繰り返した文字列を返す
            return new Array(num + 1).join(str);
        },
        getTime: function(n){ // xx:yy:zz の形式で現在時刻の文字列を返す
            if(!n) return new Date().toString().match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)[0];
            var d = new Date(n);
            return [
                d.getHours() - 9,
                d.getMinutes(),
                d.getSeconds()
            ].map(v=>('00' + v).slice(-2)).join(':');
        },
        getBrowser: function(){ // ブラウザの名前を取得
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.indexOf("edge") !== -1 || ua.indexOf("edga") !== -1 || ua.indexOf("edgios") !== -1) {
                return "Microsoft Edge";
            }
            else if (ua.indexOf("opera") !== -1 || ua.indexOf("opr") !== -1) {
                return "Opera";
            }
            else if (ua.indexOf("samsungbrowser") !== -1) {
                return "Samsung Internet Browser";
            }
            else if (ua.indexOf("ucbrowser") !== -1) {
                return "UC Browser";
            }
            else if(ua.indexOf("chrome") !== -1 || ua.indexOf("crios") !== -1) {
                return "Google Chrome";
            }
            else if(ua.indexOf("firefox") !== -1 || ua.indexOf("fxios") !== -1) {
                return "Mozilla Firefox";
            }
            else if(ua.indexOf("safari") !== -1) {
                return "Safari";
            }
            else if (ua.indexOf("msie") !== -1 || ua.indexOf("trident") !== -1) {
                return "Internet Explorer";
            }
            return false;
        },
        getOS: function(){ // OSの名前を取得
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.indexOf("windows nt") !== -1) {
                return "Microsoft Windows";
            } else if(ua.indexOf("android") !== -1) {
                return "Android";
            } else if(ua.indexOf("iphone") !== -1 || ua.indexOf("ipad") !== -1) {
                return "iOS";
            } else if(ua.indexOf("mac os x") !== -1) {
                return "macOS";
            }
            return false;
        },
        getIP: function(callback){ // IPアドレス等の情報を取得し、callbackの引数に渡す
            var xhr = new XMLHttpRequest();
            xhr.open( 'GET', "https://ipinfo.io/?callback=a" );
            xhr.responseType = 'text';
            xhr.onload = function(){
                var m = xhr.response.match(/{.*?}/);
                if(!m) return;
                callback(JSON.parse(m[0]));
            };
            xhr.send();
        },
        //------------------------------------------------------------------------------------------------------
        // 文字列操作
        toHan: function(str){ // 全角→半角
            return str.replace(/[Ａ-Ｚａ-ｚ０-９！-～]/g, function(c){
                return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
            });
        },
        toZen: function(str){ // 半角→全角
            return str.replace(/[A-Za-z0-9!-~]/g, function(c){
                return String.fromCharCode(c.charCodeAt(0) + 0xFEE0);
            });
        },
        toHira: function(str){ // カナ→ひら
            return str.replace(/[\u30a1-\u30f6]/g, function(c){
                return String.fromCharCode(c.charCodeAt(0) - 0x60);
            });
        },
        toKana: function(str){ // ひら→カナ
            return str.replace(/[\u3041-\u3096]/g, function(c){
                return String.fromCharCode(c.charCodeAt(0) + 0x60);
            });
        },
        //------------------------------------------------------------------------------------------------------
        // URL関連
        makeArrayURL: function(str){ // 与えられた文字列からURL文字列を探し、配列を返す
            var m = str.match(/(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g);
            return m ? m : [];
        },
        // 以下2つとも引数の指定が無ければ現在閲覧しているサイトのURLが入る
        getDomain: function(url){ // URLのドメインを配列にして返す
            var a = url || location.href;
            return a.replace(/^.+?\/\/|\/.*$/g,'').split('.');
        },
        getParam: function(url){ // URLのクエリパラメータを連想配列形式で取得
            var a = url || location.href,
                p = {};
            var q = a.split('?');
            if(q.length === 1) return {};
            q[1].split('&').map(function(v){
                var ar = v.split('=');
                if(ar.length !== 2) return;
                p[ar[0]] = ar[1];
            });
            return p;
        },
        //------------------------------------------------------------------------------------------------------
        // ブラウザによって仕様が変わりやすいデリケートな操作
        copy: function(str){ // 文字列をクリップボードにコピー
            var e = document.createElement("textarea");
            e.textContent = str;
            document.body.appendChild(e);
            e.select();
            document.execCommand('copy');
            document.body.removeChild(e);
            return true;
        },
        download: function(title, str){ // 文字列をテキストファイル形式で保存
            if(!rpgen3.judgeType(str,"String") || str === '') return false; // 失敗
            if(!rpgen3.judgeType(title,"String") || title === '') return false; // 失敗
            var strText = str.replace(/\n/g,'\r\n'); // 改行を置換
            var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);// 文字化け対策
            var blob = new Blob([bom, strText], {type: "text/plain"});
            var a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.target = '_blank';
            a.download = title + '.txt';
            a.click();
            return true; // 成功
        },
        //------------------------------------------------------------------------------------------------------
        // データの保存
        makeSaveKey: function(key){ // URLごとに保存する領域を分けるためのキーを作成
            if(!rpgen3.judgeType(key,"String") || key === '') return false;
            var thisURL = location.href.split('?')[0] + '|'; // クエリを除く
            return thisURL + key;
        },
        getSaveKeys: function(){ // 保存されているキーを配列で取得
            var ar = [], i = 0;
            var thisURL = location.href.split('?')[0] + '|';
            if(window.localStorage){
                while(true){
                    var key = window.localStorage.key(i++);
                    if(!key) break;
                    if(!key.indexOf(thisURL)) ar.push(key.replace(thisURL,''));
                }
            }
            else {
                document.cookie.split(';').map(function(v){
                    var key = rpgen3.decode(v.split('=')[0]);
                    if(!key.indexOf(thisURL)) ar.push(key.replace(thisURL,''));
                });
            }
            return ar;
        },
        removeSaveData: function(key){ // 指定されたキーのデータを削除
            var SaveKey = rpgen3.makeSaveKey(key);
            if(!SaveKey) return false;
            if(window.localStorage) window.localStorage.removeItem(SaveKey);
            else document.cookie = rpgen3.encode(SaveKey) + "=; max-age=0";
            return true;
        },
        save: function(key, value){ // 文字列を保存
            var SaveKey = rpgen3.makeSaveKey(key);
            if(!SaveKey) return false;
            if(window.localStorage) window.localStorage.setItem(SaveKey, value);
            else document.cookie = rpgen3.encode(SaveKey) + '=' + rpgen3.encode(value);
            return true;
        },
        load: function(key, callback){ // 保存した文字列の読み込み(callbackの引数に渡される)
            var SaveKey = rpgen3.makeSaveKey(key);
            if(!SaveKey) return false;
            var data = null;
            if(window.localStorage){
                data = window.localStorage.getItem(SaveKey);
                if(data === null) return false;
            }
            else {
                var key2 = rpgen3.encode(SaveKey);
                var idx = document.cookie.indexOf(key2 + '=') + key2.length + 1;
                if(idx === -1) return false;
                data = rpgen3.decode(document.cookie.slice(idx).split(';')[0]);
            }
            callback(data);
            return true;
        },
        //------------------------------------------------------------------------------------------------------
        // DOM操作
        getCSS: function(elm){ // elmのCSSの値を取得する
            var e = $(elm || document.body).get(0);
            return e.currentStyle || document.defaultView.getComputedStyle(e, '');
        },
        getFontSize: function(elm){ // elmのフォントサイズを取得する
            var size = rpgen3.getCSS(elm).fontSize;
            return Number(size.slice(0,-2)) + 1;
        },
        getRGB: function(color){ // color文字列をRGBの配列にして返す。
            var elm = $("<div>").appendTo(document.body).css("color",color);
            var m = rpgen3.getCSS(elm).color.match(/[0-9]+/g);
            elm.remove();
            if(!m) return false; // 失敗
            return m.map(function(n){
                return Number(n);
            });
        },
        setBgImg: (function(){
            var elm;
            return function(url, cover){ // 背景画像を設定する。
                var p = rpgen3.init(cover,{
                    color: "white",
                    opacity: 0.8 // 透過度
                });
                if(elm) elm.remove();
                elm = $("<div>").appendTo($("body"));
                var colors = rpgen3.getRGB(p.color);
                elm.css({
                    zIndex: -114514,
                    background: colors ? "rgba(" + colors.join(',') + "," + p.opacity + ")" : p.color,
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                });
                if(!url) return true;
                $("body").css({
                    "background-image": 'url("' + url + '")',
                    "background-attachment": "fixed", // コンテンツの高さが画像の高さより大きい時、動かないように固定
                    "background-position": "center center",// 画像を常に天地左右の中央に配置
                    "background-size": "cover", // 表示するコンテナの大きさに基づいて、背景画像を調整
                    "background-repeat": "no-repeat", // 画像をタイル状に繰り返し表示しない
                });
                return true;
            };
        })()
        //------------------------------------------------------------------------------------------------------
    };
    //------------------------------------------------------------------------------------------------------
    // ########################################################################################################
    // ######## private関数群 ################################################################################################
    // 要素の属性の設定
    function _setAttr(p, elm){ // p: パラメータ, elm: 要素
        if(p.id !== '') elm.attr('id', p.id);
        if(p.class !== '') elm.addClass(p.class);
        elm.attr('placeholder',p.placeholder).css({
            maxWidth: "95%",
            minWidth: rpgen3.getFontSize() * 5,
            "vertical-align": "middle"
        });

    }
    // リサイズ処理
    function _setResize(p, elm, parentNode, func){ // p: パラメータ, elm: 要素, func: 要素の中に表示する文字列を返す関数
        function resize(){
            // 幅の調整
            function mostLongLine(str){ // 文字列の中で最も長い行の文字数
                return rpgen3.max(str.split('\n').map(function (v){
                    return v.length;
                }));
            }
            var fontSize = rpgen3.getFontSize(),
                p_w = $(parentNode).width();
            if(p.width !== '') elm.width(p.width);
            else {
                var maxWidth = p_w;
                if(p.title !== '') maxWidth -= fontSize * (p.title.length + 1);
                var width = fontSize * mostLongLine(func());
                if(p.placeholder !== '') {
                    var phWidth = fontSize * mostLongLine(p.placeholder);
                    if(phWidth > width) width = phWidth;
                }
                if(width > maxWidth) width = maxWidth;
                elm.width(width);
            }
            // 高さの調整
            if(!p.textarea) return;
            if(p.height !== '') elm.height(p.height);
            else {
                var line = func().split('\n').length;
                var line_p = p.placeholder.split('\n').length;
                if(line < line_p) line = line_p;
                func().split('\n').forEach(function(v){
                    line += Math.floor((v.length * fontSize) / p_w);
                });
                elm.height(line + "em");
            }
        }
        resize();
        $(window).on("resize", resize);
        elm.on("keyup click change", resize);
    }
    function _setCommonInput(p, elm, parentNode){
        var h = $("<div>").appendTo(parentNode);
        if(p.title !== '') h.text(p.title + ':');
        elm.appendTo(h).val(p.value).keypress(function(e){
            if(e.key === 'Enter') p.enter();
        });
        if(p.readonly) {
            elm.attr("readonly", true).on("click",function(){
                rpgen3.copy(elm.val());
                elm.select();
            }).css({
                backgroundColor: "#e9e9e9",
                tabIndex: -1,
                cursor: "pointer"
            });
        }
        if(p.save){
            rpgen3.load(p.save, function(v){
                elm.val(v);
                elm.trigger("change");
            });
        }
    }
    // ########################################################################################################
    // ########################################################################################################
    // HTML要素を追加する, 関数の返り値は、入力値を返す関数
    rpgen3.addInputText = function(parentNode, param){ // 文字列入力欄を追加
        if(undefined === param.value) param.value = '';
        param.value = String(param.value);
        var p = rpgen3.init(param,{
            id: '', // HTML
            class: '', // HTML
            title: '', // タイトル
            placeholder: '', // 説明文
            value: '', // 初期値
            change: function(){}, // 値が変更されたとき実行する関数
            enter: function(){}, // Enterキーで実行する関数
            save: '', // 変更された値を保存する領域
            hankaku: true, // trueなら自動で半角化
            max: Infinity, // 入力可能な最大長
            textarea: false, // trueならtextarea要素になる
            width: '', // widthがこの値で固定
            height: '', // heightがこの値で固定(textareaの時のみ有効)
            readonly: false, // trueならユーザーは編集不可&クリック時全選択&コピー
            trim: true, // trueなら入力の両端の空白文字などを自動削除
        });
        var elm = $(p.textarea ? "<textarea>" : "<input>");
        _setCommonInput(p, elm, parentNode);
        _setAttr(p, elm);
        _setResize(p, elm, parentNode, function(){
            return elm.val();
        });

        if(p.textarea){ // https://qiita.com/okyawa/items/8c7bee52b203f6956d44
            if(rpgen3.getBrowser() === "Google Chrome") {
                var str = elm.val();
                elm.focus();
                elm.val('');
                elm.val(str);
                elm.blur();
            }
        }

        function change(){
            var v = elm.val();
            if(p.trim) v = v.trim();
            if(p.hankaku) v = rpgen3.toHan(v);
            if(v.length > p.max) v = v.slice(0, p.max);
            var re = p.change(v);
            if(rpgen3.judgeType(re,"String")) v = re;
            elm.val(v);
            if(p.save) rpgen3.save(p.save, v);
        }
        elm.on("change", change);
        rpgen3.try(change);

        return function(){
            return elm.val();
        };
    };

    rpgen3.addInputNumber = function(parentNode, param){ // 数値入力欄を追加
        if(rpgen3.judgeType(param,"Object")){
            ['value', 'min', 'max'].forEach(function(v){
                if(rpgen3.judgeType(param[v],"String")) param[v] = Number(param[v]);
            });
        }
        var p = rpgen3.init(param,{
            id: '', // HTML
            class: '', // HTML
            title: '', // タイトル
            placeholder: '', // 説明文
            value: 0, // 初期値
            change: function(){}, // 値が変更されたとき実行する関数
            enter: function(){}, // Enterキーで実行する関数
            save: '', // 変更された値を保存する領域
            min: 0, // 入力可能な最小値
            max: Infinity, // 入力可能な最大値
            int: false, // trueなら自動で整数化
            width: '', // widthがこの値で固定
            readonly: false, // trueならユーザーは編集不可&クリック時全選択&コピー
        });
        var elm = $("<input>");
        _setCommonInput(p, elm, parentNode);
        _setAttr(p, elm);
        _setResize(p, elm, parentNode, function(){
            return elm.val();
        });

        function change(){
            var n = Number(rpgen3.toHan(elm.val().trim()).replace(/[^0-9\.\-\+]/g,""));
            if(isNaN(n)) n = 0;
            if(n < p.min) n = p.min;
            else if(n > p.max) n = p.max;
            if(p.int) n = Math.floor(n);
            var re = p.change(n);
            if(rpgen3.judgeType(re,"Number")) n = re;
            var v = String(n);
            elm.val(v);
            if(p.save) rpgen3.save(p.save, v);
        }
        elm.on("change", change);
        rpgen3.try(change);

        return function(){
            return Number(elm.val());
        };
    };

    rpgen3.addInputRange = function(parentNode, param){ // 数値入力レンジバーを追加
        if(rpgen3.judgeType(param,"Object")){
            ['value', 'min', 'max'].forEach(function(v){
                if(rpgen3.judgeType(param[v],"String")) param[v] = Number(param[v]);
            });
        }
        var p = rpgen3.init(param,{
            id: '', // HTML
            class: '', // HTML
            title: '', // タイトル
            value: 50, // 初期値
            change: function(){}, // 値が変更されたとき実行する関数
            save: '', // 変更された値を保存する領域
            min: 0, // 入力可能な最小値
            max: 100, // 入力可能な最大値
            width: '', // widthがこの値で固定
            step: 1,
        });
        var elm = $("<input>").attr({
            type: "range",
            value: p.value,
            min: p.min,
            max: p.max,
            step: p.step
        });
        _setCommonInput(p, elm, parentNode);
        _setAttr(p, elm);

        function change(){
            var n = Number(elm.val());
            if(isNaN(n)) n = 0;
            var re = p.change(n);
            if(rpgen3.judgeType(re,"Number")) n = re;
            var v = String(n);
            elm.val(v);
            if(p.save) rpgen3.save(p.save, v);
        }
        elm.on("change", change);
        rpgen3.try(change);

        return function(){
            return Number(elm.val());
        };
    };

    rpgen3.addInputBool = function(parentNode, param){ // ON OFFボタンを追加
        var p = rpgen3.init(param,{
            id: '', // HTML(button)
            class: '', // HTML(button)
            title: '', // タイトル
            value: false, // 初期値
            change: function(){}, // 値が変更されたとき実行する関数
            save: '', // 変更された値を保存する領域
        });
        var flag = !!p.value;
        var elm = $("<button>").appendTo(parentNode).text(p.title).on("click",function(){
            flag = !flag;
            change();
        });
        _setAttr(p, elm);
        var check = $("<input>",{type:"checkbox"}).prependTo(elm);
        if(p.save){
            rpgen3.load(p.save, function(v){
                flag = (v === '1');
                change();
            });
        }
        function change(){
            var re = p.change(flag);
            if(rpgen3.judgeType(re,"Boolean")) flag = re;
            elm.css("background-color", flag ? "orange" : "gray");
            check.prop("checked", flag);
            if(p.save) rpgen3.save(p.save, flag ? '1' : '0');
        }
        rpgen3.try(change);

        return function(){
            return flag;
        };
    };

    rpgen3.addSelect = function(parentNode, param){ // 選択肢を追加
        if(undefined === param.value) param.value = '';
        param.value = String(param.value);
        if(rpgen3.judgeType(p.list,"Array")){
            var obj = {};
            param.list.forEach(function(v){
                obj[v] = v;
            });
            param.list = obj;
        }
        var p = rpgen3.init(param,{
            id: '', // HTML(select)
            class: '', // HTML(select)
            title: '', // タイトル
            placeholder: '', // 説明文
            value: '', // 初期値
            change: function(){}, // 値が変更されたとき実行する関数
            save: '', // 変更された値を保存する領域
            list: {}, // 選択肢の連想配列
            width: '', // widthがこの値で固定
        });
        var elm = $("<select>");
        function getValue(){
            return elm.val() || '';
        }
        function updateSelect(){
            var v = getValue();
            elm.empty();
            if(p.placeholder !== '') $("<option>",{text:p.placeholder}).val('').hide().appendTo(elm);
            for(var k in p.list) $("<option>",{text:k}).val(String(p.list[k])).appendTo(elm);
            if(v) elm.val(v);
            if(Object.keys(p.list).map(v=>String(p.list[v])).indexOf(v) === -1) elm.val(elm.children().first().val());
        }
        elm.hover(updateSelect).on('updateSelect', updateSelect);

        _setCommonInput(p, elm, parentNode);
        _setAttr(p, elm);
        _setResize(p, elm, parentNode, getValue);

        function change(){
            var v = getValue();
            var re = p.change(v);
            if(rpgen3.judgeType(re,"String")) v = re;
            elm.val(v);
            if(p.save) rpgen3.save(p.save, v);
        }
        elm.on("change", change);
        rpgen3.try(change);

        updateSelect();

        return getValue;
    };
    rpgen3.addHideArea = function(parentNode, param){ // ボタンで表示を切り替えられる非表示エリアを追加
        var p = rpgen3.init(param,{ // addInputBool参照
            id2: '', // HTML(div) 非表示エリアのdiv要素
            class2: '', // HTML(div)
            speed: 300, // 表示するスピード[秒]
        }); // elm ... 非表示エリアにする要素
        var front = $("<span>").appendTo(parentNode);
        var area = (p.elm || $("<div>")).appendTo(parentNode);
        p.change = function(flag){ // changeはこの関数が使うので設定しても反映されない
            area[flag ? "show" : "hide"](p.speed,()=>$(window).resize());
        }
        if(p.id2 !== '') area.attr('id', p.id2);
        if(p.class2 !== '') area.addClass(p.class2);
        return rpgen3.addInputBool(front, p);
    };
    rpgen3.addTab = function(parentNode, param){ // タブを追加
        var p = rpgen3.init(param,{ // addInputBool参照
            list: {}, // タブの名前と要素
            title: '', // タイトル
            value: '', // 初期値(タブの名前)
        });
        var h = $("<div>").appendTo(parentNode);
        var area = $("<div>").appendTo(parentNode);
        if(p.title !== '') h.text(p.title + ':');
        var btns = {}, activTabName;
        for(var k in p.list){
            (function(k){ // 関数スコープ
                btns[k] = $("<button>").appendTo(h).text(k).on("click",function(){
                    activTabName = k;
                    h.find("button").css("backgroundColor","gray");
                    $(this).css("backgroundColor","yellow");
                    area.children().hide();
                    p.list[k].show();
                    $(window).resize();
                });
            })(k);
            area.append(p.list[k]);
        }
        if(btns[p.value]) btns[p.value].click();
        else h.find("button").first().click();
        return function(){
            return activTabName;
        };
    };
    //------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------
    rpgen3.baseN = function(base){ // N進数を作成するクラス,baseは重複のない文字列
        if(typeof base !== "string") return false; // error
        var len = base.length;
        if(len < 2) return false; // error
        function encode(num){ // 10進数をN進数に変換
            var str = "", v = num;
            if(!v) return base[0];
            while(v){
                v = Math.floor(v);
                str = base[v % len] + str;
                v /= len;
            }
            return str.slice(1);
        };
        function decode(str){ // N進数を10進数に変換
            return String(str).split('').reverse().map(function(v,i){
                return base.indexOf(v) * Math.pow(len, i);
            }).reduce(function(total, v){
                return total + v;
            });
        };
        return {
            encode: encode,
            decode: decode,
            base: base
        };
    };
    (function(){
        // 0~9 a~z A~V → 無変換、左端にWを追加する
        // 58進数の一桁、左端にXを追加する
        // 58進数の二桁、左端にYを追加する
        // 58進数の三桁、左端にZを追加する
        var to58 = rpgen3.baseN([ // 58進数
            '0123456789',
            'abcdefghijklmnopqrstuvwxyz',
            'ABCDEFGHIJKLMNOPQRSTUV',
        ].join(''));
        var SIGN = 'WXYZ';
        rpgen3.encode = function(str){ // 文字列をエンコード
            if(typeof str !== "string") return false; // error
            return str.split('').map(function(v){
                if(to58.base.indexOf(v) !== -1) return SIGN[0] + v + SIGN[0];
                else {
                    var str = to58.encode(v.charCodeAt(0));
                    if(str.length > 3) return ''; // 58**3以上のユニコードは空文字
                    var len = str.length;
                    return SIGN[len] + (rpgen3.repeat('0',len) + str).slice(-len) + SIGN[len];
                }
            }).join('').replace(/(W|X|Y|Z)\1/g,'').replace(/(W|X|Y|Z)(?=(W|X|Y|Z))/g,'').slice(0,-1).replace(/^W/,'');
        };
        rpgen3.decode = function(str){ // エンコードされた文字列をデコード
            if(typeof str !== "string") return false; // error
            return str.replace(/(W|X|Y|Z)[^WXYZ]*/g, function(v){
                var s = v.slice(1);
                var idx = SIGN.indexOf(v[0]);
                if(!idx) return s;
                return s.replace(new RegExp(".{" + idx + "}", 'g'), function(n){
                    return String.fromCharCode(to58.decode(n));
                });
            });
        };
    })();
    //------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------
    window.rpgen3 = rpgen3;
})(typeof window === 'object' ? window : this);
