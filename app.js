
let orders = JSON.parse(localStorage.getItem('furniture_orders2') || '[]');

function showPage(name){
 document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
 document.getElementById('page-'+name).classList.add('active');

 document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));

 if(name==='orders') document.querySelectorAll('.nav-btn')[0].classList.add('active');
 if(name==='stats') document.querySelectorAll('.nav-btn')[1].classList.add('active');
 if(name==='sync') document.querySelectorAll('.nav-btn')[2].classList.add('active');

 if(name==='stats') renderStats();
}

function fmt(n){
 return Number(n || 0).toLocaleString('ru-RU');
}

function renderOrders(){
 const el = document.getElementById('orders-list');

 if(!orders.length){
   el.innerHTML = '<div class="sync-box">Пока нет заказов</div>';
   return;
 }

 el.innerHTML = orders.map(order => `
   <div class="order-card">
     <div class="card-top">
       <div class="client">${order.client}</div>
       <div class="status ${order.status}">
         ${statusText(order.status)}
       </div>
     </div>

     <div>${order.note || 'Без комментария'}</div>

     <div class="price">
       ${fmt(order.price || 0)} ₽
     </div>
   </div>
 `).join('');
}

function statusText(status){
 if(status === 'work') return 'В работе';
 if(status === 'done') return 'Завершён';
 return 'Новый';
}

function renderStats(){
 const total = orders.reduce((sum,o)=>sum + Number(o.price || 0),0);

 document.getElementById('stats-content').innerHTML = `
   <div class="stat-card">
     <div>Общая выручка</div>
     <h2>${fmt(total)} ₽</h2>
   </div>

   <div class="stat-card">
     <div>Всего заказов</div>
     <h2>${orders.length}</h2>
   </div>
 `;
}

function openNew(){
 alert('Модальное окно можно перенести из вашего текущего проекта.');
}

renderOrders();

if('serviceWorker' in navigator){
 navigator.serviceWorker.register('sw.js');
}
