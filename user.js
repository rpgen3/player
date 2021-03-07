setTimeout(()=>{
    const p = rpgen3.getParam();
    if(p.user) $.get(`user/${p.user}.txt`,r=>makeNewInputURL(r));
    else if(p.imgur){
        $("<img>").on("load", function(){
            makeNewInputURL(loadImg(this));
        }).attr({
            crossOrigin: "anonymous",
            src: `https://i.imgur.com/${p.imgur}.png`
        });
    }
},500);
function makeNewInputURL(value){
    window.inputURL = rpgen3.addInputText($("#hideArea").empty(),Object.assign({
        value: value
    }, window.paramInputURL));
}
function loadImg(img){
    const width = img.width,
          height = img.height,
          cv = $("<canvas>").attr({
              width: width,
              height: height
          }),
          ctx = cv.get(0).getContext('2d');
    ctx.drawImage(img,0,0);
    const data = ctx.getImageData(0, 0, width, height).data,
          ar = [];
    for(let i = 0; i < data.length; i++){
        const i4 = i * 4;
        for(let o = 0; o < 3; o++){
            ar.push(data[i4 + o]);
        }
    }
    let str = '';
    for(let p = 0; p < ar.length; p++){
        const n = ar[p];
        if(n < 128){
            str += String.fromCharCode(n);
        }
        else if(n === 128){
            str += String.fromCharCode((ar[p + 1] << 8) + ar[p + 2]);
            p += 2;
        }
    }
    return str.replace(/\0+$/,'');
}
