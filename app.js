const express = require('express')
const cherio = require('cherio');
const request = require('request');
const fs = require('fs');
const https = require('https')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get("/downloadImages", async(req,res) => {
       try{
        let images = []
        var WriteStream  = fs.createWriteStream("ImagesLink.txt", "UTF-8");
        async function download(url){
            request("https://www.growpital.com", (err, resp, html)=>{
                if(!err && resp.statusCode == 200){
                    console.log("Request was success "); 
                    const $ = cherio.load(html);
                    $("img").each((index, image)=>{
                        var img = $(image).attr('src');
                        if(img.slice(0,4) == 'http'){
                            var Links = img
                        }else{
                            var baseUrl = "https://www.growpital.com";
                            var Links = baseUrl + img;
                        }
                        WriteStream.write(Links);
                        WriteStream.write("\n");
                        if(!images.includes(Links)) images.push(Links)
                    });
                }else{
                    console.log(err);
                    return res.send({status : false, msg : err})
                }
                console.log(images.length)
                for(let i = 0; i < images.length; i++){
                    setTimeout(() => {
                        var fullUrl = images.shift()
                        let path = "./uploads/" + Date.now() + ".jpg"
                        let localPath = fs.createWriteStream(path);
                        let request = https.get(fullUrl, function(response){
                        console.log("downloaded successfully",i);
                        response.pipe(localPath)
                    })
                    },1000*i)
                }
            });
        } 
        (async () => {
        try {
            let homePageLinks = await download(baseUrl)
            console.log(homePageLinks);
    } catch (e) { console.log(e); }

})();
    res.send({status : true, msg : "Downloaded successfully"})
       }catch(error){
        res.send({status : false, msg : error.message})
       }
    })

app.listen(3000, ()=>{
    console.log("Listening on port 3000")
})
