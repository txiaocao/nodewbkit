var request = require('request');
// var request = request.defaults({jar: true})
var fs = require('fs');
// var url = "http://sda.4399.com/4399swf/upload_swf/ftp15/ssj/20150206/h2/data.js";
// request(url).pipe(fs.createWriteStream('abc.js'));
var url = require('url');
var path = require('path');
var http = require('http');
var querystring = require('querystring');
var zlib = require('zlib');
var args = {
    //参数以及备用数据
    contents: querystring.stringify({  
        //发包的信息
        name: 'sda.4399.com',
    }),
};
// var options = {
//     hostname: 'sda.4399.com',
//     port: 80,
//     path: '/4399swf/upload_swf/ftp15/ssj/20150206/h2/jquery-2.1.1.min.js',
//     method: 'GET',
//     headers: {
//         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//         'Content-Length': args.contents.length,
//         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.11 Safari/537.36',
//         'Accept-Encoding': 'gzip, deflate',
//     },
// };



var get = function (options, args, callback) {
    var req = http.request(options, function (res) {
        var chunks = [], data, encoding = res.headers['content-encoding'];
        // 非gzip/deflate要转成utf-8格式
        if (encoding === 'undefined') {
            res.setEncoding('utf-8');
        }
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
        res.on('end', function () {
            var buffer = Buffer.concat(chunks);
            if (encoding == 'gzip') {
                zlib.gunzip(buffer, function (err, decoded) {
                    data = decoded.toString();
                    callback(err, args, res.headers, data);
                });
            } else if (encoding == 'deflate') {
                zlib.inflate(buffer, function (err, decoded) {
                    data = decoded.toString();
                    callback(err, args, res.headers, data);
                });
            } else {
                data = buffer.toString();
                callback(null, args, res.headers, data);
            }
        });
    });
    req.write(args.contents);
    req.end();
};
//get( options, args, function (err, args, headers, data){
//console.log('==>header \n', headers);
//console.log('==data \n', data);
//fs.writeFile('abc.js',data)
//});
//
//
//

// 创建所有目录
var mkdirs = function (dirpath, mode, callback) {
    fs.exists(dirpath, function (exists) {
        if (exists) {
            if (!callback) {
                return false;
            }
            callback(dirpath);
        } else {
            //尝试创建父目录，然后再创建当前目录
            mkdirs(path.dirname(dirpath), mode, function () {
                fs.mkdir(dirpath, mode, callback);
            });
        }
    });
};

// var data = fs.readFile("608e.har", function (err, bytesRead) {
// 
// });



function download(savepath,har,callback){
    var urls = [];
    var json = JSON.parse(har);
    //console.log(json['log']['entries'].length);

    var i = 0;
    json['log']['entries'].forEach(function (item) {
        i++;
        if (i > 1) {
            //return false;
        }
        //urls.push(item['request']['url']);
        var a = url.parse(item['request']['url']);

        var path = a.path.split("?");
        path = path[0];
        var path = path.split("/");
        path.shift();
        var filename = path.join("/");

        path.pop();
        //console.log(path.join("/"));

        mkdirs(path.join("/"));
        //console.log(path.join("/"));
        //console.log(filename);
        var options = {
            hostname: a.hostname,
            port: 80,
            path: a.path,
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Content-Length': args.contents.length,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.11 Safari/537.36',
                'Accept-Encoding': 'gzip, deflate',
            },
        };
        
        //console.log("请求的地址"+item['request']['url']);
        if(/.png|.jpg/.test(item['request']['url'])){
            request(item['request']['url']).pipe(fs.createWriteStream(savepath+"\\"+filename));
        }else{
            get(options, args, function (err, args, headers, data) {
				//console.log(data);
				//fs.writeFile(filename,1);
                fs.writeFile(savepath+"\\"+filename, data)
            });
        }
        console.log(savepath+"\\"+filename);
    });
    callback();
}


(function(){
    var submit = document.getElementById("submit");
    submit.addEventListener("click",function(){
        var path = document.getElementsByName("path")[0].value;
        var har = document.getElementsByName("har")[0].value;
        
        download(path,har,function(){
            console.log("over");
        });
    });
    
})();