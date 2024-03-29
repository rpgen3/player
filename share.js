(()=>{
    const imgur = window.imgur,
          h = $("<div>").prependTo("#hideArea"),
          btn = $("<button>").appendTo(h).text("共有").on("click",()=>{
              const input = window.inputURL();
              if(!rpgen3.findURL(input).length) return alert("共有する内容がありません。");
              btn.attr("disabled", true);
              imgur.upload(strToImg(input)).then(({ id, deletehash, token })=>{
                  makeDeleteBtn(deletehash, token);
                  const url = `https://rpgen3.github.io/player/?imgur=${id}`;
                  rpgen3.addInputText(output,{
                      readonly: true,
                      title: "共有用URL",
                      value: url
                  });
                  rpgen3.addInputText(output,{
                      readonly: true,
                      title: "削除用URL",
                      value: url + `&deletehash=${deletehash}&token=${token}`
                  });
              }).catch(()=>{
                  alert("アップロードできませんでした。");
                  btn.attr("disabled", false).show();
              });
          });
    const output = $("<div>").appendTo(h),
          p = rpgen3.getParam(),
          disabled = b => $("#loadBtn").attr("disabled", b);
    if(p.mylist) {
        disabled(true);
        $.ajax({ url: `https://rpgen3.github.io/player/mylist/${p.mylist}.txt` })
            .done(d=>{
            makeNewInputURL(d);
            changePageTtl(p.mylist, "sleepy");
        })
            .fail(()=>msg("共有データの読み込みに失敗しました。", true))
            .always(()=>disabled(false));
    }
    else if(p.imgur){
        disabled(true);
        imgur.load(p.imgur).then(img => {
            makeNewInputURL(imgToStr(img));
            if(p.deletehash && p.token) makeDeleteBtn(p.deletehash, p.token);
            changePageTtl(p.imgur, "yunomi");
        })
            .catch(()=>msg("共有データの読み込みに失敗しました。", true))
            .finally(()=>disabled(false));
    }
    function makeDeleteBtn(deletehash, token){
        btn.hide();
        const btn2 = $("<button>").appendTo(output).text("共有停止").on("click", () => {
            btn2.attr("disabled", true);
            imgur.delete({ deletehash, token }).then(()=>{
                alert("削除しました。");
                output.empty();
                btn.attr("disabled", false).show();
            }).catch(()=>{
                alert("削除できません。");
                btn2.attr("disabled", false);
            });
        });
    }
    function makeNewInputURL(value){
        $("#hideArea").children().last().remove();
        window.inputURL = rpgen3.addInputText("#hideArea", Object.assign({
            value: value
        }, window.paramInputURL));
    }
    function changePageTtl(ttl, img){
        $("title").text(ttl);
        $('link[rel="icon"]').attr("href",`icon/${img}.png`);
    }
})();
