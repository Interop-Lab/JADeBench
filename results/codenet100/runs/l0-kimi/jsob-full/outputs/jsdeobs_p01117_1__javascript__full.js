var input=require('fs').readFileSync('stdin','utf-8');
var arr=input.trim().split('\n');
while(true){
    var [n,m]=arr.shift().split(' ').map(Number);
    if(n==0&&m==0)break;
    var h=[];
    for(var i=0;i<n;i++)h[i]=0;
    for(var i=0;i<m;i++){
        var p=arr.shift().split(' ').map(Number);
        h=p.map((_0x5d5ec3,_0x4b02ba)=>h[_0x4b02ba]+_0x5d5ec3);
    }
    console.log(Math.max(...h));
}
