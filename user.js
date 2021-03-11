(()=>{
    const imgur = window.imgur,
          h = $("<div>").prependTo("#hideArea"),
          btn = $("<button>").appendTo(h).text("共有").on("click",()=>{
              const input = window.inputURL();
              if(!rpgen3.makeArrayURL(input).length) return alert("共有する内容がありません。");
              btn.attr("disabled", true);
              imgur.upload(strToImg(input)).then(({ id, dhash, token })=>{
                  makeDeleteBtn(dhash, token);
                  rpgen3.addInputText(output,{
                      readonly: true,
                      title: "共有用URL",
                      value: `https://rpgen3.github.io/player/?imgur=${id}`
                  });
                  rpgen3.addInputText(output,{
                      readonly: true,
                      title: "削除用URL",
                      value: `https://rpgen3.github.io/player/?imgur=${id}&dhash=${dhash}&token=${token}`
                  });
              }).catch(()=>{
                  alert("アップロードできませんでした。");
                  btn.attr("disabled", false).show();
              });
          });
    const output = $("<div>").appendTo(h),
          p = rpgen3.getParam(),
          loadBtn = $("#loadBtn").hide();
    if(p.user) {
        $.ajax({
            url: `user/${p.user}.txt`
        }).done(d => {
            makeNewInputURL(d);
            loadBtn.show();
        }).fail(() => {
            msg("共有データの読み込みに失敗しました。", true);
            loadBtn.show();
        });
    }
    else if(p.imgur){
        imgur.load(p.imgur).then(img => {
            makeNewInputURL(imgToStr(img));
            if(p.dhash && p.token) makeDeleteBtn(p.dhash, p.token);
            loadBtn.show();
        }).catch(()=>{
            msg("共有データの読み込みに失敗しました。", true);
            loadBtn.show();
        });
    }
    function makeDeleteBtn(dhash, token){
        btn.hide();
        const btn2 = $("<button>").appendTo(output).text("共有停止").on("click", () => {
            btn2.attr("disabled", true);
            imgur.delete({ dhash, token }).then(()=>{
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
})();
