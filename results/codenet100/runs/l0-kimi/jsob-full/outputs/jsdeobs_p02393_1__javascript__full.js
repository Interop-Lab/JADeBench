var input=require('fs').readFileSync('stdin','utf-8').trim().split(' '),cnt,i,j;
for(cnt=0;cnt<10;cnt++){
  for(i=0;i<100;i++){
    if(input[i]>input[i+1]){
      j=input[i];
      input[i]=input[i+1];
      input[i+1]=j;
    }
  }
}
console.log('result',input[0],input[1],input[2]);
