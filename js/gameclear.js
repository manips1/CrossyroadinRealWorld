let result,level;
let log;
let MyRecord;

const Normal=JSON.parse(localStorage.getItem("Normal")) || [];
const Hard=JSON.parse(localStorage.getItem("Hard")) || [];
const Hell=JSON.parse(localStorage.getItem("Hell")) || [];


window.onload = function() {
    result=getParam("timerecords");
    level=getParam("level");
    console.log(level);
    document.getElementById("timerecords").innerHTML += "<span> Time Record : " + result + "</span>"

    save(level);
    result=load(level);

    let myrank=myRank(result);
    
    document.getElementById("yourRank").innerHTML+="     Your record is "+myrank+" place."



    document.getElementById("rank").onclick=function(){
        let text="LEVEL: "+level+"   TOP10"+"\n";
        for (i in result){
            if(i<10){
            console.log(result[i]);
            rank=Number(i)+1;
            time=result[i]["time"];
            log=result[i]["log"];
            text+="Rank: "+ rank + " Time Record: "+time+" Log: "+log +"\n";
            }
        }
        alert(text);
    }
    
}





let getParam = function (key) {
    let _parammap = {};
        document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
            function decode(s) {
                return decodeURIComponent(s.split("+").join(" "));
            }

            _parammap[decode(arguments[1])] = decode(arguments[2]);
        });

        return _parammap[key];
};

function save(level){
    let date=new Date();
    let year,month,day,hour,minutes,seconds
    year=date.getFullYear();
    month=date.getMonth();
    day=date.getDate();
    hour=date.getHours();
    minutes=date.getMinutes();
    seconds=date.getSeconds();

    date=year+":"+month+":"+day+":"+hour+":"+minutes+":"+seconds;
    const newRecord={
        log: date,
        time: result,
    }
    MyRecord=newRecord;
    if(level==="Normal"){
        Normal.push(newRecord);
        localStorage.setItem("Normal", JSON.stringify(Normal));
    }
    else if(level==="Hard"){
        Hard.push(newRecord);
        localStorage.setItem("Hard", JSON.stringify(Hard));
    }
    else if(level==="Hell"){
        Hell.push(newRecord);
        localStorage.setItem("Hell", JSON.stringify(Hell));
    }
}

function load(level){
    let result;
    if(level==="Normal"){
        result=quickSortForRank(Normal)
    }
    else if(level==="Hard"){
        result=quickSortForRank(Hard)
    }
    else if(level==="Hell"){
        result=quickSortForRank(Hell)
    }
  return result;
}

	
function quickSortForRank (array) {
    if (array.length < 2) {
      return array;
    }
    const pivot = [array[0]];
    const left = [];
    const right = [];
   
    for (let i = 1; i < array.length; i++) {
      if (calcul(array[i]) < calcul(pivot[0])) {
        left.push(array[i]);
      } else if (calcul(array[i]) > calcul(pivot[0])) {
        right.push(array[i]);
      } else {
        pivot.push(array[i]);
      }
    }
    console.log(`left: ${left}, pivot: ${pivot}, right: ${right}`);
    return quickSortForRank(left).concat(pivot, quickSortForRank(right));
  }


function calcul(dict){
    let t=dict["time"];
    t=t.split(":");
    let result= Number(t[0])*3600+Number(t[1])*60+Number(t[2]);
    return result;
}

function myRank(array){
    let myrank
    for (i in array){
        time=result[i]["time"];
        log=result[i]["log"];
        if((MyRecord["log"]===log) && MyRecord["time"]===time){
            myrank=Number(i)+1;
            break;
        }
    }
    return myrank;
}