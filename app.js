/* RELOOP interactive educational concept — standalone client-side JavaScript.
   All campus activity, accounts, item media and operational data are simulated.
   No backend, payment, SSO, QR scanning, or live facilities connection. */
(() => {
  'use strict';
  const KEY = 'reloop-campus-showcase-v3';
  const BASE_ITEMS = [
    {id:101,name:'Intro to MIS textbook',category:'Books',price:18,condition:'Good',location:'Library exchange point',seller:'Mina L.',image:'books',type:'Sell',desc:'Lightly annotated course book. Great for next semester.',status:'Available',date:1008},
    {id:102,name:'Vintage study lamp',category:'Dorm living',price:15,condition:'Very good',location:'Student Centre',seller:'Jordan P.',image:'lamp',type:'Sell',desc:'Warm light, fully working, perfect for a small desk.',status:'Available',date:1007},
    {id:103,name:'Canvas everyday tote',category:'Accessories',price:9,condition:'Like new',location:'North Residence',seller:'Sam K.',image:'tote',type:'Sell',desc:'Reusable canvas bag in a soft natural shade.',status:'Available',date:1006},
    {id:104,name:'Wireless headphones',category:'Electronics',price:24,condition:'Good',location:'Library exchange point',seller:'Alex R.',image:'headphones',type:'Sell',desc:'Clean, charged and ready for a new owner.',status:'Available',date:1005},
    {id:105,name:'Wooden desk chair',category:'Dorm living',price:35,condition:'Very good',location:'South Residence',seller:'Avery C.',image:'chair',type:'Sell',desc:'Stable, comfortable and easy to move between rooms.',status:'Available',date:1004},
    {id:106,name:'Reusable water bottle',category:'Accessories',price:0,condition:'Good',location:'Student Centre',seller:'Taylor W.',image:'bottle',type:'Free',desc:'Stainless steel bottle, thoroughly cleaned.',status:'Available',date:1003},
    {id:107,name:'Film camera',category:'Electronics',price:28,condition:'Used',location:'North Residence',seller:'Riley M.',image:'camera',type:'Sell',desc:'A well-loved compact film camera. Sold as seen.',status:'Available',date:1002},
    {id:108,name:'Plant for a new room',category:'Dorm living',price:0,condition:'Good',location:'Student Centre',seller:'Jamie S.',image:'plant',type:'Donate',desc:'Healthy indoor plant looking for a new shelf.',status:'Available',date:1001},
  ];
  const GUIDE = {
    paper:{heading:'Paper & cardboard',detail:'Keep dry and flatten boxes. Remove food-soiled parts where required; check the actual campus rules before placing items in a recycling bin.',place:'Example route: paper / cardboard collection point.'},
    batteries:{heading:'Batteries',detail:'Do not put batteries in ordinary recycling or mixed waste. Use a designated battery collection or hazardous waste channel, subject to local policy.',place:'Example route: approved battery collection desk.'},
    electronics:{heading:'Broken electronics',detail:'Repair or donate working equipment first. Send unusable electronics to an approved e-waste service; erase personal data from devices.',place:'Example route: e-waste drop-off station.'},
    textiles:{heading:'Clothing & textiles',detail:'Clean, wearable clothing is a candidate for reuse or donation. Damaged textiles may require a separate collection route.',place:'Example route: student donation desk.'},
    containers:{heading:'Drink containers',detail:'Empty containers and follow the campus-specific materials list. Rules vary by material and local recycling service.',place:'Example route: labelled container station.'}
  };
  const ART = ['books','lamp','tote','headphones','chair','bottle','camera','plant','notebooks'];
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const price = n => Number(n)===0 ? 'FREE' : '$'+Number(n).toFixed(0);
  const STUDENT='demo-student', ROLE_KEY='reloop-campus-role-v1';
  const stamp=()=>new Date().toISOString();
  const fakeTime=(days=0)=>new Date(Date.now()-days*86400000).toISOString();
  const seedItems=()=>structuredClone(BASE_ITEMS).map(p=>p.id===108?{...p,seller:'Alex M. · demo student',ownerId:STUDENT}:p);
  const initialState = () => ({
    meta:{schemaVersion:4},items:seedItems(),points:65,
    ledger:[{id:'L-1',title:'Verified exchange · textbook',delta:20,ownerId:STUDENT,source:'seed-101',createdAt:fakeTime(9)},{id:'L-2',title:'Verified donation · reuse desk',delta:15,ownerId:STUDENT,source:'seed-201',createdAt:fakeTime(6)},{id:'L-3',title:'Demo starting balance',delta:30,ownerId:STUDENT,source:'demo-opening',createdAt:fakeTime(14)}],
    submissions:[{id:501,type:'Recycle',item:'Cardboard packaging',location:'North Residence Point',ownerId:STUDENT,status:'Pending',createdAt:fakeTime(1)}],
    reservations:{},favorites:[],featured:[],featuredCredits:0,workOrders:[],reports:[{id:701,itemId:104,type:'Listing',reason:'Condition details need clarification',status:'Open',createdAt:fakeTime(2),ownerId:'sample-reporter'}],
    auditEvents:[{id:'AUD-SEED',role:'system',action:'Seed created',object:'DEMO',outcome:'Synthetic baseline',reason:'All sample data are fictional',at:fakeTime(12)}],
    completed:0,approved:0,nextId:800,
  });
  function loadState(){
    const fresh=initialState();
    try{
      const old=JSON.parse(localStorage.getItem(KEY));
      if(!old||!Array.isArray(old.items)||!Array.isArray(old.ledger)||!Array.isArray(old.submissions)||!Array.isArray(old.workOrders)||!Number.isFinite(old.points))return fresh;
      const st={...fresh,...old};
      st.meta={schemaVersion:4};
      for(const k of ['favorites','featured','workOrders','reports','auditEvents','ledger','submissions','items'])if(!Array.isArray(st[k]))st[k]=fresh[k];
      if(!st.reservations||typeof st.reservations!=='object'||Array.isArray(st.reservations))st.reservations={};
      st.featuredCredits=Number.isInteger(st.featuredCredits)?st.featuredCredits:0;
      st.items=st.items.map(p=>({...p,ownerId:p.ownerId||((p.seller||'').includes('You · demo')||p.id===108?STUDENT:undefined)}));
      st.submissions=st.submissions.map(p=>({...p,ownerId:p.ownerId||STUDENT,createdAt:p.createdAt||fakeTime(2)}));
      st.ledger=st.ledger.map((p,i)=>({...p,id:p.id||'LEGACY-'+i,ownerId:p.ownerId||STUDENT,createdAt:p.createdAt||fakeTime(3),source:p.source||'legacy'}));
      st.workOrders=st.workOrders.map(w=>({...w,createdAt:w.createdAt||fakeTime(2)}));
      Object.entries(st.reservations).forEach(([id,r])=>{r.ownerId=r.ownerId||STUDENT;r.createdAt=r.createdAt||fakeTime(1);});
      if(!st.reports.length)st.reports=fresh.reports;
      st.nextId=Math.max(Number(st.nextId)||800,800,...st.items.map(x=>Number(x.id)+1),...st.submissions.map(x=>Number(x.id)+1),...st.workOrders.map(x=>Number(x.id)+1),...st.reports.map(x=>Number(x.id)+1));
      return st;
    }catch(error){return fresh;}
  }
  let state=loadState();
  let role=['student','staff'].includes(localStorage.getItem(ROLE_KEY))?localStorage.getItem(ROLE_KEY):'guest';
  let route='home',category='All items',adminTab='overview',profileTab='listings',selectedArt='books',lastFocus=null,noticeTimeout;
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.info('Local demo persistence unavailable.');}};
  function audit(action,object,outcome,reason=''){
    state.auditEvents.unshift({id:'A-'+state.nextId++,role,action,object:String(object),outcome,reason,at:stamp()});
    state.auditEvents=state.auditEvents.slice(0,120);
  }
  function hasRole(r){return role===r;}
  function roleGate(required){if(hasRole(required))return true;announce('Please enter the '+required+' demo portal to use that action.');return false;}
  function chooseRole(next){if(!['student','staff'].includes(next))return;role=next;try{localStorage.setItem(ROLE_KEY,role);}catch(e){}closeModal();refreshRole();navigate(next==='staff'?'operations':'exchange');announce('You are now viewing the '+next+' demo portal.');}
  function exitRole(){role='guest';try{localStorage.removeItem(ROLE_KEY);}catch(e){}closeModal();refreshRole();navigate('home', false);announce('Demo role cleared. Shared sample records are retained.');}
  function refreshRole(){
    $$('[data-student-only]').forEach(el=>el.hidden=role!=='student');
    $$('[data-staff-only]').forEach(el=>el.hidden=role!=='staff');
    $('#switch-portal').hidden=role==='guest';
    $('#role-banner').textContent=role==='guest'?'GUEST / SELECT A PORTAL':role.toUpperCase()+' DEMO · CLIENT-SIDE ROLE';
    document.body.dataset.role=role;
  }
  
  function showPortalChoice() {
    const template = $('#portal-role-template');
    if (!template) return;
    openModal(`
      <div class="portal-dialog onboarding-dialog">
        <section class="onboarding-intro" aria-labelledby="modal-heading">
          <div class="onboarding-copy">
            <span class="eyebrow">RELOOP CAMPUS</span>
            <h2 id="modal-heading">What is<br><i>Reloop?</i></h2>
            <p>Reloop is a second-hand trading website at the university. In addition to the main second-hand trading page, it also has an incentive mechanism for earning rewards and post exposure through environmental activities on campus. OUr keywords as follows:</p>
            <div class="onboarding-highlights" aria-label="What ReLoop offers">
              <span>Exchange &amp; Reuse</span>
              <span>Repair &amp; Recycle</span>
              <span>Earn Rewards</span>
              <span>Campus Sustainability</span>
            </div>
            <p><br> Give useful things another life. Exchange with students, repair or recycle responsibly, and earn points for verified actions. Campus staff help keep it all moving.</p>
          </div>
          <div class="onboarding-art">
            <img src="assets/onboarding-campus.webp" alt="Illustration of students exchanging books, repairing items and sorting recyclable materials on campus" width="1500" height="844">
          </div>
        </section>
        <section class="onboarding-start" aria-labelledby="onboarding-start-title">
          <div>
            <span class="eyebrow">01 / FROM A SMALL ACTION</span>
            <h3 id="onboarding-start-title">Ready to make an impact?</h3>
          </div>
          <button type="button" class="btn btn-dark" data-onboarding-start="true">Get Started <span aria-hidden="true">↓</span></button>
        </section>
        <section class="onboarding-roles" id="onboarding-role-section" aria-labelledby="onboarding-role-title">
          <span class="eyebrow">02 / CHOOSE YOUR PORTAL</span>
          <h3 id="onboarding-role-title" tabindex="-1">How will you <i>take part?</i></h3>
          ${template.innerHTML}
        </section>
        <p class="onboarding-footnote">EDUCATIONAL PROTOTYPE / ALL USERS, EVENTS AND REWARDS ARE SIMULATED.</p>
      </div>
    `);
    $('#modal-shell').classList.add('onboarding-active');
    $('#modal-shell').scrollTop = 0;
  }

  function paint(){renderProducts();renderWallet();renderAdmin();renderStudent();renderProfile();renderStaffExtra();$('#global-points').textContent=state.points;$('#listing-count').textContent=String(state.items.filter(x=>x.status!=='Removed').length).padStart(2,'0');}
  function navigate(where, addHistory = true){
    const allowed=['home','student','profile','exchange','circular','operations'];if(!allowed.includes(where))where='home';
    if(where==='operations'&&role!=='staff'){announce('Staff workspace is available only in Staff Demo.');where=role==='student'?'student':'home';}
    if(['student','profile','exchange','circular'].includes(where)&&role!=='student'){announce('Enter Student Demo to explore the student features.');where=role==='staff'?'operations':'home';}
    route=where;$$('.view').forEach(v=>{const show=v.id==='view-'+where;v.hidden=!show;v.classList.toggle('active',show);});
    $$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.nav===where));
    $('#mobile-nav').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');
    
