var input=require('fs').readFileSync('stdin','utf-8'),arr=input.trim().split('\n');
while(true){
var npq=arr.shift();
if(npq=='0 0 0')break;
npq=npq.split(' ');
var n=npq[0]-0,p=time(npq[1]),q=time(npq[2]),tv=[];
for(var i=p;i<q;i++)tv[i]=0;
for(var i=0;i<n;i++){
var cm=arr.shift(),ary=arr.shift().split(' ');
for(var j=0;j<cm;j++){
var start=time(ary.shift()),stop=time(ary.shift());
for(var k=start;k<stop;k++)tv[k]++;
}
}
var max=0,cnt=0;
for(var i=p;i<q;i++){
tv[i]!=n?cnt++:(max=Math.max(max,cnt),cnt=0);
}
max=Math.max(max,cnt),console.log(max);
}
function time(s){
var ops={
add:function(a,b){return a+b},
mul:function(a,b){return a*b}
};
s=s.split('').map(Number);
return ops.add(ops.add(ops.mul(ops.add(ops.mul(s[0],10),s[1]),60),ops.mul(s[2],10)),s[3]);
}
