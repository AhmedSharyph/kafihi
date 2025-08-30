(function(global){
  function createKafihiCalendar(input){
    var popup = document.createElement("div");
    popup.className = "kafihi-popup";
    popup.style.position = "absolute";
    popup.style.display = "none";
    document.body.appendChild(popup);

    var today = new Date();
    var currentMonth = today.getMonth();
    var currentYear = today.getFullYear();
    var selectedDate = null;
    var disableFuture = input.getAttribute("data-disable-future") === "true";
    var disablePast = input.getAttribute("data-disable-past") === "true";

    function formatDate(date){
      var gmt5 = new Date(date.getTime() + 5*60*60*1000);
      var yyyy = gmt5.getFullYear();
      var mm = ("0" + (gmt5.getMonth()+1)).slice(-2);
      var dd = ("0" + gmt5.getDate()).slice(-2);
      return yyyy + "-" + mm + "-" + dd;
    }

    function renderCalendar(){
      popup.innerHTML = "";

      var header = document.createElement("div"); header.className = "kafihi-header";
      var monthSelect = document.createElement("select");
      var yearSelect = document.createElement("select");

      var startYear = 1900, endYear = today.getFullYear() + 10;
      if(disableFuture) endYear = today.getFullYear();
      if(disablePast) startYear = today.getFullYear();

      for(var y=startYear; y<=endYear; y++){
        var opt = document.createElement("option");
        opt.value = y; opt.textContent = y;
        if(y === currentYear) opt.selected = true;
        yearSelect.appendChild(opt);
      }

      for(var m=0; m<12; m++){
        var opt = document.createElement("option");
        opt.value = m;
        opt.textContent = new Date(0,m).toLocaleString('default',{month:'short'});
        if(m === currentMonth) opt.selected = true;
        monthSelect.appendChild(opt);
      }

      header.appendChild(monthSelect); header.appendChild(yearSelect);
      popup.appendChild(header);

      var weekdays = ["Su","Mo","Tu","We","Th","Fr","Sa"];
      var weekDiv = document.createElement("div"); weekDiv.className="kafihi-weekdays";
      for(var i=0;i<7;i++){
        var el = document.createElement("div"); el.textContent = weekdays[i];
        if(i>=5) el.style.color="#ef4444";
        weekDiv.appendChild(el);
      }
      popup.appendChild(weekDiv);

      var daysDiv = document.createElement("div"); daysDiv.className = "kafihi-days";
      var firstDay = new Date(currentYear, currentMonth, 1).getDay();
      var daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate();

      for(var i=0;i<firstDay;i++) daysDiv.appendChild(document.createElement("div"));

      for(var d=1; d<=daysInMonth; d++){
        var dayEl = document.createElement("div");
        dayEl.textContent = d;
        var dateObj = new Date(currentYear, currentMonth, d);

        if(dateObj.toDateString() === today.toDateString()) dayEl.className="today";
        if(dateObj.getDay()>=5) dayEl.className+=" weekend";

        var disabled = false;
        if(disableFuture && dateObj>today) disabled=true;
        if(disablePast && dateObj<today) disabled=true;

        if(disabled) dayEl.className+=" disabled";
        else (function(date){
          dayEl.addEventListener("click", function(){
            selectedDate = date;
            input.value = formatDate(selectedDate);
            popup.style.display="none";
          });
        })(dateObj);

        daysDiv.appendChild(dayEl);
      }
      popup.appendChild(daysDiv);

      var footer = document.createElement("div"); footer.className="kafihi-footer";
      var clearBtn = document.createElement("button"); clearBtn.textContent="Clear"; clearBtn.className="clear";
      var todayBtn = document.createElement("button"); todayBtn.textContent="Today"; todayBtn.className="today";
      var closeBtn = document.createElement("button"); closeBtn.textContent="Close"; closeBtn.className="close";

      clearBtn.onclick = function(){ selectedDate=null; input.value=""; popup.style.display="none"; };
      todayBtn.onclick = function(){ selectedDate=today; input.value=formatDate(today); renderCalendar(); };
      closeBtn.onclick = function(){ popup.style.display="none"; };

      footer.appendChild(clearBtn); footer.appendChild(todayBtn); footer.appendChild(closeBtn);
      popup.appendChild(footer);

      monthSelect.onchange = function(){ currentMonth = parseInt(this.value); renderCalendar(); };
      yearSelect.onchange = function(){ currentYear = parseInt(this.value); renderCalendar(); };
    }

    input.onfocus = function(){
      var rect = input.getBoundingClientRect();
      var top = rect.bottom + window.scrollY + 4;
      var left = rect.left + window.scrollX;

      var popupWidth = 250;
      if(window.innerWidth < 500) popupWidth = window.innerWidth * 0.9;
      if(left + popupWidth > window.scrollX + window.innerWidth){
        left = window.scrollX + window.innerWidth - popupWidth - 4;
      }

      popup.style.top = top + "px";
      popup.style.left = left + "px";
      popup.style.display="block";
      renderCalendar();
    };

    document.addEventListener("click", function(e){
      if(!popup.contains(e.target) && e.target!==input) popup.style.display="none";
    });
  }

  global.initKafihiCalendars = function(){
    var inputs = document.querySelectorAll(".kafihi-calendar");
    for(var i=0;i<inputs.length;i++) createKafihiCalendar(inputs[i]);
  };
})(window);

window.addEventListener("load", function(){ initKafihiCalendars(); });
