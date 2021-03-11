(()=>{
    const imgur = window.imgur,
          h = $("<div>").prependTo("#hideArea"),
          btn = $("<button>").appendTo(h).text("共有").on("click",()=>{
              btn.attr("disabled", true);
              imgur.upload(strToImg(window.inputURL())).then((id,deleteFunc)=>{
                  $("<button>").appendTo(h).text("共有停止").on("click", function(){
                      deleteFunc();
                      $(this).remove();
                      btn.attr("disabled", false);
                  });
                  rpgen3.addInputText(output.empty(),{
                      readonly: true,
                      title: "共有用URL",
                      value: `https://rpgen3.github.io/player/?imgur=${id}`
                  });
              }).catch((e)=>{
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
                .catch((e)=>alert("共有データの読み込みに失敗しました。"));
        }
    },500);
    function makeNewInputURL(value){
        window.inputURL = rpgen3.addInputText($("#hideArea").children().last().remove(), Object.assign({
            value: value
        }, window.paramInputURL));
    }
})();
