(function(){
  function createKafihiCalendar(input){
    // Skip readonly or disabled inputs
    if (input.hasAttribute("readonly") || input.hasAttribute("disabled")) return;

    // Shadow host
    const host = document.createElement("div");
    host.style.position = "absolute";
    host.style.zIndex = "9999";
    document.body.appendChild(host);

    // Shadow DOM root
    const shadow = host.attachShadow({ mode: "closed" });

    // Popup container inside shadow
    const popup = document.createElement("div");
    popup.className = "kafihi-popup";
    popup.style.display = "none";
    shadow.appendChild(popup);

    // Inject isolated CSS into shadow
    const style = document.createElement("style");
    style.textContent = `
      .kafihi-popup {
        background: #fff;
        border-radius: 10px;
        padding: 10px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        max-width: 95vw;
        font-family: "Segoe UI", Roboto, sans-serif;
      }
      .kafihi-header { display:flex; justify-content:center; gap:8px; margin-bottom:8px; }
      .kafihi-header select { padding:4px 8px; border-radius:6px; border:1px solid #d1d5db; font-size:13px; background:#f3f4f6; cursor:pointer; }
      .kafihi-header select:hover { background:#e5e7eb; }
      .kafihi-weekdays, .kafihi-days { display:grid; grid-template-columns:repeat(7,1fr); text-align:center; gap:3px; }
      .kafihi-weekdays div { font-weight:600; font-size:12px; }
      .kafihi-days div { cursor:pointer; border-radius:5px; padding:5px 0; transition:.2s; aspect-ratio:1/1; font-size:13px; }
      .kafihi-days div:hover { background:#3b82f6; color:#fff; }
      .kafihi-days div.today { background:#bfdbfe; font-weight:600; }
      .kafihi-days div.disabled { color:#d1d5db; cursor:not-allowed; }
      .kafihi-days div.weekend { color:#ef4444; }
      .kafihi-footer { display:flex; justify-content:space-between; margin-top:6px; gap:4px; }
      .kafihi-footer button { font-size:11px; padding:3px 6px; border-radius:5px; border:none; cursor:pointer; min-width:50px; color:#fff; }
      .kafihi-footer button.clear { background:#f87171; }
      .kafihi-footer button.clear:hover { background:#ef4444; }
      .kafihi-footer button.today { background:#34d399; }
      .kafihi-footer button.today:hover { background:#10b981; }
      .kafihi-footer button.close { background:#60a5fa; }
      .kafihi-footer button.close:hover { background:#3b82f6; }
    `;
    shadow.appendChild(style);

    // State
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

      let startYear=1900, endYear=today.getFullYear()+10;
      if(disableFuture) endYear=today.getFullYear();
      if(disablePast) startYear=today.getFullYear();

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
      host.style.top=(rect.bottom + window.scrollY + 4)+"px";
      host.style.left=(rect.left + window.scrollX)+"px";
      popup.style.display="block";
      renderCalendar();
    });

    document.addEventListener("click",(e)=>{
      if(!host.contains(e.target) && e.target!==input) popup.style.display="none";
    });
  }

  // Load after everything else is ready
  window.addEventListener("load",()=>{
    document.querySelectorAll(".kafihi-calendar").forEach(input=>createKafihiCalendar(input));
  });
})();