try {
  const nextHash = '#' + where;

  if (location.hash !== nextHash) {
    if (addHistory) {
      // 用户主动点击导航：增加历史记录
      history.pushState({ where }, '', nextHash);
    } else {
      // 页面恢复：不增加额外历史记录
      history.replaceState({ where }, '', nextHash);
    }
  }
} catch (e) {
  console.warn('Navigation history update failed:', e);
}

    window.scrollTo({top:0,behavior:'instant'});paint();
    const heading=$('#view-'+where+' h1');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
  }
  function announce(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(noticeTimeout);noticeTimeout=setTimeout(()=>toast.classList.remove('show'),3700);}
  function imageFor(item){return 'assets/'+encodeURIComponent(ART.includes(item.image)?item.image:'books')+'.svg';}
  const categories=['All items','Books','Dorm living','Electronics','Accessories','Free & Donate'];
  const heartSVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 9.4c0 4-8.5 10-8.5 10S3.5 13.4 3.5 9.4a4.4 4.4 0 0 1 8.5-1.4 4.4 4.4 0 0 1 8.5 1.4Z"/></svg>';
  function productCard(p){
    const favorite=state.favorites.includes(p.id);
    const featuredAllowed=state.featured.includes(p.id)&&state.items.filter(x=>x.category===p.category&&x.status==='Available').length>=10;
    return `<article class="product-card"><div class="product-image"><img src="${imageFor(p)}" loading="lazy" alt="Illustrated demo image of ${escapeHTML(p.name)}" width="600" height="520"><span class="product-top-tag ${featuredAllowed?'featured-tag':''}">${featuredAllowed?'FEATURED · REWARD':escapeHTML(p.type==='Sell'?p.condition:p.type)}</span><button class="favorite ${favorite?'is-favorite':''}" type="button" data-favorite="${p.id}" aria-label="${favorite?'Remove from saved items':'Save item'}: ${escapeHTML(p.name)}" aria-pressed="${favorite}">${heartSVG}</button></div><div class="product-info"><div class="product-info-upper"><h3 class="product-name">${escapeHTML(p.name)}</h3><span class="product-price">${price(p.price)}</span></div><p class="product-sub">${escapeHTML(p.category)} · ${escapeHTML(p.location)}</p><div class="product-cta"><span class="product-status ${escapeHTML(p.status.toLowerCase().replace(/\s+/g,'-'))}">● ${escapeHTML(p.status)}</span><button class="product-detail-btn" type="button" data-detail="${p.id}" aria-label="View details of ${escapeHTML(p.name)}">↗&#xFE0E;</button></div></div></article>`;
  }
  function filteredItems(){const q=$('#market-search').value.trim().toLocaleLowerCase();const s=$('#market-sort').value;let arr=state.items.filter(item=>!['Pending review','Rejected','Removed','Disputed'].includes(item.status)&&(category==='All items'||(category==='Free & Donate'?(item.type!=='Sell'):item.category===category))&&`${item.name} ${item.category} ${item.location}`.toLocaleLowerCase().includes(q));
    if(s==='low')arr.sort((a,b)=>a.price-b.price);else if(s==='high')arr.sort((a,b)=>b.price-a.price);else arr.sort((a,b)=>b.date-a.date);
    return arr;
  }
  function renderProducts(){
    $('#home-products').innerHTML=state.items.filter(p=>p.status==='Available').slice(0,4).map(productCard).join('');
    $('#category-list').innerHTML=categories.map(c=>{let count=state.items.filter(p=>!['Pending review','Rejected','Removed','Disputed'].includes(p.status)&&(c==='All items'||(c==='Free & Donate'?p.type!=='Sell':p.category===c))).length;return `<button type="button" class="category-button ${c===category?'active':''}" data-category="${escapeHTML(c)}" aria-pressed="${c===category}">${escapeHTML(c)} <span class="count">${count.toString().padStart(2,'0')}</span></button>`;}).join('');
    const arr=filteredItems();$('#market-products').innerHTML=arr.map(productCard).join('');$('#market-empty').hidden=arr.length>0;$('#results-summary').textContent=`${arr.length} item${arr.length===1?'':'s'} · ${category==='All items'?'All campus listings':category}`;
  }
  function renderGuide(){const g=GUIDE[$('#sort-guide').value];$('#guide-result').innerHTML=`<strong>${escapeHTML(g.heading)} →</strong><p>${escapeHTML(g.detail)}</p><p><b>${escapeHTML(g.place)}</b></p>`;}
  const REWARDS=[{title:'Featured listing credit',cost:40,description:'Stored demo credit. Actual placement requires a category with ≥10 matching listings to respect the 10% cap.'},{title:'Campus partner voucher',cost:80,description:'Illustrative digital reward — not a real voucher.'}];
  function renderWallet(){
    $('#wallet-points').textContent=state.points;
    $('#rewards-list').innerHTML=REWARDS.map((r,i)=>`<div class="reward-option"><div><strong>${escapeHTML(r.title)}</strong><p>${r.cost} pts · ${escapeHTML(r.description)}${i===0?` · ${state.featuredCredits} stored credit(s)`:``}</p></div><button type="button" data-redeem="${i}" ${state.points<r.cost?'disabled':''}>Redeem ↗&#xFE0E;</button></div>`).join('');
    $('#ledger-list').innerHTML=state.ledger.slice(0,5).map(l=>`<div class="ledger-entry"><span>${escapeHTML(l.title)}</span><strong class="${l.delta>=0?'plus':'minus'}">${l.delta>=0?'+':''}${l.delta} pts</strong></div>`).join('');
  }
  function createOrder(title='Review North Residence recycling signage',point='North Residence'){
    if(!roleGate('staff'))return;
    if(state.workOrders.some(w=>w.title.trim().toLowerCase()===title.trim().toLowerCase()&&w.point===point&&w.status!=='Resolved')){announce('A matching demo work order is already open.');return;}
    const w={id:state.nextId++,title,point,status:'Open',createdAt:stamp(),updatedAt:stamp()};state.workOrders.unshift(w);audit('Work order created','WO-'+w.id,'Open',title);save();paint();announce('Demo work order created.');
  }
  function renderAdmin(){
    const pending=state.submissions.filter(s=>s.status==='Pending');
    $('#stat-exchanges').textContent=128+state.completed;$('#stat-exchanges').nextElementSibling.textContent=`Synthetic baseline 128 + ${state.completed} new demo exchanges`;
    $('#stat-actions').textContent=36+state.approved;$('#stat-actions').nextElementSibling.textContent=`Synthetic baseline 36 + ${state.approved} demo approvals`;
    $('#stat-pending').textContent=pending.length;
    $('#queue-tab-count').textContent=pending.length;
    $('#pending-pill').textContent=pending.length+' PENDING';
    $('#stat-workorders').textContent=state.workOrders.filter(w=>w.status!=='Resolved').length;
    const bars=[{name:'North Residence',rate:24,count:24,sample:100},{name:'South Residence',rate:11,count:11,sample:100},{name:'Science Building',rate:14,count:14,sample:100}];
    $('#contamination-chart').innerHTML=bars.map(b=>`<div class="bar-line"><span>${b.name}</span><div class="bar-track" role="meter" aria-label="${b.name} synthetic contamination" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${b.rate}"><div class="bar-progress ${b.rate>=20?'high':''}" style="width:${b.rate}%"></div></div><span class="bar-value">${b.rate}%</span></div>`).join('');
    $('#facilities-points').innerHTML='<h3 style="font-size:22px;margin:0 0 20px">Collection points · synthetic sample</h3>'+bars.map(b=>`<div class="point-row"><div><strong>${escapeHTML(b.name)}</strong><small>${b.count} incorrectly sorted / ${b.sample} audited · synthetic</small></div><div class="point-rate ${b.rate>=20?'high':''}">${b.rate}%</div></div>`).join('');
    const locations=[...new Set(state.submissions.map(s=>s.location))];
    $('#verification-list').innerHTML=`<div class="staff-filters"><label for="verification-status">STATUS <select id="verification-status"><option value="Pending">Pending</option><option value="All">All statuses</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></label><label for="verification-type">TYPE <select id="verification-type"><option value="All">All types</option><option>Recycle</option><option>Donate</option><option>Repair</option></select></label><label for="verification-location">LOCATION <select id="verification-location"><option value="All">All points</option>${locations.map(p=>`<option value="${escapeHTML(p)}">${escapeHTML(p)}</option>`).join('')}</select></label></div><div id="verification-rows"></div>`;
    renderVerificationRows();
    $('#work-order-list').innerHTML=state.workOrders.length?state.workOrders.map(w=>`<div class="order-item"><div><strong>${escapeHTML(w.title)}</strong><small>${escapeHTML(w.point)} · WO-${w.id} · ${escapeHTML(w.status)}</small></div>${w.status==='Open'?`<button type="button" data-resolve="${w.id}">Mark resolved</button>`:'<span class="order-tag">RESOLVED</span>'}</div>`).join(''):'<p class="muted-note">No demo work orders yet. Create one to test the workflow.</p>';
    const openNorth=state.workOrders.some(w=>w.point==='North Residence'&&w.status==='Open');$('#insight-order-status').textContent=openNorth?'✓ Demo work order is open':'Recommended follow-up';
  }
  function renderVerificationRows(){
    const status=$('#verification-status')?.value||'Pending',type=$('#verification-type')?.value||'All',location=$('#verification-location')?.value||'All';
    const arr=state.submissions.filter(s=>(status==='All'||s.status===status)&&(type==='All'||s.type===type)&&(location==='All'||s.location===location));
    $('#verification-rows').innerHTML=arr.length?arr.map(s=>`<div class="queue-item"><div><strong>${escapeHTML(s.type)} · ${escapeHTML(s.item)}</strong><small>${escapeHTML(s.location)} · CA-${s.id} · ${escapeHTML(s.status)} · ${friendlyDate(s.createdAt)}</small>${s.reviewReason?`<p class="record-reason">Decision note: ${escapeHTML(s.reviewReason)}</p>`:''}</div><div class="queue-actions">${s.status==='Pending'?`<button type="button" class="approve" data-review-submission="${s.id}">Review submission ↗&#xFE0E;</button>`:`<span class="state-pill ${s.status.toLowerCase()}">${escapeHTML(s.status)}</span>`}</div></div>`).join(''):'<div class="queue-empty"><h3>Nothing in this view.</h3><p>Adjust the filters or submit a circular action as the demo student.</p></div>';
  }
  function setAdminTab(tab){
    if(!['overview','verification','moderation','facilities','sustainability','audit'].includes(tab))tab='overview';
    adminTab=tab;$$('[data-admin-tab]').forEach(b=>{const on=b.dataset.adminTab===tab;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});
    $$('.admin-panel').forEach(p=>{const on=p.id==='admin-'+tab;p.hidden=!on;p.classList.toggle('active',on);});
    if(tab==='verification')renderVerificationRows();
  }
  function openModal(content){lastFocus=document.activeElement;$('#modal-body').innerHTML=content;$('#modal-backdrop').hidden=false;document.body.style.overflow='hidden';$('#modal-close').focus();}
  function closeModal(){if($('#modal-backdrop').hidden)return;$('#modal-backdrop').hidden=true;$('#modal-shell').classList.remove('onboarding-active');$('#modal-body').innerHTML='';document.body.style.overflow='';if(lastFocus?.isConnected)lastFocus.focus();}
  function showDetail(id){
    if(!roleGate('student'))return;const p=state.items.find(x=>x.id===id);if(!p)return;
    const r=state.reservations[p.id];let action='';
    if(p.status==='Available'&&p.ownerId!==STUDENT)action=`<button class="btn btn-dark btn-wide" type="button" data-start-reserve="${p.id}">Reserve this item for 24h ↗&#xFE0E;</button>`;
    else if(p.status==='Available'&&p.ownerId===STUDENT)action='<div class="status-note">This is your own demo listing. You can view its status in My Profile.</div>';
    else if(p.status==='Reserved'&&r)action=`<button class="btn btn-dark btn-wide" type="button" data-handover="${p.id}">${r.stage==='pending'?'Simulate seller response':'Open handover confirmation'} ↗&#xFE0E;</button>`;
    else action='<div class="status-note">This listing cannot be newly reserved in the current demo state.</div>';
    openModal(`<div class="modal-layout"><div class="modal-photo"><img src="${imageFor(p)}" alt="Illustrated sample item ${escapeHTML(p.name)}" width="600" height="520"></div><div class="modal-info"><span class="eyebrow">CAMPUS EXCHANGE / ITEM #${p.id}</span><h2 id="modal-heading">${escapeHTML(p.name)}</h2><div class="modal-price">${price(p.price)}</div><p>${escapeHTML(p.desc)}</p><div class="detail-list"><div class="detail-row"><span>Condition</span><strong>${escapeHTML(p.condition)}</strong></div><div class="detail-row"><span>Exchange type</span><strong>${escapeHTML(p.type)}</strong></div><div class="detail-row"><span>Handover point</span><strong>${escapeHTML(p.location)}</strong></div><div class="detail-row"><span>Listed by</span><strong>${escapeHTML(p.seller)} · demo persona</strong></div><div class="detail-row"><span>Status</span><strong>${escapeHTML(p.status)}</strong></div></div>${action}<button type="button" class="inline-link report-trigger" data-report-item="${p.id}">Report a concern ↗&#xFE0E;</button><p class="modal-help">Educational simulation. No real payment, authentication or scan. Handover rules and staff moderation are conceptual unless demonstrated.</p></div></div>`);
  }
  function reserveForm(id){const p=state.items.find(x=>x.id===id);if(!p||p.status!=='Available')return;
    openModal(`<div class="modal-form"><span class="eyebrow">EXCHANGE / RESERVATION</span><h2 id="modal-heading">Set up your handover.</h2><p>You are reserving <strong>${escapeHTML(p.name)}</strong>. Proposed policy: 24-hour hold; seller replies within 12 hours. This demo simulates the process locally.</p><form id="reservation-form" data-item="${id}"><div class="modal-fields"><div class="field"><label for="reserve-method">Handover method</label><select id="reserve-method" required><option value="Designated exchange point">Designated exchange point</option><option value="Campus cabinet">Campus cabinet (proposed)</option></select></div><div class="field"><label for="reserve-time">Available time window</label><select id="reserve-time" required><option>Tomorrow · 10:00–12:00</option><option>Tomorrow · 14:00–16:00</option><option>Friday · 16:00–18:00</option></select></div></div><button class="btn btn-dark btn-wide" type="submit">Confirm demo reservation <span>↗&#xFE0E;</span></button></form><p class="modal-help">No live booking or cabinet service is connected.</p></div>`);
  }
  function simulatedQR(){let cells='';for(let i=0;i<81;i++){const x=i%9,y=Math.floor(i/9);const black=((x<3&&y<3)||(x>5&&y<3)||(x<3&&y>5))?(x===0||x===2||y===0||y===2||(x>5&&x===6)||(x>5&&x===8)||(y>5&&y===6)||(y>5&&y===8)):((x*13+y*7+x*y)%4<2);cells+=`<b class="${black?'':'off'}"></b>`;}return cells;}
  function showHandover(id){const p=state.items.find(x=>x.id===id),r=state.reservations[id];if(!p||!r)return;let accepted=r.stage!=='pending';const seller=r.sellerScan===true,buyer=r.buyerScan===true;
    openModal(`<div class="modal-form"><span class="eyebrow">EXCHANGE / VERIFIED HANDOVER</span><h2 id="modal-heading">${accepted?'Ready to hand over.':'Waiting for the seller.'}</h2><p>${escapeHTML(p.name)} · ${escapeHTML(r.method)} · ${escapeHTML(r.time)}. Each demo QR token is linked to one reservation and cannot be reused after completion.</p><div class="workflow-stages"><span>01 RESERVE ✓</span><span class="${accepted?'':'current'}">02 SELLER ACCEPTANCE ${accepted?'✓':'·'}</span><span class="${accepted?'current':''}">03 TWO-SIDED CONFIRMATION</span></div>${!accepted?`<div class="status-note">In a real system the seller would respond within 12 hours. Use the button below to simulate acceptance.</div><button class="btn btn-dark btn-wide" type="button" data-accept-seller="${id}">Simulate seller acceptance <span>↗&#xFE0E;</span></button>`:`<div class="handover-qr"><div class="qr-simulated" aria-label="Decorative simulated code, not a scannable QR code">${simulatedQR()}</div><div><strong>DEMO HANDOVER TOKEN</strong><p>Not a real QR code. Press each confirmation below to simulate separate scans by both parties.</p></div></div><div class="step-buttons"><button type="button" class="${seller?'done':''}" data-scan="seller" data-scan-item="${id}" ${seller?'disabled':''}>${seller?'✓ Seller confirmed':'Simulate seller scan'}</button><button type="button" class="${buyer?'done':''}" data-scan="buyer" data-scan-item="${id}" ${buyer?'disabled':''}>${buyer?'✓ Buyer confirmed':'Simulate buyer scan'}</button></div><button class="btn btn-dark btn-wide" style="margin-top:18px" type="button" data-complete="${id}" ${!seller||!buyer?'disabled':''}>Complete verified demo exchange <span>↗&#xFE0E;</span></button>`}<p class="modal-help">Both confirmations are required. One confirmation alone never completes the exchange.</p></div>`);
  }
  function showPost(){selectedArt='books';openModal(`<div class="modal-form"><span class="eyebrow">EXCHANGE / NEW LISTING</span><h2 id="modal-heading">Give something a new chapter.</h2><p>Post a sample listing for the demo campus market. Choose an illustration instead of uploading a real item photo.</p><form id="post-form"><div class="modal-fields"><div class="field wide"><label for="post-title">Item title *</label><input type="text" id="post-title" placeholder="e.g. Second-hand desk organizer" maxlength="65" required></div><div class="field"><label for="post-category">Category *</label><select id="post-category" required><option>Books</option><option>Dorm living</option><option>Electronics</option><option>Accessories</option></select></div><div class="field"><label for="post-type">Listing type *</label><select id="post-type"><option>Sell</option><option>Free</option><option>Donate</option></select></div><div class="field"><label for="post-condition">Condition *</label><select id="post-condition"><option>Good</option><option>Like new</option><option>Very good</option><option>Used</option></select></div><div class="field"><label for="post-price">Price in USD *</label><input id="post-price" type="number" min="0" max="999" step="1" value="10" required></div><div class="field wide"><label for="post-location">Preferred handover point *</label><select id="post-location"><option>Library exchange point</option><option>Student Centre</option><option>North Residence</option><option>South Residence</option></select></div><div class="field"><label for="post-method">Handover method *</label><select id="post-method"><option>Designated exchange point</option><option>Campus cabinet (concept)</option></select></div><div class="field"><label for="post-window">Available time window *</label><select id="post-window"><option>10:00–12:00</option><option>14:00–16:00</option><option>16:00–18:00</option></select></div><div class="field wide"><label for="post-desc">Short description</label><textarea id="post-desc" maxlength="250" placeholder="Condition, details, and anything the next owner should know..."></textarea></div></div><label class="eyebrow" style="font-size:10px">SELECT A DEMO ITEM IMAGE *</label><div class="sample-picker" id="sample-picker">${ART.slice(0,8).map(a=>`<button type="button" class="sample-option ${a===selectedArt?'selected':''}" data-art="${a}" aria-label="Use ${a} illustration"><img src="${imageFor({image:a})}" alt=""></button>`).join('')}</div><button class="btn btn-dark btn-wide" type="submit">Publish demo listing <span>↗&#xFE0E;</span></button></form><p class="modal-help">The concept policy calls for 1–5 item photos and listing moderation. This prototype uses a selected illustration as a mock photo and simulates a basic policy check; flagged keywords are held for staff review. No real content moderation or photo upload occurs.</p></div>`);
    $('#post-type').addEventListener('change',()=>{if($('#post-type').value!=='Sell'){$('#post-price').value='0';$('#post-price').disabled=true;}else{$('#post-price').disabled=false;$('#post-price').value=10;}});
  }
  function showReward(index){const r=REWARDS[index];if(!r||state.points<r.cost){announce('Not enough demo points for that reward.');return;}
    openModal(`<div class="modal-form"><span class="eyebrow">REWARDS / DEMO REDEMPTION</span><h2 id="modal-heading">A little something back.</h2><p><strong>${escapeHTML(r.title)}</strong><br>${escapeHTML(r.description)}</p><div class="status-note">Cost: ${r.cost} points. You currently have ${state.points} points. This is not a real merchant voucher, promotion or monetary transfer.</div><button type="button" class="btn btn-dark btn-wide" data-confirm-reward="${index}">Confirm demo redemption <span>↗&#xFE0E;</span></button></div>`);
  }
  function showManualOrder(){openModal(`<div class="modal-form"><span class="eyebrow">STAFF / NEW WORK ORDER</span><h2 id="modal-heading">Log a facility issue.</h2><p>Record an example facilities task. No actual university work-order system is connected.</p><form id="order-form"><div class="field"><label for="order-title">Issue description</label><input id="order-title" maxlength="100" required placeholder="e.g. Replace recycling bin signage"></div><div class="field"><label for="order-location">Campus location</label><select id="order-location"><option>North Residence</option><option>South Residence</option><option>Science Building</option><option>Student Centre</option></select></div><button type="submit" class="btn btn-dark btn-wide">Create demo work order <span>↗&#xFE0E;</span></button></form></div>`);}
  function issuePoints(title,delta,source){
    state.points+=delta;state.ledger.unshift({id:'L-'+state.nextId++,title,delta,ownerId:STUDENT,source:source||'demo',createdAt:stamp()});
  }
  function friendlyDate(value){if(!value)return 'Legacy demo';const d=new Date(value);return Number.isNaN(d.getTime())?'Demo date':d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}
  function badge(status){return `<span class="state-pill ${escapeHTML(String(status).toLowerCase().replace(/\s+/g,'-'))}">${escapeHTML(status)}</span>`;}
  function activityRecords(){
    const events=[];
    for(const s of state.submissions.filter(x=>x.ownerId===STUDENT))events.push({title:`${s.type}: ${s.item}`,sub:`${s.status} · CA-${s.id} · ${s.location}`,date:s.createdAt||fakeTime(2),status:s.status});
    for(const p of state.items.filter(x=>x.ownerId===STUDENT))events.push({title:`Listed: ${p.name}`,sub:`${p.status} · Item #${p.id}`,date:p.createdAt||fakeTime(4),status:p.status});
    for(const [id,r] of Object.entries(state.reservations).filter(([_,r])=>r.ownerId===STUDENT)){const p=state.items.find(x=>x.id===Number(id));events.push({title:`Exchange: ${p?.name||'Item '+id}`,sub:`${r.stage} · ${r.method}`,date:r.createdAt||fakeTime(1),status:r.stage});}
    for(const l of state.ledger.filter(x=>x.source!=='demo-opening'))events.push({title:l.title,sub:`${l.delta>0?'+':''}${l.delta} points · ${l.source}`,date:l.createdAt||fakeTime(3),status:'ledger'});
    return events.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  }
  function renderStudent(){
    $('#student-points').textContent=state.points;
    $('#student-reservations').textContent=Object.values(state.reservations).filter(r=>r.ownerId===STUDENT&&r.stage!=='complete'&&r.stage!=='disputed').length;
    $('#student-pending').textContent=state.submissions.filter(s=>s.ownerId===STUDENT&&s.status==='Pending').length;
    const arr=activityRecords().slice(0,5);
    $('#student-recent').innerHTML=arr.map(x=>`<div class="activity-line"><span class="activity-bullet">↗&#xFE0E;</span><div><strong>${escapeHTML(x.title)}</strong><small>${escapeHTML(x.sub)} · ${friendlyDate(x.date)}</small></div></div>`).join('')||'<p class="muted-note">Your activities will appear here.</p>';
  }
  function renderProfile(){
    $('#profile-points').textContent=state.points;
    $$('.profile-tabs [data-profile-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.profileTab===profileTab);if(b.dataset.profileTab===profileTab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    const title={listings:'My listings',reservations:'My reservations',actions:'My circular activities',ledger:'My points ledger',saved:'Saved items'}[profileTab];
    let records='';
    if(profileTab==='listings'){const arr=state.items.filter(x=>x.ownerId===STUDENT);records=arr.map(p=>`<div class="profile-record"><div><strong>${escapeHTML(p.name)}</strong><p>Item #${p.id} · ${escapeHTML(p.type)} · ${escapeHTML(p.location)}</p></div><div class="profile-record-side">${badge(p.status)}<button type="button" data-detail="${p.id}">View listing ↗&#xFE0E;</button></div></div>`).join('');}
    if(profileTab==='reservations'){const arr=Object.entries(state.reservations).filter(([id,r])=>r.ownerId===STUDENT);records=arr.map(([id,r])=>{const p=state.items.find(x=>x.id===Number(id));return `<div class="profile-record"><div><strong>${escapeHTML(p?.name||'Listing #'+id)}</strong><p>EX-${id} · ${escapeHTML(r.method)} · ${escapeHTML(r.time)} · ${friendlyDate(r.createdAt)}</p></div><div class="profile-record-side">${badge(r.stage)}${p?.status==='Reserved'?`<button data-handover="${id}" type="button">Continue handover ↗&#xFE0E;</button>`:''}</div></div>`;}).join('');}
    if(profileTab==='actions'){records=state.submissions.filter(s=>s.ownerId===STUDENT).map(x=>`<div class="profile-record"><div><strong>${escapeHTML(x.type)} · ${escapeHTML(x.item)}</strong><p>CA-${x.id} · ${escapeHTML(x.location)} · ${friendlyDate(x.createdAt)}</p>${x.reviewReason?`<p>Staff feedback: ${escapeHTML(x.reviewReason)}</p>`:''}</div><div class="profile-record-side">${badge(x.status)}</div></div>`).join('');}
    if(profileTab==='ledger'){records=state.ledger.filter(x=>x.ownerId===STUDENT).map(l=>`<div class="profile-record"><div><strong>${escapeHTML(l.title)}</strong><p>${friendlyDate(l.createdAt)} · ${escapeHTML(l.source||'Demo event')} · ${escapeHTML(l.id)}</p></div><div class="profile-record-side"><strong>${l.delta>=0?'+':''}${l.delta} pts</strong></div></div>`).join('');}
    if(profileTab==='saved'){records=state.items.filter(x=>state.favorites.includes(x.id)).map(p=>`<div class="profile-record"><div><strong>${escapeHTML(p.name)}</strong><p>${escapeHTML(p.category)} · ${price(p.price)}</p></div><div class="profile-record-side">${badge(p.status)}<button type="button" data-detail="${p.id}">View ↗&#xFE0E;</button></div></div>`).join('');}
    $('#profile-panel').innerHTML=`<div class="profile-panel-heading"><h2>${title}</h2>${profileTab==='listings'?'<button type="button" class="btn btn-dark" data-open="post">+ New listing</button>':''}</div><div class="profile-list">${records||'<div class="profile-record"><p>Nothing here yet. Your next campus action will appear here.</p></div>'}</div>`;
  }
  function renderStaffExtra(){
    const pendingReports=state.reports.filter(r=>r.status==='Open');const pendingListings=state.items.filter(p=>p.status==='Pending review');
    $('#moderation-pill').textContent=(pendingReports.length+pendingListings.length)+' OPEN';
    $('#moderation-list').innerHTML=[...pendingListings.map(p=>`<div class="staff-record"><div><strong>Pending listing · ${escapeHTML(p.name)}</strong><small>Item #${p.id} · ${escapeHTML(p.category)} · ${friendlyDate(p.createdAt)}</small><p>Illustrative keyword screening has referred this item to staff.</p></div><div class="staff-record-actions">${badge('Pending')}<button type="button" class="primary" data-review-listing="${p.id}">Review ↗&#xFE0E;</button></div></div>`),...pendingReports.map(r=>{const p=state.items.find(i=>i.id===r.itemId);return `<div class="staff-record"><div><strong>${escapeHTML(r.type)} report · ${escapeHTML(p?.name||'Item #'+r.itemId)}</strong><small>REP-${r.id} · ${friendlyDate(r.createdAt)} · ${escapeHTML(r.status)}</small><p>${escapeHTML(r.reason)}${r.type==='Exchange'?' · Related transaction frozen':''}</p></div><div class="staff-record-actions">${badge('Open')}<button class="primary" type="button" data-review-report="${r.id}">Resolve ↗&#xFE0E;</button></div></div>`;})].join('')||'<div class="staff-record"><p>There are no open moderation tasks. Students can report concerns from item details.</p></div>';
    const targets=[['Landfill diverted', '≥45 tonnes / academic year', 'Current demo: data unavailable'],['Reuse / donation / repair', '≥2,800 / year', 'Current demo: annual data unavailable'],['Traceable waste stream', '≥80%', 'Current demo: no traceability denominator'],['Monthly active users', '≥30%', 'Current demo: no campus users'],['Paid ambassadors', '7–9 positions', 'Proposed staffing only'],['New demo verified events',String(state.submissions.filter(s=>s.status==='Approved').length),'Local approvals; not university outcome']];
    $('#sustainability-targets').innerHTML=targets.map(([a,b,c])=>`<article class="target-card"><span>${escapeHTML(a)}</span><strong>${escapeHTML(b)}</strong><small>${escapeHTML(c)}</small></article>`).join('');
    $('#audit-records').innerHTML=state.auditEvents.map(x=>`<div class="staff-record"><div><strong>${escapeHTML(x.action)} · ${escapeHTML(x.object)}</strong><small>${escapeHTML(x.role.toUpperCase())} · ${friendlyDate(x.at)} · ${escapeHTML(x.at?.slice(11,16)||'')}</small><p>${escapeHTML(x.reason||'No additional note')}</p></div>${badge(x.outcome)}</div>`).join('')||'<div class="staff-record">No events yet.</div>';
  }
  function reviewSubmission(id){
    if(!roleGate('staff'))return;const s=state.submissions.find(x=>x.id===id);if(!s||s.status!=='Pending'){announce('This record is no longer pending.');return;}
    openModal(`<div class="modal-form"><span class="eyebrow">STAFF / HUMAN VERIFICATION</span><h2 id="modal-heading">Review CA-${s.id}.</h2><p>${escapeHTML(s.type)} · ${escapeHTML(s.item)} · ${escapeHTML(s.location)} · ${friendlyDate(s.createdAt)}</p><div class="status-note">No physical waste was verified by this prototype. Select a simulated decision with a reason; only Approved issues points once.</div><form id="verification-decision-form" data-id="${s.id}"><div class="field"><label for="verification-decision">Decision *</label><select id="verification-decision"><option value="Approved">Approve</option><option value="Rejected">Reject</option></select></div><div class="field"><label for="verification-reason">Review note / rejection reason *</label><textarea id="verification-reason" maxlength="180" required placeholder="e.g. Staff demo review of submitted record"></textarea></div><button type="submit" class="btn btn-dark btn-wide">Record simulated decision ↗&#xFE0E;</button></form></div>`);
  }
  function reviewListing(id){
    if(!roleGate('staff'))return;const p=state.items.find(x=>x.id===id);if(!p||p.status!=='Pending review')return;
    openModal(`<div class="modal-form"><span class="eyebrow">STAFF / LISTING MODERATION</span><h2 id="modal-heading">Review item #${id}.</h2><p>${escapeHTML(p.name)} · ${escapeHTML(p.category)}. Policy review is a demo of human oversight, not a validated content filter.</p><form id="listing-review-form" data-id="${id}"><div class="field"><label for="listing-decision">Decision</label><select id="listing-decision"><option value="Approved">Approve listing</option><option value="Rejected">Reject listing</option></select></div><div class="field"><label for="listing-review-reason">Reason code / decision note *</label><input id="listing-review-reason" maxlength="120" required placeholder="e.g. POLICY-REVIEW: requires clarification"></div><button class="btn btn-dark btn-wide" type="submit">Confirm staff review ↗&#xFE0E;</button></form></div>`);
  }
  function reportItem(id){
    if(!roleGate('student'))return;const p=state.items.find(x=>x.id===id);if(!p)return;
    openModal(`<div class="modal-form"><span class="eyebrow">EXCHANGE / SAFETY & TRUST</span><h2 id="modal-heading">Report a concern.</h2><p>Item #${p.id} · ${escapeHTML(p.name)}. The record will be sent to the demonstration staff queue. Reports on an active or completed exchange freeze its status.</p><form id="report-form" data-id="${id}"><div class="field"><label for="report-reason">Describe the concern *</label><textarea id="report-reason" required minlength="8" maxlength="240" placeholder="e.g. The item's condition was not as described"></textarea></div><button class="btn btn-dark btn-wide" type="submit">Submit demo report ↗&#xFE0E;</button></form><p class="modal-help">Proposed human response target: within two days; no messages are sent.</p></div>`);
  }
  function reviewReport(id){
    if(!roleGate('staff'))return;const r=state.reports.find(x=>x.id===id);if(!r||r.status!=='Open')return;
    openModal(`<div class="modal-form"><span class="eyebrow">STAFF / REPORT REVIEW</span><h2 id="modal-heading">Resolve REP-${id}.</h2><p>${escapeHTML(r.type)} · ${escapeHTML(r.reason)}. No automatic sanctions will be imposed.</p><form id="report-review-form" data-id="${id}"><div class="field"><label for="report-decision">Staff decision</label><select id="report-decision"><option value="Closed">Close report, restore record</option><option value="Removed">Remove listing from marketplace</option></select></div><div class="field"><label for="report-review-note">Staff reasoning *</label><textarea id="report-review-note" required minlength="5" maxlength="200" placeholder="Explain the manual decision"></textarea></div><button type="submit" class="btn btn-dark btn-wide">Record resolution ↗&#xFE0E;</button></form></div>`);
  }
  function handleClick(event){
    const t=event.target.closest('button');if(!t)return;
    if(t.dataset.onboardingStart){
      const shell=$('#modal-shell');
      const target=$('#onboarding-role-section');
      if(shell&&target){
        const top=target.getBoundingClientRect().top-shell.getBoundingClientRect().top+shell.scrollTop-32;
        const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        shell.scrollTo({top:Math.max(0,top),behavior:reduced?'instant':'smooth'});
        $('#onboarding-role-title')?.focus({preventScroll:true});
      }
      return;
    }
    if(t.dataset.enterRole){chooseRole(t.dataset.enterRole);return;}if(t.dataset.open === 'portal'){ showPortalChoice();return;}
    if (t.dataset.nav && role === 'guest' && t.dataset.nav !== 'home'){  showPortalChoice();  return;}
    if(t.dataset.nav){if(t.dataset.profileTab)profileTab=t.dataset.profileTab;navigate(t.dataset.nav);if(t.dataset.jump&&role==='student'){requestAnimationFrame(()=>{const sel=t.dataset.jump==='wallet'?'#wallet-section':'#circular-tools';$(sel)?.scrollIntoView({behavior:'smooth',block:'start'});});}return;}
    if(t.dataset.profileTab){if(!roleGate('student'))return;profileTab=t.dataset.profileTab;renderProfile();return;}
    const staffActions=['adminTab','reviewSubmission','reviewListing','reviewReport','resolve','createNorthOrder'];
    const studentActions=['open','detail','category','favorite','startReserve','handover','acceptSeller','scan','complete','art','redeem','confirmReward','reportItem'];
    if(staffActions.some(key=>key in t.dataset)&&!roleGate('staff'))return;
    if(studentActions.some(key=>key in t.dataset)&&!roleGate('student'))return;
    if(t.dataset.open==='post'){showPost();return;}
    if(t.dataset.detail){showDetail(Number(t.dataset.detail));return;}
    if(t.dataset.category){category=t.dataset.category;renderProducts();return;}
    if(t.dataset.favorite){const id=Number(t.dataset.favorite);state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();paint();announce(state.favorites.includes(id)?'Saved to My Profile.':'Removed from saved items.');return;}
    if(t.dataset.startReserve){const p=state.items.find(x=>x.id===Number(t.dataset.startReserve));if(p?.ownerId===STUDENT){announce('You cannot reserve your own listing.');return;}reserveForm(Number(t.dataset.startReserve));return;}
    if(t.dataset.handover){showHandover(Number(t.dataset.handover));return;}
    if(t.dataset.acceptSeller){const id=Number(t.dataset.acceptSeller);const r=state.reservations[id];if(r&&r.stage==='pending'){r.stage='accepted';r.respondedAt=stamp();audit('Seller response simulated','EX-'+id,'Accepted');save();paint();showHandover(id);}return;}
    if(t.dataset.scan){const id=Number(t.dataset.scanItem),r=state.reservations[id];if(r&&r.stage==='accepted'){const key=t.dataset.scan==='seller'?'sellerScan':'buyerScan';if(!r[key]){r[key]=true;audit('Handover confirmation','EX-'+id,key);save();paint();}showHandover(id);}return;}
    if(t.dataset.complete){const id=Number(t.dataset.complete),r=state.reservations[id],p=state.items.find(x=>x.id===id);if(!r||!p||r.stage!=='accepted'||!r.sellerScan||!r.buyerScan||p.status!=='Reserved'){announce('Both confirmations are required before completion.');return;}p.status='Completed';r.stage='complete';r.completedAt=stamp();state.completed++;issuePoints('Verified exchange · '+p.name,20,'EX-'+id);audit('Exchange completed','EX-'+id,'Completed','Simulated dual-party confirmation');save();closeModal();paint();announce('Exchange completed. +20 demo points recorded once.');return;}
    if(t.dataset.art){selectedArt=t.dataset.art;$$('[data-art]').forEach(b=>b.classList.toggle('selected',b.dataset.art===selectedArt));return;}
    if(t.dataset.redeem){showReward(Number(t.dataset.redeem));return;}
    if(t.dataset.confirmReward){const index=Number(t.dataset.confirmReward),r=REWARDS[index];if(!r||state.points<r.cost){announce('Not enough points.');return;}issuePoints('Redeemed · '+r.title,-r.cost,'REWARD-'+index);if(index===0)state.featuredCredits++;audit('Reward redeemed','REWARD-'+index,'Deducted',r.title);save();closeModal();paint();announce(index===0?'Demo feature credit saved; promotion waits for category capacity.':'Illustrative reward recorded; not a real voucher.');return;}
    if(t.dataset.reviewSubmission){reviewSubmission(Number(t.dataset.reviewSubmission));return;}
    if(t.dataset.reviewListing){reviewListing(Number(t.dataset.reviewListing));return;}
    if(t.dataset.reviewReport){reviewReport(Number(t.dataset.reviewReport));return;}
    if(t.dataset.reportItem){reportItem(Number(t.dataset.reportItem));return;}
    if(t.dataset.resolve){const w=state.workOrders.find(x=>x.id===Number(t.dataset.resolve));if(!w||w.status!=='Open')return;w.status='Resolved';w.updatedAt=stamp();audit('Work order resolved','WO-'+w.id,'Resolved','Follow-up recorded, effectiveness not verified');save();paint();announce('Demo work order resolved. Real effectiveness requires reinspection.');return;}
    if(t.dataset.adminTab){setAdminTab(t.dataset.adminTab);return;}
    if(t.dataset.createNorthOrder!==undefined){createOrder();setAdminTab('facilities');return;}
  }
  function handleSubmit(event){
    const form=event.target;const id=form.id;
    if(!['post-form','reservation-form','action-form','order-form','verification-decision-form','listing-review-form','report-form','report-review-form'].includes(id))return;
    event.preventDefault();
    if(['order-form','verification-decision-form','listing-review-form','report-review-form'].includes(id)&&!roleGate('staff'))return;
    if(['post-form','reservation-form','action-form','report-form'].includes(id)&&!roleGate('student'))return;
    if(id==='post-form'){
      const title=$('#post-title').value.trim(),type=$('#post-type').value,val=type==='Sell'?Number($('#post-price').value):0;
      if(!title||!Number.isFinite(val)||val<0){announce('Enter a valid item and price.');return;}
      const flagged=/\b(weapon|knife|vape|tobacco)\b/i.test(title);const p={id:state.nextId++,name:title,category:$('#post-category').value,price:val,condition:$('#post-condition').value,location:$('#post-location').value,seller:'Alex M. · demo student',ownerId:STUDENT,method:$('#post-method').value,timeWindow:$('#post-window').value,image:selectedArt,type,desc:$('#post-desc').value.trim()||'A student item ready for its next campus home.',status:flagged?'Pending review':'Available',date:Date.now(),createdAt:stamp(),photosDemo:1};
      state.items.unshift(p);audit('Listing submitted','ITEM-'+p.id,p.status,flagged?'Demo keyword triggered human review':'Illustrative automatic check; no real policy engine');save();closeModal();category='All items';$('#market-search').value='';$('#market-sort').value='newest';navigate(flagged?'profile':'exchange');if(flagged){profileTab='listings';renderProfile();}announce(flagged?'Listing held for simulated staff review.':'Sample listing published after illustrative auto-check.');return;
    }
    if(id==='reservation-form'){
      const i=Number(form.dataset.item),p=state.items.find(x=>x.id===i);if(!p||p.status!=='Available'||p.ownerId===STUDENT){announce('This item is not available for you to reserve.');return;}
      p.status='Reserved';state.reservations[i]={ownerId:STUDENT,stage:'pending',method:$('#reserve-method').value,time:$('#reserve-time').value,sellerScan:false,buyerScan:false,createdAt:stamp()};audit('Reservation made','EX-'+i,'Pending','Proposed 24h hold / seller responds within 12h; timers conceptual');save();paint();showHandover(i);announce('Reserved in the demo. Seller acceptance pending.');return;
    }
    if(id==='action-form'){
      const type=$('#action-type').value,item=$('#action-item').value.trim(),location=$('#action-location').value;if(!item){announce('Please add an item or material.');return;}
      const sub={id:state.nextId++,type,item,location,status:'Pending',ownerId:STUDENT,createdAt:stamp()};state.submissions.unshift(sub);audit('Circular event submitted','CA-'+sub.id,'Pending','Requires human verification');save();$('#action-item').value='';paint();announce('Submitted CA-'+sub.id+'. No points before staff approval.');return;
    }
    if(id==='order-form'){const title=$('#order-title').value.trim();if(!title)return;createOrder(title,$('#order-location').value);closeModal();setAdminTab('facilities');return;}
    if(id==='verification-decision-form'){
      const s=state.submissions.find(x=>x.id===Number(form.dataset.id));if(!s||s.status!=='Pending'){announce('Already reviewed.');closeModal();return;}
      const decision=$('#verification-decision').value,reason=$('#verification-reason').value.trim();if(reason.length<4){announce('Add a short review note.');return;}
      s.status=decision;s.reviewReason=reason;s.reviewedAt=stamp();s.reviewedBy='Demo staff';
      if(decision==='Approved'){state.approved++;issuePoints('Staff-approved '+s.type.toLowerCase()+' · '+s.item,s.type==='Recycle'?5:15,'CA-'+s.id);}
      audit('Circular action reviewed','CA-'+s.id,decision,reason);save();closeModal();paint();setAdminTab('verification');announce(decision==='Approved'?'Approved and points issued once.':'Rejected, no points issued.');return;
    }
    if(id==='listing-review-form'){
      const p=state.items.find(x=>x.id===Number(form.dataset.id));if(!p||p.status!=='Pending review')return;const decision=$('#listing-decision').value,reason=$('#listing-review-reason').value.trim();if(!reason){announce('Reason code required.');return;}p.status=decision==='Approved'?'Available':'Rejected';p.reviewReason=reason;audit('Listing human-reviewed','ITEM-'+p.id,p.status,reason);save();closeModal();paint();setAdminTab('moderation');announce('Demo staff decision recorded.');return;
    }
    if(id==='report-form'){
      const p=state.items.find(x=>x.id===Number(form.dataset.id)),reason=$('#report-reason').value.trim();if(!p||reason.length<8){announce('Please describe the concern.');return;}
      const existing=state.reports.some(r=>r.itemId===p.id&&r.ownerId===STUDENT&&r.status==='Open');if(existing){announce('You already have an open report for this item.');return;}
      const isExchange=['Reserved','Completed'].includes(p.status);const r={id:state.nextId++,itemId:p.id,ownerId:STUDENT,type:isExchange?'Exchange':'Listing',reason,status:'Open',createdAt:stamp(),previousStatus:p.status,previousStage:state.reservations[p.id]?.stage};state.reports.unshift(r);
      if(isExchange){p.status='Disputed';if(state.reservations[p.id])state.reservations[p.id].stage='disputed';}
      audit('Student reported item','REP-'+r.id,'Open',reason);save();closeModal();paint();announce('Report submitted to staff. Exchange frozen if applicable.');return;
    }
    if(id==='report-review-form'){
      const r=state.reports.find(x=>x.id===Number(form.dataset.id)),reason=$('#report-review-note').value.trim();if(!r||r.status!=='Open'||reason.length<5){announce('Please add review reasoning.');return;}
      const decision=$('#report-decision').value,p=state.items.find(x=>x.id===r.itemId);r.status='Closed';r.resolution=decision;r.reviewReason=reason;r.reviewedAt=stamp();
      if(p&&decision==='Removed')p.status='Removed';else if(p&&r.type==='Exchange'){p.status=r.previousStatus||'Reserved';if(state.reservations[p.id])state.reservations[p.id].stage=r.previousStage||'accepted';}
      audit('Report human-reviewed','REP-'+r.id,decision,reason);save();closeModal();paint();setAdminTab('moderation');announce('Report resolved with staff reasoning.');return;
    }
  }
  document.addEventListener('click',handleClick);
  document.addEventListener('submit',handleSubmit);
  $('#market-search').addEventListener('input',renderProducts);
  $('#market-sort').addEventListener('change',renderProducts);
  $('#clear-search').addEventListener('click',()=>{category='All items';$('#market-search').value='';$('#market-sort').value='newest';renderProducts();});
  $('#sort-guide').addEventListener('change',renderGuide);
  $('#verification-list').addEventListener('change',e=>{if(['verification-status','verification-type','verification-location'].includes(e.target.id))renderVerificationRows();});
  $('#menu-toggle').addEventListener('click',()=>{const next=$('#mobile-nav').hidden;$('#mobile-nav').hidden=!next;$('#menu-toggle').setAttribute('aria-expanded',String(next));});
  $('#switch-portal').addEventListener('click',exitRole);
  $('#modal-close').addEventListener('click',closeModal);
  $('#modal-backdrop').addEventListener('click',e=>{if(e.target===$('#modal-backdrop'))closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();$('#mobile-nav').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');}if(e.key==='Tab'&&!$('#modal-backdrop').hidden){const focusable=$$('#modal-shell button:not([disabled]),#modal-shell input:not([disabled]),#modal-shell select:not([disabled]),#modal-shell textarea:not([disabled])').filter(el=>el.offsetParent!==null);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  $('#jump-to-action').addEventListener('click',()=>{if(!roleGate('student'))return;$('#circular-tools').scrollIntoView({behavior:'smooth',block:'start'});$('#action-item').focus({preventScroll:true});});
  $('#jump-to-wallet').addEventListener('click',()=>{if(roleGate('student'))$('#wallet-section').scrollIntoView({behavior:'smooth',block:'start'});});
  $$('[data-action-type]').forEach(b=>b.addEventListener('click',()=>{if(!roleGate('student'))return;$('#action-type').value=b.dataset.actionType;$('#circular-tools').scrollIntoView({behavior:'smooth',block:'start'});$('#action-item').focus({preventScroll:true});}));
  $('#create-signage-order').addEventListener('click',()=>{if(roleGate('staff'))createOrder();});
  $('#new-facility-order').addEventListener('click',()=>{if(roleGate('staff'))showManualOrder();});
  $('#reset-demo').addEventListener('click',()=>{if(!window.confirm('Reset all fictional RELOOP data, reservations, rewards, staff decisions and work orders?'))return;state=initialState();role='guest';try{localStorage.removeItem(ROLE_KEY);}catch(e){}category='All items';profileTab='listings';save();closeModal();refreshRole();navigate('home');setAdminTab('overview');announce('All demo records reset to the fictional starting scenario.');});
  
function syncFromUrl() {
  const target = location.hash.slice(1) || 'home';

  // 仅在目标页面变化时恢复页面
  if (target !== route) {
    navigate(target, false);
  }
}

window.addEventListener('popstate', syncFromUrl);
window.addEventListener('hashchange', syncFromUrl);

  window.addEventListener('storage',e=>{if(e.key===KEY){state=loadState();paint();}else if(e.key===ROLE_KEY){role=['student','staff'].includes(e.newValue)?e.newValue:'guest';refreshRole();navigate(role==='guest'?'home':role==='staff'?'operations':'student');}});
  save();renderGuide();refreshRole();paint();setAdminTab('overview');navigate(location.hash.slice(1)||'home', false);
})();
