(()=>{
    const imgur = window.imgur,
          h = $("<div>").prependTo("#hideArea"),
          btn = $("<button>").appendTo(h).text("共有").on("click",()=>{
              const input = window.inputURL();
              if(!rpgen3.makeArrayURL(input).length) return alert("共有する内容がありません。");
              btn.attr("disabled", true);
              imgur.upload(strToImg(input)).then(({id, deleteFunc})=>{
                  $("<button>").appendTo(h).text("共有停止").on("click", function(){
                      deleteFunc();
                      $(this).remove();
                      output.empty();
                      btn.attr("disabled", false);
                  });
                  rpgen3.addInputText(output.empty(),{
                      readonly: true,
                      title: "共有用URL",
                      value: `https://rpgen3.github.io/player/?imgur=${id}`
                  });
              }).catch(()=>{
                  alert("アップロードできませんでした。");
                  btn.attr("disabled", false);
              });
          });
    const btnArea = $("<div>").appendTo(h),
          output = $("<div>").appendTo(h);
    setTimeout(()=>{
        const p = rpgen3.getParam();
        if(p.user) $.get(`user/${p.user}.txt`, makeNewInputURL);
        else if(p.imgur){
            imgur.load(p.imgur).then(img => makeNewInputURL(imgToStr(img)))
                .catch(()=>msg("共有データの読み込みに失敗しました。", true));
        }
    },500);
    function makeNewInputURL(value){
        $("#hideArea").children().last().remove();
        window.inputURL = rpgen3.addInputText("#hideArea", Object.assign({
            value: value
        }, window.paramInputURL));
    }
})();
