 (function(){
    function createKafihiCalendar(input){
      const popup=document.createElement("div");
      popup.className="kafihi-popup";
      document.body.appendChild(popup);

      let today=new Date(), currentMonth=today.getMonth(), currentYear=today.getFullYear();
      let selectedDate=null;
      const disableFuture=input.dataset.disableFuture==="true";
      const disablePast=input.dataset.disablePast==="true";

      function formatDate(date){
        const gmt5=new Date(date.getTime()+5*60*60*1000);
        const yyyy=gmt5.getFullYear(), mm=String(gmt5.getMonth()+1).padStart(2,"0"), dd=String(gmt5.getDate()).padStart(2,"0");
        return `${yyyy}-${mm}-${dd}`;
      }

      function renderCalendar(){
        popup.innerHTML="";

        // Header
        const header=document.createElement("div"); header.className="kafihi-header";
        const monthSelect=document.createElement("select");
        const yearSelect=document.createElement("select");

let startYear = 1900, endYear = today.getFullYear() + 10;
if (disableFuture) endYear = today.getFullYear();
if (disablePast) startYear = today.getFullYear();

        for(let y=startYear;y<=endYear;y++){
          const opt=document.createElement("option"); opt.value=y; opt.textContent=y;
          if(y===currentYear) opt.selected=true;
          yearSelect.appendChild(opt);
        }

        for(let m=0;m<12;m++){
          const opt=document.createElement("option"); opt.value=m; opt.textContent=new Date(0,m).toLocaleString('default',{month:'short'});
          if(m===currentMonth) opt.selected=true;
          monthSelect.appendChild(opt);
        }

        header.appendChild(monthSelect); header.appendChild(yearSelect); popup.appendChild(header);

        // Weekdays
        const weekdays=["Su","Mo","Tu","We","Th","Fr","Sa"];
        const weekDiv=document.createElement("div"); weekDiv.className="kafihi-weekdays";
        weekdays.forEach((d,i)=>{ const el=document.createElement("div"); el.textContent=d; if(i>=5) el.style.color="#ef4444"; weekDiv.appendChild(el); });
        popup.appendChild(weekDiv);

        // Days
        const daysDiv=document.createElement("div"); daysDiv.className="kafihi-days";
        const firstDay=new Date(currentYear,currentMonth,1).getDay();
        const daysInMonth=new Date(currentYear,currentMonth+1,0).getDate();
        for(let i=0;i<firstDay;i++) daysDiv.appendChild(document.createElement("div"));
        for(let d=1;d<=daysInMonth;d++){
          const dayEl=document.createElement("div"); dayEl.textContent=d;
          const dateObj=new Date(currentYear,currentMonth,d);
          if(dateObj.toDateString()===today.toDateString()) dayEl.classList.add("today");
          if(dateObj.getDay()>=5) dayEl.classList.add("weekend");
          let disabled=false;
          if(disableFuture && dateObj>today) disabled=true;
          if(disablePast && dateObj<today) disabled=true;
          if(disabled) dayEl.classList.add("disabled");
          else dayEl.addEventListener("click",()=>{ selectedDate=dateObj; input.value=formatDate(selectedDate); popup.style.display="none"; });
          daysDiv.appendChild(dayEl);
        }
        popup.appendChild(daysDiv);

        // Footer
        const footer=document.createElement("div"); footer.className="kafihi-footer";
        const clearBtn=document.createElement("button"); clearBtn.textContent="Clear"; clearBtn.className="clear";
        const todayBtn=document.createElement("button"); todayBtn.textContent="Today"; todayBtn.className="today";
        const closeBtn=document.createElement("button"); closeBtn.textContent="Close"; closeBtn.className="close";

        clearBtn.addEventListener("click",()=>{ selectedDate=null; input.value=""; popup.style.display="none"; });
        todayBtn.addEventListener("click",()=>{ selectedDate=today; input.value=formatDate(today); renderCalendar(); });
        closeBtn.addEventListener("click",()=>{ popup.style.display="none"; });

        footer.appendChild(clearBtn); footer.appendChild(todayBtn); footer.appendChild(closeBtn);
        popup.appendChild(footer);

        monthSelect.addEventListener("change",()=>{ currentMonth=parseInt(monthSelect.value); renderCalendar(); });
        yearSelect.addEventListener("change",()=>{ currentYear=parseInt(yearSelect.value); renderCalendar(); });
      }

      input.addEventListener("focus",()=>{
        const rect=input.getBoundingClientRect();
        popup.style.top=(rect.bottom + window.scrollY + 4)+"px";
        popup.style.left=(rect.left + window.scrollX)+"px";
        popup.style.display="block";
        renderCalendar();
      });

      document.addEventListener("click",(e)=>{
        if(!popup.contains(e.target) && e.target!==input) popup.style.display="none";
      });
    }

    document.querySelectorAll(".kafihi-calendar").forEach(input=>createKafihiCalendar(input));
  })();
