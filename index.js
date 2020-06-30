var request = require('request');
var parseString = require('xml2js').parseString;

const timelineUrl = {
    url: 'http://www.data.jma.go.jp/developer/xml/feed/extra_l.xml',
    method: 'GET'
}

eachInfomationUrl = {
    url: '',
    method: 'GET'
}

discordUrl = {
    url : "",//ここにウェブフックのURLを入力
    headers : {
        "Content-type" : "application/json",
    },
    json : {
        content:"",
    }
};

targetPrefecture = "広島地方気象台";
var flag = 0;
var much = -1;

var beforeWarning = {};
var Warning = {};
var time = "";

var Process = setInterval(()=>{
request(timelineUrl, (err,res,body)=>{
    if(err){

    }else{
        parseString(body,(err,data)=>{
            var length = Object.keys(data.feed.entry).length;
            for(var i = 0;i < length;i++){
               var Prefecture = data.feed.entry[i]["author"][0].name[0];
               if(Prefecture == targetPrefecture){
                   if(flag != 1){
                       much = i;
                       eachInfomationUrl.url = data.feed.entry[i]["link"][0].$.href;
                   }
                   flag = 1;
                }
            }
            request(eachInfomationUrl,(err,res,body)=>{
                if(err || much == -1){
            
                }else{
                    parseString(body,(err,data)=>{
                        if(data.Report.Head[0].InfoKind[0] == "気象警報・注意報"){
                            Warning = {};
                            var Area = data.Report.Body[0].Warning[3].Item[0];
                            time = data.Report.Head[0].TargetDateTime[0];
                            for(var i = 0;i < Object.keys(Area.Kind).length;i++){
                                Warning[Area.Kind[i].Name[0]] = Area.Kind[i].Status[0];
                            }
                        }
                        if(JSON.stringify(beforeWarning) != JSON.stringify(Warning)){
                            discordUrl.json.content = JSON.stringify(Warning);
                            request.post(discordUrl, (error, response, body)=>{});
                            console.log(Warning);
                            beforeWarning = Warning;
                        }
                    });
                }
            })
        })
    }
})

},10000);



