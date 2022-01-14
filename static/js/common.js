const toDoList = document.querySelector(".js_toDoList");
const todo_text = document.querySelector("#todo_text");
const star_select = document.querySelector("#star_select option:checked");

$(function(){
    $('.add_wrap > button').on('click', function () {
        let static = $('.add_box').css('display');
        if (static === 'block') {
            $('.add_box').hide();
            $('.add_wrap > button').css({'top':'-134px'});
            $('.add_wrap').css({marginTop: 180});
        }
        else if(static === 'none'){
            $('.add_box').show();
            $('.add_wrap > button').css({'top':'-49px'});
            $('.add_wrap').css({marginTop: 95});
        }
    });

    $(document).ready(function () {
            movie_rank();
            festival_info();
            $('div.date').text(`${yyyy}년 ${mm}월 ${dd}일 ${day}요일`)
            getTime()
            requestCoords();
            loadToDoList();
        });

    function getWeather(lat,lon){
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=46f663ddc5f560ab47650e4b28a58520&units=metric`)
            .then((response) => response.json())
            .then((data) => {
                const temp = data.main.temp
                const weather = data.weather[data.weather.length - 1].icon
                const city = data.name
                $('.weather_info').text(`${city} / ${temp}°C`)
                $('.weather_icon').append(`<img src="../static/img/weather/${weather}.svg" alt="weather">`)
            })
    }

    function handleGeoSuccess(position){
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        const coordsObj = {
            latitude,
            longitude
        }
        getWeather(coordsObj['latitude'],coordsObj['longitude'])
    }
    function handleGeoError(err){
        console.log('geo err! '+err)
    }
    function requestCoords(){
        navigator.geolocation.getCurrentPosition(handleGeoSuccess,handleGeoError)
    }


    let today = new Date()
    let yyyy = today.getFullYear()
    let mm = ('0' + (1 + today.getMonth())).slice(-2)
    let dd = ('0' + today.getDate()).slice(-2)
    let week_arr = ['일','월','화','수','목','금','토']
    let day = week_arr[today.getDay()]

    const time = document.querySelector('.time')
    function getTime(){
        let today = new Date()
        let hour = ('0' + today.getHours()).slice(-2)
        let minutes = ('0' + today.getMinutes()).slice(-2)
        time.textContent = `${hour}:${minutes}`
    }
    function init(){
        setInterval(getTime,1000)

    }

    init();





    function movie_rank() {
        let yesterday = new Date(today.setDate(today.getDate() - 1))
        let yyyy = yesterday.getFullYear()
        let mm = ('0' + (1 + yesterday.getMonth())).slice(-2)
        let dd = ('0' + yesterday.getDate()).slice(-2)
        let date = yyyy+mm+dd
        $('.movie_date').append(`${yyyy}-${mm}-${dd} 기준`)
        $.ajax({
            type: "GET",
            url: "https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=4783da895d5519775b6a21b3c13a540e&targetDt="+date,
            data: {},
            success: function (response) {
                let list = response['boxOfficeResult']['dailyBoxOfficeList']
                let temp_html = ``
                for (let i = 0; i < 5; i++) {
                    let rank = list[i]['rank']
                    let title = list[i]['movieNm']
                    temp_html = `<li><span>${rank}</span>${title}</li>`
                    $('.movie-box ul').append(temp_html)
                }
            }
        })

    }
    function festival_info() {
        $.ajax({
            type: "GET",
            url: "http://api.kcisa.kr/openapi/service/rest/meta/KOLfest?serviceKey=1501e489-a8e3-486f-9c4c-832012a9e546",
            data: {},
            success: function (xml) {
                let list = $(xml).find('items')
                let temp_html = ``
                for (let i = 0; i < 5; i++) {
                    let title = list.find('item').eq(i).find('title').text()
                    let city = list.find('item').eq(i).find('rights').text()
                    if(city.length != 3){
                        city = '-'
                    }
                    temp_html = `<li><span>${city}</span>${title}</li>`
                    $('.travel-box ul').append(temp_html)
                }
            }
        })
    }
});




//투두리스트 불러오기
function loadToDoList() {
  let todos = [];
  $.ajax({
    type: "GET",
    url: "/main",
    data: {},
    success: function (response) {
      todos = response["result"];
      for (let index = 0; index < todos.length; index++) {
        let id = todos[index]["todo_id"];
        let content = todos[index]["content_data"];
        let star = todos[index]["star_data"];
        let checked = todos[index]["todo_check"];
        paintingToDo(id, content, star, checked);
      }
    },
  });
}

//데이터 베이스에서 체크가 사실이면 체크가 사실인대로
//attribute를 추가한다.

//지울 때는 그냥 지운다.

//저장할 때

//버튼 눌러 내용 투두리스트 저장
function saveToDo() {
  let star_data = $("#star_select option:selected").val();
  let content_data = $("#todo_text").val();
  let id = toDoList.children.length + 1;
  let checked = false;

  $.ajax({
    type: "POST",
    url: "/main",
    data: {
      todo_id: id,
      content: content_data,
      star: star_data,
      todo_check: checked,
    },
    success: function (response) {
      paintingToDo(id, content_data, star_data, checked);
      document.getElementById("todo_text").value = "";
      console.log(response["msg"]);
    },
  });
}

//투두리스트 그리기
function paintingToDo(id, text, star, checked) {
  let li = document.createElement("li");
  let input = document.createElement("input");
  let content = document.createElement("label");
  let nbsp = document.createElement("label");
  let span = document.createElement("span");
  let span2 = document.createElement("span");
  let span3 = span.appendChild(span2);
  let button = document.createElement("button");

  button.id = "delete";
  button.className = "hidden";
  //   button.innerHTML = "닫기";
  button.addEventListener("click", deleteToDo);
  content.innerHTML = text;
  content.setAttribute("for", "opt" + toDoList.children.length + 1);
  nbsp.innerHTML = "&nbsp;";
  nbsp.setAttribute("for", "opt" + toDoList.children.length + 1);
  li.className = "checked";
  input.id = "opt" + toDoList.children.length + 1;
  input.setAttribute("onclick", "checked_check()");
  input.setAttribute('type','checkbox')
  span3.className = "star" + star;

  //투두리스트 완료 체크면 체크상태로 표시
  if (checked == 1) {
    input.type = "checkbox";
    input.setAttribute("checked", "checked");
  }
  li.appendChild(input);
  li.appendChild(nbsp);
  li.appendChild(content);
  li.id = id;

  span.appendChild(span3);
  span.appendChild(button);

  li.appendChild(span);
  toDoList.appendChild(li);
}

//투두리스트 지우기
function deleteToDo(event) {
  let btn = event.target;
  let id = btn.parentNode.parentNode.id;
  let li = btn.closest("li");
  toDoList.removeChild(li);

  $.ajax({
    type: "PUT",
    data: { todo_id: id },
    url: "main/delete",
    success: function (response) {
      //   alert(response["todo_id"] + " is deleted");
    },
  });
  //데이터 베이스에서도 지우기
}

//체크박스 기능 추가중(수정 중)
function checked_check(event) {
  let isChecked = event.target.hasAttribute("checked");
  let targetId = event.target.parentNode.id;
  $.ajax({
    type: "PUT",
    data: {
      isChecked: isChecked,
      targetId: targetId,
    },
    url: "main/check",
    success: function (response) {
      console.log(response["msg"]);
      if (response["todo_check"] == true) {
        if (!event.target.hasAttribute("checked")) {
          event.target.setAttribute("checked", "checked");
        }
      }
    },
  });
}
