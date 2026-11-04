// (() => {

//   const now = () => new Date();

//   const relative = hours => new Date(Date.now()-hours*3600000).toISOString();

//   const fmt = value => new Date(value).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});

//   const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

//   const $ = id => document.getElementById(id);

//   const statuses=['Aberta','Em análise','Em andamento','Aguardando peça/material/manutenção externa','Resolvida','Encerrada'];

//   let incidents=[

//     {id:'OC-104',
//       category:'Tecnologia',
//       type:'Rede',
//       room:'Laboratório 03',
//       priority:'Crítica',
//       status:'Aberta',
//       owner:'Não atribuído',
//       author:'Marina Costa',
//       equipment:'SW-03',
//       description:'Computadores sem acesso à rede durante a aula.',
//       created:relative(3),
//       timeline:[{text:'Ocorrência aberta por Marina Costa',date:relative(3)}],comments:[]},

//     {id:'OC-103',
//       category:'Infraestrutura',
//       type:'Ar-condicionado',
//       room:'Sala 204',
//       priority:'Alta',
//       status:'Em andamento',
//       owner:'Alex Santos',
//       author:'João Ribeiro',
//       equipment:'AR-204',
//       description:'Ar-condicionado não refrigera.',
//       created:relative(25),
//       timeline:[{text:'Ocorrência aberta',date:relative(25)},
//         {text:'Em andamento · Alex Santos',date:relative(21)}],comments:[]},

//     {id:'OC-102',category:'Tecnologia',type:'Hardware',room:'Laboratório 02',priority:'Média',status:'Aguardando peça/material/manutenção externa',owner:'Alex Santos',author:'Marina Costa',equipment:'PC-028',description:'Computador com falha na inicialização; necessita de fonte.',created:relative(78),timeline:[{text:'Ocorrência aberta',date:relative(78)},{text:'Aguardando peça/material/manutenção externa',date:relative(29)}],comments:[]},

//     {id:'OC-101',category:'Infraestrutura',type:'Projetor',room:'Sala 105',priority:'Baixa',status:'Resolvida',owner:'Alex Santos',author:'João Ribeiro',equipment:'PR-105',description:'Imagem do projetor desfocada.',created:relative(146),timeline:[{text:'Ocorrência aberta',date:relative(146)},{text:'Resolvida · Alex Santos',date:relative(110)}],comments:[]}

//   ];

//   let carts=[{id:'Carrinho 02',teacher:'Marina Costa',course:'DSM',subject:'Programação Web',className:'DSM 2º semestre',room:'Laboratório 01',open:relative(3.5),close:null},{id:'Carrinho 01',teacher:'Marina Costa',course:'DSM',subject:'Banco de Dados',className:'DSM 3º semestre',room:'Laboratório 02',open:relative(30),close:relative(28)}];

//   let equipment=[{id:'PC-028',type:'Computador',model:'Dell OptiPlex',block:'Bloco A',room:'Laboratório 02',received:'2024-02-15',status:'Em manutenção',notes:'Aguardando substituição de fonte.',moves:[{room:'Laboratório 02',date:relative(120)}]},{id:'SW-03',type:'Switch',model:'TP-Link 24 portas',block:'Bloco A',room:'Laboratório 03',received:'2023-08-10',status:'Em uso',notes:'Verificar conectividade.',moves:[{room:'Laboratório 03',date:relative(250)}]},{id:'AR-204',type:'Ar-condicionado',model:'Split 18.000 BTU',block:'Bloco B',room:'Sala 204',received:'2022-04-20',status:'Em manutenção',notes:'Avaliar refrigeração.',moves:[{room:'Sala 204',date:relative(600)}]}];

//   let maintenance=[{category:'Tecnologia',room:'Laboratório 01',agent:'Alex Santos',date:relative(48),failed:0},{category:'Infraestrutura',room:'Sala 105',agent:'Alex Santos',date:relative(98),failed:0}];

//   const pages=[

//     ['dashboard','Visão geral','layout-dashboard','Acompanhe os atendimentos e os recursos da unidade.'],

//     ['ocorrencias','Ocorrências','clipboard-list','Registre problemas e acompanhe cada atendimento.'],

//     ['carrinhos','Carrinhos','laptop','Abertura e devolução rápida de notebooks.'],

//     ['equipamentos','Equipamentos','monitor','Inventário e localização dos recursos.'],

//     ['manutencao','Manutenção preventiva','calendar-check','Planeje e registre vistorias.'],

//     ['relatorios','Relatórios','chart-no-axes-column','Indicadores demonstrativos por período.'],

//     ['historico','Meu histórico','history','Seus carrinhos e suas ocorrências.'],

//     ['configuracoes','Usuários e configurações','settings','Perfis, permissões e parâmetros.'],

//     ['aprovacoes','Aprovação de cadastros','user-check','Analise as solicitações de acesso ao sistema.'],

//     ['alertas','Alertas','bell','Acompanhe situações que exigem atenção.'],

//     ['perfil','Meu perfil','user-round','Dados demonstrativos da sessão.']

//   ];

//   let role=null, user=null, current='dashboard', lastFocus=null;

//   const permission={professor:['dashboard','ocorrencias','carrinhos','historico','alertas','perfil'],auxiliar:['dashboard','ocorrencias','carrinhos','equipamentos','manutencao','relatorios','aprovacoes','alertas','perfil'],gestor:['dashboard','ocorrencias','carrinhos','equipamentos','manutencao','relatorios','configuracoes','alertas','perfil']};

//   function message(text,type='success'){ $('flash').innerHTML=`<div class="notice ${type}">${esc(text)}</div>`; clearTimeout(message.timer);message.timer=setTimeout(()=>$('flash').replaceChildren(),6500) }

//   function busy(button,fn){button.disabled=true;const label=button.textContent;button.textContent='Processando…';setTimeout(()=>{try{fn()}catch(e){message('Não foi possível concluir esta ação. Confira os campos e tente novamente.','error')}finally{button.disabled=false;button.textContent=label}},260)}

//   function badge(text){const kind=text==='Crítica'||text==='Aberta'?'danger':text==='Alta'||text.startsWith('Aguardando')?'warn':text==='Resolvida'||text==='Encerrada'?'neutral':'';return `<span class="badge ${kind}">${text==='Crítica'?'⚠':text==='Resolvida'||text==='Encerrada'?'✓':'●'} ${esc(text)}</span>`}

//   function allowed(){return permission[role]}

//   function nav(){ $('nav').innerHTML=pages.filter(p=>allowed().includes(p[0])).map(p=>`<button type="button" class="navbtn ${p[0]===current?'active':''}" data-page="${p[0]}" ${p[0]===current?'aria-current="page"':''}><i data-lucide="${p[2]}"></i><span>${p[1]}</span></button>`).join('');lucide.createIcons()}

//   function go(page){if(!allowed().includes(page))page='dashboard';current=page;pages.forEach(p=> $('view-'+p[0]).hidden=p[0]!==page);const data=pages.find(p=>p[0]===page);$('view-title').textContent=data[1];$('header-area').textContent=data[1];$('view-subtitle').textContent=data[3];$('sidebar').classList.remove('open');$('menu-btn').setAttribute('aria-expanded','false');$('flash').replaceChildren();nav();render();window.scrollTo({top:0,behavior:'smooth'})}

//   function periodOk(item,period){const age=Date.now()-new Date(item.created||item.date).getTime();return period==='all'||age<(period==='week'?7:period==='month'?31:366)*86400000}

//   function active(i){return !['Resolvida','Encerrada'].includes(i.status)}

//   function alerts(){return [...carts.filter(c=>!c.close&&(Date.now()-new Date(c.open))>7200000).map(c=>({title:'Carrinho aberto além do previsto',body:`${c.id} · ${c.teacher} · desde ${fmt(c.open)}`,page:'carrinhos'})),...incidents.filter(i=>i.priority==='Crítica'&&i.status==='Aberta').map(i=>({title:'Ocorrência crítica sem atendimento',body:`${i.id} · ${i.type} · ${i.room}`,page:'ocorrencias'})),...(role==='auxiliar'?users.filter(u=>u.status==='Pendente').map(u=>({title:'Cadastro aguardando aprovação',body:`${u.name} · ${roleName[u.role]} · ${u.email}`,page:'aprovacoes'})):[])]}

//   function tableEmpty(cols){return `<tr><td colspan="${cols}" class="subtle" style="padding:26px">Nenhum registro encontrado para os filtros selecionados.</td></tr>`}

//   function incidentRow(i,short=false){return `<tr><td><strong>${esc(i.id)}</strong></td>${short?'':`<td>${fmt(i.created)}</td>`}<td>${esc(i.room)}</td><td>${esc(i.type)}</td>${short?'':`<td>${esc(i.category)}</td>`}<td>${badge(i.priority)}</td><td>${badge(i.status)}</td>${short?`<td>${esc(i.owner)}</td>`:''}<td><button type="button" class="btn small" data-incident="${esc(i.id)}">Detalhes</button></td></tr>`}

//   function render(){

//     $('alert-count').textContent=alerts().length;

//     const summary=[['Abertas',incidents.filter(i=>i.status==='Aberta').length],['Críticas',incidents.filter(i=>i.priority==='Crítica'&&active(i)).length],['Em andamento',incidents.filter(i=>i.status==='Em andamento').length],['Resolvidas',incidents.filter(i=>i.status==='Resolvida'||i.status==='Encerrada').length],['Carrinhos em uso',carts.filter(c=>!c.close).length]];

//     $('stats').innerHTML=summary.map(([title,n])=>`<div class="card stat"><span>${title}</span><strong>${n}</strong></div>`).join('');

//     const max=Math.max(1,...['Crítica','Alta','Média','Baixa'].map(p=>incidents.filter(i=>i.priority===p).length));

//     $('priority-chart').innerHTML=['Crítica','Alta','Média','Baixa'].map(p=>{let n=incidents.filter(i=>i.priority===p).length;return `<div class="bar-row"><div><strong>${esc(p)}</strong><span>${n} ocorrência${n===1?'':'s'}</span></div><div class="progress-track"><div class="progress-fill" style="width:${n/max*100}%"></div></div></div>`}).join('');

//     $('dashboard-alerts').textContent=alerts().length?`${alerts().length} alerta(s) aguardando atenção. Acesse a Central de alertas.`:'Nenhum alerta ativo neste momento.';

//     const dash=incidents.filter(i=>active(i)&&periodOk(i,$('dashboard-period').value)&&($('dashboard-category').value==='all'||i.category===$('dashboard-category').value));

//     $('dashboard-rows').innerHTML=dash.map(i=>incidentRow(i,true)).join('')||tableEmpty(7);

//     const search=$('incident-search').value.toLocaleLowerCase('pt-BR');

//     const list=incidents.filter(i=>`${i.id} ${i.room} ${i.type} ${i.description}`.toLocaleLowerCase('pt-BR').includes(search)&&[$('incident-category').value==='all'||i.category===$('incident-category').value,$('incident-status').value==='all'||i.status===$('incident-status').value,$('incident-priority').value==='all'||i.priority===$('incident-priority').value].every(Boolean));

//     $('incident-rows').innerHTML=list.map(i=>incidentRow(i)).join('')||tableEmpty(8);$('incident-total').textContent=`${list.length} registro(s)`;

//     $('cart-rows').innerHTML=carts.map(c=>`<tr><td>${esc(c.id)}</td><td>${esc(c.teacher)}</td><td>${esc(c.subject)} · ${esc(c.className)}</td><td>${esc(c.room)}</td><td>${fmt(c.open)}</td><td>${c.close?fmt(c.close):'—'}</td><td>${badge(c.close?'Encerrada':'Em andamento')}</td></tr>`).join('')||tableEmpty(7);

//     const previous=$('return-cart').value;$('return-cart').innerHTML='<option value="">Selecione</option>'+carts.filter(c=>!c.close).map(c=>`<option value="${esc(c.id)}">${esc(c.id)} · ${esc(c.teacher)}</option>`).join('');$('return-cart').value=previous;

//     $('equipment-rows').innerHTML=equipment.map(e=>`<tr><td><strong>${esc(e.id)}</strong></td><td>${esc(e.type)}</td><td>${esc(e.model)}</td><td>${esc(e.block)} · ${esc(e.room)}</td><td>${new Date(e.received+'T12:00:00').toLocaleDateString('pt-BR')}</td><td>${badge(e.status)}</td><td><button type="button" class="btn small" data-equipment="${esc(e.id)}">Detalhes</button></td></tr>`).join('')||tableEmpty(7);

//     $('maintenance-schedule').innerHTML=['Tecnologia','Infraestrutura'].map(category=>`<div class="card pad"><h3>${category}</h3>${maintenance.filter(m=>m.category===category).slice(0,3).map(m=>`<p class="subtle">${fmt(m.date)} · ${esc(m.room)}<br>${esc(m.agent)} · ${m.failed?'Item reprovado':'Itens aprovados'}</p>`).join('')||'<p class="subtle">Nenhuma vistoria registrada.</p>'}</div>`).join('');

//     const period=$('report-period').value,subset=incidents.filter(i=>periodOk(i,period)),counts=arr=>Object.entries(arr.reduce((acc,x)=>(acc[x]=(acc[x]||0)+1,acc),{})).sort((a,b)=>b[1]-a[1]);

//     const report=[['Ocorrências',subset.length],['Manutenções',maintenance.filter(m=>periodOk(m,period)).length],['Manutenção externa',subset.filter(i=>i.status.startsWith('Aguardando')).length],['Exigem recursos',subset.filter(i=>i.status.startsWith('Aguardando')).length],['Salas afetadas',new Set(subset.map(i=>i.room)).size]];

//     $('report-stats').innerHTML=report.map(([t,n])=>`<div class="card stat"><span>${t}</span><strong>${n}</strong></div>`).join('');

//     $('report-problems').innerHTML=counts(subset.map(i=>i.type)).map(([x,n])=>`<li>${esc(x)} <strong style="float:right">${n}</strong></li>`).join('')||'<li class="subtle">Nenhum dado no período.</li>';

//     $('report-rooms').innerHTML=counts(subset.map(i=>i.room)).map(([x,n])=>`<li>${esc(x)} <strong style="float:right">${n}</strong></li>`).join('')||'<li class="subtle">Nenhum dado no período.</li>';

//     $('report-resources').innerHTML=subset.filter(i=>i.status.startsWith('Aguardando')).map(i=>`<tr><td>${esc(i.id)}</td><td>${esc(i.room)}</td><td>${esc(i.type)} · ${esc(i.equipment)}</td><td>${badge(i.status)}</td></tr>`).join('')||tableEmpty(4);

//     $('history-carts').innerHTML=carts.filter(c=>user&&c.teacher===user.name).map(c=>`<tr><td>${esc(c.id)}</td><td>${fmt(c.open)}</td><td>${esc(c.className)}</td><td>${esc(c.subject)}</td><td>${esc(c.room)}</td></tr>`).join('')||tableEmpty(5);

//     $('history-incidents').innerHTML=incidents.filter(i=>user&&i.author===user.name).map(i=>`<tr><td>${esc(i.id)}</td><td>${fmt(i.created)}</td><td>${esc(i.type)}</td><td>${esc(i.room)}</td><td>${badge(i.status)}</td></tr>`).join('')||tableEmpty(5);

//     $('alerts-list').innerHTML=alerts().map(a=>`<div class="card pad"><strong>⚠ ${esc(a.title)}</strong><p class="subtle">${esc(a.body)}</p><button type="button" class="btn small" data-goto="${a.page}">Ver área</button></div>`).join('')||'<div class="card pad">✓ Nenhum alerta ativo. Os registros estão dentro do esperado.</div>';

//     renderAccess();

//   }

//   function modal(title,html){lastFocus=document.activeElement;$('modal-title').textContent=title;$('modal-body').innerHTML=html;$('modal-layer').classList.remove('hidden');$('modal-close').focus()}

//   function closeModal(){$('modal-layer').classList.add('hidden');$('modal-body').replaceChildren();lastFocus?.focus()}

//   function newIncident(){modal('Abrir ocorrência',`<form id="create-incident" class="stack"><div class="form-grid"><div class="field"><label for="new-category">Categoria</label><select id="new-category"><option>Tecnologia</option><option>Infraestrutura</option></select></div><div class="field"><label for="new-type">Tipo de problema</label><select id="new-type"><option>Hardware</option><option>Rede</option><option>Software</option><option>Armazenamento</option><option>Televisão</option><option>Ar-condicionado</option><option>Projetor</option><option>Outro</option></select></div><div class="field"><label for="new-room">Local / sala</label><input id="new-room" required placeholder="Ex.: Laboratório 03"></div><div class="field"><label for="new-priority">Prioridade</label><select id="new-priority"><option>Média</option><option>Baixa</option><option>Alta</option><option>Crítica</option></select></div><div class="field full"><label for="new-equipment-ref">Equipamento(s) relacionado(s)</label><input id="new-equipment-ref" placeholder="Patrimônio ou identificação, se houver"></div><div class="field full"><label for="new-description">Descrição do problema</label><textarea id="new-description" required minlength="10" placeholder="O que aconteceu?"></textarea></div></div><button class="btn primary" type="submit">Registrar ocorrência</button></form>`)}

//   function createIncident(values){const id='OC-'+(Math.max(104,...incidents.map(i=>Number(i.id.split('-')[1])||0))+1),date=now().toISOString();incidents.unshift({id,category:values.category,type:values.type,room:values.room,priority:values.priority,status:'Aberta',owner:'Não atribuído',author:values.author||user.name,equipment:values.equipment||'Não informado',description:values.description,created:date,timeline:[{text:'Ocorrência aberta',date}],comments:[]});return id}

//   function incidentDetail(id){const i=incidents.find(x=>x.id===id);if(!i)return;modal(`${i.id} · ${i.type}`,`<div class="row">${badge(i.priority)} ${badge(i.status)} <span class="subtle">${esc(i.category)} · ${esc(i.room)}</span></div><p>${esc(i.description)}</p><p class="subtle"><strong>Equipamento:</strong> ${esc(i.equipment)} · <strong>Aberta por:</strong> ${esc(i.author)} · <strong>Responsável:</strong> ${esc(i.owner)}</p><div class="divider"></div><h3>Linha do tempo</h3><div class="timeline">${i.timeline.map(t=>`<div class="timeline-item"><strong>${esc(t.text)}</strong><small>${fmt(t.date)}</small></div>`).join('')}${i.comments.map(c=>`<div class="timeline-item"><strong>Comentário · ${esc(c.author)}</strong><p>${esc(c.text)}</p><small>${fmt(c.date)}</small></div>`).join('')}</div>${role!=='professor'?`<form id="status-form" class="stack"><div class="field"><label for="detail-status">Atualizar status</label><select id="detail-status">${statuses.map(s=>`<option ${s===i.status?'selected':''}>${s}</option>`).join('')}</select></div><div class="field"><label for="detail-owner">Responsável pelo atendimento</label><input id="detail-owner" required value="${esc(i.owner==='Não atribuído'?'Alex Santos':i.owner)}"></div><button type="submit" class="btn primary">Salvar andamento</button></form><div class="divider"></div>`:''}<form id="comment-form" class="stack"><div class="field"><label for="detail-comment">Adicionar comentário</label><textarea id="detail-comment" required placeholder="Escreva uma atualização para a equipe"></textarea></div><button type="submit" class="btn">Adicionar comentário</button></form>`);$('modal-body').dataset.incident=id}

//   function equipmentDetail(id){const e=equipment.find(x=>x.id===id);if(!e)return;modal(`${e.id} · ${e.type}`,`<p><strong>Modelo:</strong> ${esc(e.model)}<br><strong>Localização atual:</strong> ${esc(e.block)} · ${esc(e.room)}<br><strong>Status:</strong> ${esc(e.status)}<br><strong>Observações:</strong> ${esc(e.notes||'Nenhuma')}</p><h3>Movimentações</h3><div class="timeline">${e.moves.map(m=>`<div class="timeline-item">${esc(m.room)}<small>${fmt(m.date)}</small></div>`).join('')}</div><h3>Ocorrências vinculadas</h3><ul class="mini-list">${incidents.filter(i=>i.equipment.includes(e.id)).map(i=>`<li>${esc(i.id)} · ${esc(i.type)} · ${esc(i.status)}</li>`).join('')||'<li class="subtle">Nenhuma ocorrência vinculada.</li>'}</ul>${role!=='professor'?`<div class="divider"></div><form id="move-equipment" class="stack"><div class="field"><label for="move-room">Mover para sala</label><input id="move-room" required placeholder="Nova sala"></div><button type="submit" class="btn primary">Registrar movimentação</button></form>`:''}`);$('modal-body').dataset.equipment=id}

//   function newEquipment(){modal('Cadastrar equipamento',`<form id="create-equipment" class="stack"><div class="form-grid"><div class="field"><label for="eq-id">Patrimônio / ID</label><input id="eq-id" required></div><div class="field"><label for="eq-type">Tipo</label><input id="eq-type" required placeholder="Ex.: Computador"></div><div class="field"><label for="eq-model">Modelo</label><input id="eq-model" required></div><div class="field"><label for="eq-block">Bloco</label><input id="eq-block" required></div><div class="field"><label for="eq-room">Sala</label><input id="eq-room" required></div><div class="field"><label for="eq-date">Data de recebimento</label><input id="eq-date" type="date" required></div><div class="field"><label for="eq-status">Status</label><select id="eq-status"><option>Em uso</option><option>Em manutenção</option><option>Disponível</option></select></div><div class="field full"><label for="eq-notes">Observações</label><textarea id="eq-notes"></textarea></div></div><button type="submit" class="btn primary">Cadastrar nesta sessão</button></form>`)}

//   const checks={Tecnologia:['Computadores e monitores','Cabos e conexões','Periféricos'],Infraestrutura:['Ar-condicionado e ventilação','TV e projetor','Cadeiras, tomadas e iluminação']};

//   function renderChecks(){const category=$('maintenance-category').value;$('maintenance-items').innerHTML=checks[category].map((item,n)=>`<label class="checkrow" for="check-${n}"><input type="checkbox" id="check-${n}" checked><span>${esc(item)} — aprovado</span></label>`).join('')}

//   document.addEventListener('click',e=>{

//     const page=e.target.closest('[data-page],[data-goto]');if(page){go(page.dataset.page||page.dataset.goto);if(page.dataset.action==='new-incident')newIncident();return}

//     const incident=e.target.closest('[data-incident]');if(incident){incidentDetail(incident.dataset.incident);return}

//     const eq=e.target.closest('[data-equipment]');if(eq){equipmentDetail(eq.dataset.equipment);return}

//     if(e.target.closest('#new-incident'))newIncident();

//     if(e.target.closest('#new-equipment'))newEquipment();

//     if(e.target.closest('#modal-close'))closeModal();

//     if(e.target===$('modal-layer'))closeModal();

//     if(e.target.closest('#alert-shortcut'))go('alertas');

//     if(e.target.closest('.export-demo'))message('Exportação indisponível neste protótipo estático. Consulte os dados na tela.','info');

//     if(e.target.closest('#recovery-demo'))logout('recover');

//   });

//   document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('modal-layer').classList.contains('hidden'))closeModal()});

//   $('menu-btn').addEventListener('click',()=>{const open=$('sidebar').classList.toggle('open');$('menu-btn').setAttribute('aria-expanded',String(open))});

//   $('logout-btn').addEventListener('click',()=>logout('login'));

//   ['incident-search','incident-category','incident-status','incident-priority','dashboard-period','dashboard-category','report-period'].forEach(id=>$(id).addEventListener(id==='incident-search'?'input':'change',render));

//   $('return-issue').addEventListener('change',()=>{const yes=$('return-issue').value==='Sim';$('return-extra').classList.toggle('hidden',!yes);['return-type','return-description'].forEach(id=>$(id).required=yes)});

//   $('maintenance-category').addEventListener('change',renderChecks);

//   document.addEventListener('submit',e=>{

//     e.preventDefault();const form=e.target,btn=e.submitter;if(!btn)return;

//     if(form.id==='create-incident')busy(btn,()=>{const id=createIncident({category:$('new-category').value,type:$('new-type').value,room:$('new-room').value.trim(),priority:$('new-priority').value,equipment:$('new-equipment-ref').value.trim(),description:$('new-description').value.trim()});closeModal();render();message(`${id} aberta nesta sessão de demonstração.`)});

//     if(form.id==='status-form')busy(btn,()=>{const i=incidents.find(x=>x.id===$('modal-body').dataset.incident);i.status=$('detail-status').value;i.owner=$('detail-owner').value.trim();i.timeline.push({text:`${i.status} · ${i.owner}`,date:now().toISOString()});incidentDetail(i.id);render();message('Andamento atualizado nesta sessão.')});

//     if(form.id==='comment-form')busy(btn,()=>{const i=incidents.find(x=>x.id===$('modal-body').dataset.incident);i.comments.push({author:user.name,text:$('detail-comment').value.trim(),date:now().toISOString()});incidentDetail(i.id);message('Comentário adicionado nesta sessão.')});

//     if(form.id==='cart-open-form')busy(btn,()=>{const id=$('cart-id').value;if(carts.some(c=>c.id===id&&!c.close)){message('Esse carrinho já está aberto. Selecione outro.','error');return}carts.unshift({id,teacher:$('cart-teacher').value.trim(),course:$('cart-course').value.trim(),subject:$('cart-subject').value.trim(),className:$('cart-class').value.trim(),room:$('cart-room').value.trim(),open:now().toISOString(),close:null});form.reset();$('cart-teacher').value=user.name;$('cart-course').value='Desenvolvimento de Software Multiplataforma';render();message(`${id} aberto às ${fmt(now())}.`)});

//     if(form.id==='cart-return-form')busy(btn,()=>{const c=carts.find(x=>x.id===$('return-cart').value&&!x.close);if(!c){message('Selecione um carrinho em uso.','error');return}if($('return-issue').value==='Não'&&($('return-count').value!=='20'||$('return-condition').value!=='Todos conferidos e em ordem')){message('Há divergência na conferência. Selecione “Sim” e descreva a ocorrência.','error');return}if($('return-issue').value==='Sim'){const id=createIncident({category:$('return-category').value,type:$('return-type').value.trim(),room:c.room,priority:'Média',equipment:$('return-equipment').value.trim()||c.id,description:$('return-description').value.trim(),author:c.teacher});message(`Devolução registrada e ocorrência ${id} aberta nesta sessão.`)}else message(`Devolução de ${c.id} registrada às ${fmt(now())}.`);c.close=now().toISOString();form.reset();$('return-extra').classList.add('hidden');render()});

//     if(form.id==='create-equipment')busy(btn,()=>{const id=$('eq-id').value.trim();if(equipment.some(x=>x.id.toLowerCase()===id.toLowerCase())){message('Esse patrimônio já está cadastrado.','error');return}equipment.unshift({id,type:$('eq-type').value.trim(),model:$('eq-model').value.trim(),block:$('eq-block').value.trim(),room:$('eq-room').value.trim(),received:$('eq-date').value,status:$('eq-status').value,notes:$('eq-notes').value.trim(),moves:[{room:$('eq-room').value.trim(),date:now().toISOString()}]});closeModal();render();message('Equipamento cadastrado nesta sessão.')});

//     if(form.id==='move-equipment')busy(btn,()=>{const eq=equipment.find(x=>x.id===$('modal-body').dataset.equipment);eq.room=$('move-room').value.trim();eq.moves.push({room:eq.room,date:now().toISOString()});equipmentDetail(eq.id);render();message('Movimentação registrada nesta sessão.')});

//     if(form.id==='maintenance-form')busy(btn,()=>{const category=$('maintenance-category').value,failed=[...$('maintenance-items').querySelectorAll('input:not(:checked)')].map(input=>checks[category][Number(input.id.split('-')[1])]);maintenance.unshift({category,room:$('maintenance-room').value.trim(),agent:$('maintenance-agent').value.trim(),date:new Date($('maintenance-date').value).toISOString(),failed:failed.length});const ids=failed.map(item=>createIncident({category,type:item,room:$('maintenance-room').value.trim(),priority:'Média',equipment:'Vistoria preventiva',description:`Item reprovado na vistoria: ${item}. ${$('maintenance-notes').value.trim()}`.trim(),author:$('maintenance-agent').value.trim()}));render();message(ids.length?`Checklist concluído. Ocorrência(s) ${ids.join(', ')} criada(s) automaticamente.`:'Checklist concluído sem reprovações.');$('maintenance-room').value='';$('maintenance-notes').value='';renderChecks()});

//     if(form.id==='settings-form')busy(btn,()=>message('Alterações aplicadas apenas nesta sessão de demonstração.','info'));

//     if(form.id==='personal-form')busy(btn,()=>{const n=$('personal-name').value.trim();if(n&&n!==user.name){const old=user.name;user.name=n;incidents.forEach(i=>{if(i.author===old)i.author=n});carts.forEach(c=>{if(c.teacher===old)c.teacher=n});$('user-chip').textContent=`${n} · ${roleName[role]}`}message('Alterações aplicadas apenas nesta sessão de demonstração.','info')});

//   });



//   const roleName={professor:'Professor',auxiliar:'Auxiliar Docente',gestor:'Gestor / Coordenação'};

//   const roleDesc={professor:'Abertura de ocorrência, carrinhos e histórico pessoal',auxiliar:'Atendimento, equipamentos, manutenção preventiva e aprovação de cadastros',gestor:'Visão gerencial, relatórios e parâmetros'};

//   let users=[

//     {name:'Marina Costa',email:'marina.costa@fatec.sp.gov.br',role:'professor',pass:'Fatec@2026',status:'Ativo'},

//     {name:'Alex Santos',email:'alex.santos@fatec.sp.gov.br',role:'auxiliar',pass:'Fatec@2026',status:'Ativo'},

//     {name:'Patrícia Lima',email:'patricia.lima@fatec.sp.gov.br',role:'gestor',pass:'Fatec@2026',status:'Ativo'},

//     {name:'Carlos Mendes',email:'carlos.mendes@fatec.sp.gov.br',role:'professor',pass:'Fatec@2026',status:'Pendente'}

//   ];

//   let pendingUser=null,loginCode=null,codeTries=0,resetUser=null;

//   const emailOk = v => /^[^\s@]+@fatec\.sp\.gov\.br$/i.test(v);

//   const passOk=v=>v.length>=8&&/[A-Za-z]/.test(v)&&/\d/.test(v);

//   const newCode=()=>String(crypto.getRandomValues(new Uint32Array(1))[0]%900000+100000);

//   const maskEmail=e=>{const [a,b]=e.split('@');return a.slice(0,2)+'•••@'+b};

//   const userBadge=u=>u.status==='Ativo'?'<span class="badge">● Ativo</span>':u.status==='Pendente'?'<span class="badge warn">● Aguardando aprovação</span>':'<span class="badge danger">● Recusado</span>';

//   function authMsg(text,type='error'){$('auth-flash').innerHTML=`<div class="notice ${type}">${esc(text)}</div>`}

//   function showAuth(view){document.body.classList.remove('authed');document.querySelectorAll('[data-auth]').forEach(el=>{el.hidden=el.dataset.auth!==view});$('auth-flash').replaceChildren();window.scrollTo(0,0);const first=document.querySelector(`[data-auth="${view}"] input`);if(first)setTimeout(()=>first.focus(),30)}

 
// function logout(view) {
//     closeModal();

//     user = null;
//     role = null;
//     current = 'dashboard';

//     document.body.classList.remove('gestor-theme');

//     showAuth(view);

//     if (view === 'login') {
//         authMsg('Você saiu do sistema.', 'info');
//     }
// }


  
// function enter(u) {
//     user = u;
//     role = u.role;
//     pendingUser = null;
//     loginCode = null;

//     document.body.classList.add('authed');

//     // Ativa o tema vermelho e cinza somente para o gestor
//     document.body.classList.toggle('gestor-theme', u.role === 'gestor');

//     $('user-chip').textContent = `${u.name} · ${roleName[u.role]}`;
//     $('personal-name').value = u.name;
//     $('personal-email').value = u.email;
//     $('cart-teacher').value = u.name;

//     if (u.role === 'auxiliar') {
//         $('maintenance-agent').value = u.name;
//     }

//     ['login-form', 'code-form'].forEach(id => $(id).reset());

//     go('dashboard');

//     message(
//         `Bem-vindo(a), ${u.name.split(' ')[0]}. Você entrou como ${roleName[u.role]}.`,
//         'info'
//     );
// }


//   function startCode(u){pendingUser=u;loginCode=newCode();codeTries=0;$('code-target').textContent=maskEmail(u.email);$('demo-code').textContent=loginCode;showAuth('code')}

//   function renderAccess(){

//     const rank={Pendente:0,Ativo:1,Recusado:1};

//     const rows=users.filter(u=>u.status==='Pendente'||u.reviewed);

//     $('approval-total').textContent=`${users.filter(u=>u.status==='Pendente').length} aguardando`;

//     $('approval-rows').innerHTML=rows.sort((a,b)=>rank[a.status]-rank[b.status]).map(u=>`<tr><td><strong>${esc(u.name)}</strong></td><td>${esc(u.email)}</td><td>${esc(roleName[u.role])}</td><td>${userBadge(u)}</td><td>${u.status==='Pendente'?`<button type="button" class="btn small primary" data-approve="${esc(u.email)}">Aprovar</button> <button type="button" class="btn small" data-reject="${esc(u.email)}">Recusar</button>`:'—'}</td></tr>`).join('')||'<tr><td colspan="5" class="subtle" style="padding:26px">Nenhuma solicitação de acesso no momento.</td></tr>';

//     $('users-list').innerHTML=users.map(u=>`<li><strong>${esc(u.name)}</strong> · ${esc(roleName[u.role])} ${userBadge(u)}<br><span class="subtle">${esc(u.email)} · ${esc(roleDesc[u.role])}</span></li>`).join('');

//     const rs=['professor','auxiliar','gestor'];

//     $('permission-matrix').innerHTML=`<table class="data-table"><thead><tr><th>Tela</th>${rs.map(r=>`<th>${esc(roleName[r])}</th>`).join('')}</tr></thead><tbody>${pages.map(p=>`<tr><td>${esc(p[1])}</td>${rs.map(r=>permission[r].includes(p[0])?'<td aria-label="Permitido">✓</td>':'<td aria-label="Sem acesso" class="subtle">—</td>').join('')}</tr>`).join('')}</tbody></table>`;

//   }

//   document.addEventListener('click',e=>{

//     const g=e.target.closest('[data-auth-go]');if(g){showAuth(g.dataset.authGo);return}

//     if(e.target.closest('#code-resend')){loginCode=newCode();codeTries=0;$('demo-code').textContent=loginCode;authMsg('Novo código enviado ao e-mail institucional.','success');return}

//     if(e.target.closest('#open-reset')){showAuth('reset');return}

//     const a=e.target.closest('[data-approve],[data-reject]');

//     if(a&&role==='auxiliar'){const email=a.dataset.approve||a.dataset.reject,u=users.find(x=>x.email===email);if(!u)return;const ok=Boolean(a.dataset.approve);u.status=ok?'Ativo':'Recusado';u.reviewed=true;render();message(ok?`Cadastro de ${u.name} aprovado. O acesso já está liberado.`:`Cadastro de ${u.name} recusado.`,ok?'success':'info')}

//   });

//   $('login-form').addEventListener('submit',e=>{e.preventDefault();busy(e.submitter||e.target.querySelector('[type=submit]'),()=>{

//     const id=$('login-id').value.trim().toLowerCase(),pass=$('login-pass').value;

//     const u=users.find(x=>x.email.toLowerCase()===id||x.email.split('@')[0].toLowerCase()===id);

//     if(!u||u.pass!==pass){authMsg('Identificação ou senha inválida. Confira os dados e tente novamente.');return}

//     if(u.status==='Pendente'){authMsg('Seu cadastro aguarda aprovação de um Auxiliar Docente. Você poderá entrar assim que for aprovado.','info');return}

//     if(u.status==='Recusado'){authMsg('Seu cadastro não foi aprovado. Procure um Auxiliar Docente da unidade.');return}

//     startCode(u)})});

//   $('code-form').addEventListener('submit',e=>{e.preventDefault();busy(e.submitter||e.target.querySelector('[type=submit]'),()=>{

//     if(!pendingUser){showAuth('login');return}

//     if($('code-input').value.trim()===loginCode){enter(pendingUser);return}

//     codeTries++;

//     if(codeTries>=5){pendingUser=null;loginCode=null;showAuth('login');authMsg('Muitas tentativas incorretas. Entre novamente para receber outro código.');return}

//     authMsg(`Código incorreto. Restam ${5-codeTries} tentativa(s).`)})});

//   $('register-form').addEventListener('submit',e=>{e.preventDefault();busy(e.submitter||e.target.querySelector('[type=submit]'),()=>{

//     const name=$('reg-name').value.trim().replace(/\s+/g,' '),email=$('reg-email').value.trim().toLowerCase(),prof=$('reg-profile').value,p1=$('reg-pass').value,p2=$('reg-pass2').value;

//     if(name.length<3||!name.includes(' ')){authMsg('Informe o nome completo.');return}

//     if(!emailOk(email)){authMsg('Use o e-mail institucional, no formato nome.sobrenome@fatec.sp.gov.br.');return}

//     if(!prof){authMsg('Selecione o perfil de acesso.');return}

//     if(users.some(u=>u.email===email)){authMsg('Já existe um cadastro com esse e-mail. Entre ou redefina a senha.');return}

//     if(!passOk(p1)){authMsg('A senha precisa ter pelo menos 8 caracteres, com letras e números.');return}

//     if(p1!==p2){authMsg('As senhas não coincidem.');return}

//     users.push({name,email,role:prof,pass:p1,status:'Pendente'});

//     $('register-form').reset();showAuth('login');authMsg('Cadastro enviado. Um Auxiliar Docente vai analisar a solicitação antes do seu primeiro acesso.','success')})});

//   $('recover-form').addEventListener('submit',e=>{e.preventDefault();busy(e.submitter||e.target.querySelector('[type=submit]'),()=>{

//     const email=$('rec-email').value.trim().toLowerCase();

//     if(!emailOk(email)){authMsg('Informe o e-mail institucional, no formato nome.sobrenome@fatec.sp.gov.br.');return}

//     resetUser=users.find(u=>u.email===email)||null;

//     $('recover-form').reset();showAuth('recover-sent');$('demo-reset').hidden=!resetUser})});

//   $('reset-form').addEventListener('submit',e=>{e.preventDefault();busy(e.submitter||e.target.querySelector('[type=submit]'),()=>{

//     const p1=$('reset-pass').value,p2=$('reset-pass2').value;

//     if(!resetUser){showAuth('recover');authMsg('O link expirou. Solicite a redefinição novamente.');return}

//     if(!passOk(p1)){authMsg('A senha precisa ter pelo menos 8 caracteres, com letras e números.');return}

//     if(p1!==p2){authMsg('As senhas não coincidem.');return}

//     resetUser.pass=p1;resetUser=null;$('reset-form').reset();showAuth('login');authMsg('Senha redefinida. Entre com a nova senha.','success')})});

//   $('maintenance-date').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);

//   renderChecks();showAuth('login');

// })();

(() => {

  // ========================================
  // 1. UTILITÁRIOS E DADOS INICIAIS
  // ========================================

  const now = () => new Date();

  const relative = hours => new Date(Date.now()-hours*3600000).toISOString();

  const fmt = value => new Date(value).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});

  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const $ = id => document.getElementById(id);

  const statuses=['Aberta','Em análise','Em andamento','Aguardando peça/material/manutenção externa','Resolvida','Encerrada'];

  let incidents=[

    {id:'OC-104',
      category:'Tecnologia',
      type:'Rede',
      room:'Laboratório 03',
      priority:'Crítica',
      status:'Aberta',
      owner:'Não atribuído',
      author:'Marina Costa',
      equipment:'SW-03',
      description:'Computadores sem acesso à rede durante a aula.',
      created:relative(3),
      timeline:[{text:'Ocorrência aberta por Marina Costa',date:relative(3)}],comments:[]},

    {id:'OC-103',
      category:'Infraestrutura',
      type:'Ar-condicionado',
      room:'Sala 204',
      priority:'Alta',
      status:'Em andamento',
      owner:'Alex Santos',
      author:'João Ribeiro',
      equipment:'AR-204',
      description:'Ar-condicionado não refrigera.',
      created:relative(25),
      timeline:[{text:'Ocorrência aberta',date:relative(25)},
        {text:'Em andamento · Alex Santos',date:relative(21)}],comments:[]},

    {id:'OC-102',category:'Tecnologia',type:'Hardware',room:'Laboratório 02',priority:'Média',status:'Aguardando peça/material/manutenção externa',owner:'Alex Santos',author:'Marina Costa',equipment:'PC-028',description:'Computador com falha na inicialização; necessita de fonte.',created:relative(78),timeline:[{text:'Ocorrência aberta',date:relative(78)},{text:'Aguardando peça/material/manutenção externa',date:relative(29)}],comments:[]},

    {id:'OC-101',category:'Infraestrutura',type:'Projetor',room:'Sala 105',priority:'Baixa',status:'Resolvida',owner:'Alex Santos',author:'João Ribeiro',equipment:'PR-105',description:'Imagem do projetor desfocada.',created:relative(146),timeline:[{text:'Ocorrência aberta',date:relative(146)},{text:'Resolvida · Alex Santos',date:relative(110)}],comments:[]}

  ];

  let carts=[{id:'Carrinho 02',teacher:'Marina Costa',course:'DSM',subject:'Programação Web',className:'DSM 2º semestre',room:'Laboratório 01',open:relative(3.5),close:null},{id:'Carrinho 01',teacher:'Marina Costa',course:'DSM',subject:'Banco de Dados',className:'DSM 3º semestre',room:'Laboratório 02',open:relative(30),close:relative(28)}];

  let equipment=[{id:'PC-028',type:'Computador',model:'Dell OptiPlex',block:'Bloco A',room:'Laboratório 02',received:'2024-02-15',status:'Em manutenção',notes:'Aguardando substituição de fonte.',moves:[{room:'Laboratório 02',date:relative(120)}]},{id:'SW-03',type:'Switch',model:'TP-Link 24 portas',block:'Bloco A',room:'Laboratório 03',received:'2023-08-10',status:'Em uso',notes:'Verificar conectividade.',moves:[{room:'Laboratório 03',date:relative(250)}]},{id:'AR-204',type:'Ar-condicionado',model:'Split 18.000 BTU',block:'Bloco B',room:'Sala 204',received:'2022-04-20',status:'Em manutenção',notes:'Avaliar refrigeração.',moves:[{room:'Sala 204',date:relative(600)}]}];

  let maintenance=[{category:'Tecnologia',room:'Laboratório 01',agent:'Alex Santos',date:relative(48),failed:0},{category:'Infraestrutura',room:'Sala 105',agent:'Alex Santos',date:relative(98),failed:0}];


  // ========================================
  // 2. NAVEGAÇÃO E PERMISSÕES
  // ========================================

  const pages=[

    ['dashboard','Visão geral','layout-dashboard','Acompanhe os atendimentos e os recursos da unidade.'],

    ['ocorrencias','Ocorrências','clipboard-list','Registre problemas e acompanhe cada atendimento.'],

    ['carrinhos','Carrinhos','laptop','Abertura e devolução rápida de notebooks.'],

    ['equipamentos','Equipamentos','monitor','Inventário e localização dos recursos.'],

    ['manutencao','Manutenção preventiva','calendar-check','Planeje e registre vistorias.'],

    ['relatorios','Relatórios','chart-no-axes-column','Indicadores demonstrativos por período.'],

    ['historico','Meu histórico','history','Seus carrinhos e suas ocorrências.'],

    ['configuracoes','Usuários e configurações','settings','Perfis, permissões e parâmetros.'],

    ['aprovacoes','Aprovação de cadastros','user-check','Analise as solicitações de acesso ao sistema.'],

    ['alertas','Alertas','bell','Acompanhe situações que exigem atenção.'],

    ['perfil','Meu perfil','user-round','Dados demonstrativos da sessão.']

  ];

  let role=null, user=null, current='dashboard', lastFocus=null;

  const permission={professor:['dashboard','ocorrencias','carrinhos','historico','alertas','perfil'],auxiliar:['dashboard','ocorrencias','carrinhos','equipamentos','manutencao','relatorios','aprovacoes','alertas','perfil'],gestor:['dashboard','ocorrencias','carrinhos','equipamentos','manutencao','relatorios','configuracoes','alertas','perfil']};


  // ========================================
  // 3. FUNÇÕES GERAIS E RENDERIZAÇÃO
  // ========================================

  function message(text,type='success'){ $('flash').innerHTML=`<div class="notice ${type}">${esc(text)}</div>`; clearTimeout(message.timer);message.timer=setTimeout(()=>$('flash').replaceChildren(),6500) }

  function busy(button,fn){button.disabled=true;const label=button.textContent;button.textContent='Processando…';setTimeout(()=>{try{fn()}catch(e){message('Não foi possível concluir esta ação. Confira os campos e tente novamente.','error')}finally{button.disabled=false;button.textContent=label}},260)}

  function badge(text){const kind=text==='Crítica'||text==='Aberta'?'danger':text==='Alta'||text.startsWith('Aguardando')?'warn':text==='Resolvida'||text==='Encerrada'?'neutral':'';return `<span class="badge ${kind}">${text==='Crítica'?'⚠':text==='Resolvida'||text==='Encerrada'?'✓':'●'} ${esc(text)}</span>`}

  function allowed(){return permission[role]}

  function nav(){ $('nav').innerHTML=pages.filter(p=>allowed().includes(p[0])).map(p=>`<button type="button" class="navbtn ${p[0]===current?'active':''}" data-page="${p[0]}" ${p[0]===current?'aria-current="page"':''}><i data-lucide="${p[2]}"></i><span>${p[1]}</span></button>`).join('');lucide.createIcons()}

  function go(page){if(!allowed().includes(page))page='dashboard';current=page;pages.forEach(p=> $('view-'+p[0]).hidden=p[0]!==page);const data=pages.find(p=>p[0]===page);$('view-title').textContent=data[1];$('header-area').textContent=data[1];$('view-subtitle').textContent=data[3];$('sidebar').classList.remove('open');$('menu-btn').setAttribute('aria-expanded','false');$('flash').replaceChildren();nav();render();window.scrollTo({top:0,behavior:'smooth'})}

  function periodOk(item,period){const age=Date.now()-new Date(item.created||item.date).getTime();return period==='all'||age<(period==='week'?7:period==='month'?31:366)*86400000}

  function active(i){return !['Resolvida','Encerrada'].includes(i.status)}

  function alerts(){return [...carts.filter(c=>!c.close&&(Date.now()-new Date(c.open))>7200000).map(c=>({title:'Carrinho aberto além do previsto',body:`${c.id} · ${c.teacher} · desde ${fmt(c.open)}`,page:'carrinhos'})),...incidents.filter(i=>i.priority==='Crítica'&&i.status==='Aberta').map(i=>({title:'Ocorrência crítica sem atendimento',body:`${i.id} · ${i.type} · ${i.room}`,page:'ocorrencias'})),...(role==='auxiliar'?users.filter(u=>u.status==='Pendente').map(u=>({title:'Cadastro aguardando aprovação',body:`${u.name} · ${roleName[u.role]} · ${u.email}`,page:'aprovacoes'})):[])]}

  function tableEmpty(cols){return `<tr><td colspan="${cols}" class="subtle" style="padding:26px">Nenhum registro encontrado para os filtros selecionados.</td></tr>`}

  function incidentRow(i,short=false){return `<tr><td><strong>${esc(i.id)}</strong></td>${short?'':`<td>${fmt(i.created)}</td>`}<td>${esc(i.room)}</td><td>${esc(i.type)}</td>${short?'':`<td>${esc(i.category)}</td>`}<td>${badge(i.priority)}</td><td>${badge(i.status)}</td>${short?`<td>${esc(i.owner)}</td>`:''}<td><button type="button" class="btn small" data-incident="${esc(i.id)}">Detalhes</button></td></tr>`}

  function render(){

    $('alert-count').textContent=alerts().length;

    const summary=[['Abertas',incidents.filter(i=>i.status==='Aberta').length],['Críticas',incidents.filter(i=>i.priority==='Crítica'&&active(i)).length],['Em andamento',incidents.filter(i=>i.status==='Em andamento').length],['Resolvidas',incidents.filter(i=>i.status==='Resolvida'||i.status==='Encerrada').length],['Carrinhos em uso',carts.filter(c=>!c.close).length]];

    $('stats').innerHTML=summary.map(([title,n])=>`<div class="card stat"><span>${title}</span><strong>${n}</strong></div>`).join('');

    const max=Math.max(1,...['Crítica','Alta','Média','Baixa'].map(p=>incidents.filter(i=>i.priority===p).length));

    $('priority-chart').innerHTML=['Crítica','Alta','Média','Baixa'].map(p=>{let n=incidents.filter(i=>i.priority===p).length;return `<div class="bar-row"><div><strong>${esc(p)}</strong><span>${n} ocorrência${n===1?'':'s'}</span></div><div class="progress-track"><div class="progress-fill" style="width:${n/max*100}%"></div></div></div>`}).join('');

    $('dashboard-alerts').textContent=alerts().length?`${alerts().length} alerta(s) aguardando atenção. Acesse a Central de alertas.`:'Nenhum alerta ativo neste momento.';

    const dash=incidents.filter(i=>active(i)&&periodOk(i,$('dashboard-period').value)&&($('dashboard-category').value==='all'||i.category===$('dashboard-category').value));

    $('dashboard-rows').innerHTML=dash.map(i=>incidentRow(i,true)).join('')||tableEmpty(7);

    const search=$('incident-search').value.toLocaleLowerCase('pt-BR');

    const list=incidents.filter(i=>`${i.id} ${i.room} ${i.type} ${i.description}`.toLocaleLowerCase('pt-BR').includes(search)&&[$('incident-category').value==='all'||i.category===$('incident-category').value,$('incident-status').value==='all'||i.status===$('incident-status').value,$('incident-priority').value==='all'||i.priority===$('incident-priority').value].every(Boolean));

    $('incident-rows').innerHTML=list.map(i=>incidentRow(i)).join('')||tableEmpty(8);$('incident-total').textContent=`${list.length} registro(s)`;

    $('cart-rows').innerHTML=carts.map(c=>`<tr><td>${esc(c.id)}</td><td>${esc(c.teacher)}</td><td>${esc(c.subject)} · ${esc(c.className)}</td><td>${esc(c.room)}</td><td>${fmt(c.open)}</td><td>${c.close?fmt(c.close):'—'}</td><td>${badge(c.close?'Encerrada':'Em andamento')}</td></tr>`).join('')||tableEmpty(7);

    const previous=$('return-cart').value;$('return-cart').innerHTML='<option value="">Selecione</option>'+carts.filter(c=>!c.close).map(c=>`<option value="${esc(c.id)}">${esc(c.id)} · ${esc(c.teacher)}</option>`).join('');$('return-cart').value=previous;

    $('equipment-rows').innerHTML=equipment.map(e=>`<tr><td><strong>${esc(e.id)}</strong></td><td>${esc(e.type)}</td><td>${esc(e.model)}</td><td>${esc(e.block)} · ${esc(e.room)}</td><td>${new Date(e.received+'T12:00:00').toLocaleDateString('pt-BR')}</td><td>${badge(e.status)}</td><td><button type="button" class="btn small" data-equipment="${esc(e.id)}">Detalhes</button></td></tr>`).join('')||tableEmpty(7);

    $('maintenance-schedule').innerHTML=['Tecnologia','Infraestrutura'].map(category=>`<div class="card pad"><h3>${category}</h3>${maintenance.filter(m=>m.category===category).slice(0,3).map(m=>`<p class="subtle">${fmt(m.date)} · ${esc(m.room)}<br>${esc(m.agent)} · ${m.failed?'Item reprovado':'Itens aprovados'}</p>`).join('')||'<p class="subtle">Nenhuma vistoria registrada.</p>'}</div>`).join('');

    const period=$('report-period').value,subset=incidents.filter(i=>periodOk(i,period)),counts=arr=>Object.entries(arr.reduce((acc,x)=>(acc[x]=(acc[x]||0)+1,acc),{})).sort((a,b)=>b[1]-a[1]);

    const report=[['Ocorrências',subset.length],['Manutenções',maintenance.filter(m=>periodOk(m,period)).length],['Manutenção externa',subset.filter(i=>i.status.startsWith('Aguardando')).length],['Exigem recursos',subset.filter(i=>i.status.startsWith('Aguardando')).length],['Salas afetadas',new Set(subset.map(i=>i.room)).size]];

    $('report-stats').innerHTML=report.map(([t,n])=>`<div class="card stat"><span>${t}</span><strong>${n}</strong></div>`).join('');

    $('report-problems').innerHTML=counts(subset.map(i=>i.type)).map(([x,n])=>`<li>${esc(x)} <strong style="float:right">${n}</strong></li>`).join('')||'<li class="subtle">Nenhum dado no período.</li>';

    $('report-rooms').innerHTML=counts(subset.map(i=>i.room)).map(([x,n])=>`<li>${esc(x)} <strong style="float:right">${n}</strong></li>`).join('')||'<li class="subtle">Nenhum dado no período.</li>';

    $('report-resources').innerHTML=subset.filter(i=>i.status.startsWith('Aguardando')).map(i=>`<tr><td>${esc(i.id)}</td><td>${esc(i.room)}</td><td>${esc(i.type)} · ${esc(i.equipment)}</td><td>${badge(i.status)}</td></tr>`).join('')||tableEmpty(4);

    $('history-carts').innerHTML=carts.filter(c=>user&&c.teacher===user.name).map(c=>`<tr><td>${esc(c.id)}</td><td>${fmt(c.open)}</td><td>${esc(c.className)}</td><td>${esc(c.subject)}</td><td>${esc(c.room)}</td></tr>`).join('')||tableEmpty(5);

    $('history-incidents').innerHTML=incidents.filter(i=>user&&i.author===user.name).map(i=>`<tr><td>${esc(i.id)}</td><td>${fmt(i.created)}</td><td>${esc(i.type)}</td><td>${esc(i.room)}</td><td>${badge(i.status)}</td></tr>`).join('')||tableEmpty(5);

    $('alerts-list').innerHTML=alerts().map(a=>`<div class="card pad"><strong>⚠ ${esc(a.title)}</strong><p class="subtle">${esc(a.body)}</p><button type="button" class="btn small" data-goto="${a.page}">Ver área</button></div>`).join('')||'<div class="card pad">✓ Nenhum alerta ativo. Os registros estão dentro do esperado.</div>';

    renderAccess();

  }
    // ========================================
  // 4. MODAIS E FORMULÁRIOS DA APLICAÇÃO
  // ========================================

  function modal(title,html){lastFocus=document.activeElement;$('modal-title').textContent=title;$('modal-body').innerHTML=html;$('modal-layer').classList.remove('hidden');$('modal-close').focus()}

  function closeModal(){$('modal-layer').classList.add('hidden');$('modal-body').replaceChildren();lastFocus?.focus()}

  function newIncident(){modal('Abrir ocorrência',`<form id="create-incident" class="stack"><div class="form-grid"><div class="field"><label for="new-category">Categoria</label><select id="new-category"><option>Tecnologia</option><option>Infraestrutura</option></select></div><div class="field"><label for="new-type">Tipo de problema</label><select id="new-type"><option>Hardware</option><option>Rede</option><option>Software</option><option>Armazenamento</option><option>Televisão</option><option>Ar-condicionado</option><option>Projetor</option><option>Outro</option></select></div><div class="field"><label for="new-room">Local / sala</label><input id="new-room" required placeholder="Ex.: Laboratório 03"></div><div class="field"><label for="new-priority">Prioridade</label><select id="new-priority"><option>Média</option><option>Baixa</option><option>Alta</option><option>Crítica</option></select></div><div class="field full"><label for="new-equipment-ref">Equipamento(s) relacionado(s)</label><input id="new-equipment-ref" placeholder="Patrimônio ou identificação, se houver"></div><div class="field full"><label for="new-description">Descrição do problema</label><textarea id="new-description" required minlength="10" placeholder="O que aconteceu?"></textarea></div></div><button class="btn primary" type="submit">Registrar ocorrência</button></form>`)}

  function createIncident(values){const id='OC-'+(Math.max(104,...incidents.map(i=>Number(i.id.split('-')[1])||0))+1),date=now().toISOString();incidents.unshift({id,category:values.category,type:values.type,room:values.room,priority:values.priority,status:'Aberta',owner:'Não atribuído',author:values.author||user.name,equipment:values.equipment||'Não informado',description:values.description,created:date,timeline:[{text:'Ocorrência aberta',date}],comments:[]});return id}

  function incidentDetail(id){const i=incidents.find(x=>x.id===id);if(!i)return;modal(`${i.id} · ${i.type}`,`<div class="row">${badge(i.priority)} ${badge(i.status)} <span class="subtle">${esc(i.category)} · ${esc(i.room)}</span></div><p>${esc(i.description)}</p><p class="subtle"><strong>Equipamento:</strong> ${esc(i.equipment)} · <strong>Aberta por:</strong> ${esc(i.author)} · <strong>Responsável:</strong> ${esc(i.owner)}</p><div class="divider"></div><h3>Linha do tempo</h3><div class="timeline">${i.timeline.map(t=>`<div class="timeline-item"><strong>${esc(t.text)}</strong><small>${fmt(t.date)}</small></div>`).join('')}${i.comments.map(c=>`<div class="timeline-item"><strong>Comentário · ${esc(c.author)}</strong><p>${esc(c.text)}</p><small>${fmt(c.date)}</small></div>`).join('')}</div>${role!=='professor'?`<form id="status-form" class="stack"><div class="field"><label for="detail-status">Atualizar status</label><select id="detail-status">${statuses.map(s=>`<option ${s===i.status?'selected':''}>${s}</option>`).join('')}</select></div><div class="field"><label for="detail-owner">Responsável pelo atendimento</label><input id="detail-owner" required value="${esc(i.owner==='Não atribuído'?'Alex Santos':i.owner)}"></div><button type="submit" class="btn primary">Salvar andamento</button></form><div class="divider"></div>`:''}<form id="comment-form" class="stack"><div class="field"><label for="detail-comment">Adicionar comentário</label><textarea id="detail-comment" required placeholder="Escreva uma atualização para a equipe"></textarea></div><button type="submit" class="btn">Adicionar comentário</button></form>`);$('modal-body').dataset.incident=id}

  function equipmentDetail(id){const e=equipment.find(x=>x.id===id);if(!e)return;modal(`${e.id} · ${e.type}`,`<p><strong>Modelo:</strong> ${esc(e.model)}<br><strong>Localização atual:</strong> ${esc(e.block)} · ${esc(e.room)}<br><strong>Status:</strong> ${esc(e.status)}<br><strong>Observações:</strong> ${esc(e.notes||'Nenhuma')}</p><h3>Movimentações</h3><div class="timeline">${e.moves.map(m=>`<div class="timeline-item">${esc(m.room)}<small>${fmt(m.date)}</small></div>`).join('')}</div><h3>Ocorrências vinculadas</h3><ul class="mini-list">${incidents.filter(i=>i.equipment.includes(e.id)).map(i=>`<li>${esc(i.id)} · ${esc(i.type)} · ${esc(i.status)}</li>`).join('')||'<li class="subtle">Nenhuma ocorrência vinculada.</li>'}</ul>${role!=='professor'?`<div class="divider"></div><form id="move-equipment" class="stack"><div class="field"><label for="move-room">Mover para sala</label><input id="move-room" required placeholder="Nova sala"></div><button type="submit" class="btn primary">Registrar movimentação</button></form>`:''}`);$('modal-body').dataset.equipment=id}

  function newEquipment(){modal('Cadastrar equipamento',`<form id="create-equipment" class="stack"><div class="form-grid"><div class="field"><label for="eq-id">Patrimônio / ID</label><input id="eq-id" required></div><div class="field"><label for="eq-type">Tipo</label><input id="eq-type" required placeholder="Ex.: Computador"></div><div class="field"><label for="eq-model">Modelo</label><input id="eq-model" required></div><div class="field"><label for="eq-block">Bloco</label><input id="eq-block" required></div><div class="field"><label for="eq-room">Sala</label><input id="eq-room" required></div><div class="field"><label for="eq-date">Data de recebimento</label><input id="eq-date" type="date" required></div><div class="field"><label for="eq-status">Status</label><select id="eq-status"><option>Em uso</option><option>Em manutenção</option><option>Disponível</option></select></div><div class="field full"><label for="eq-notes">Observações</label><textarea id="eq-notes"></textarea></div></div><button type="submit" class="btn primary">Cadastrar nesta sessão</button></form>`)}

  const checks={Tecnologia:['Computadores e monitores','Cabos e conexões','Periféricos'],Infraestrutura:['Ar-condicionado e ventilação','TV e projetor','Cadeiras, tomadas e iluminação']};

  function renderChecks(){const category=$('maintenance-category').value;$('maintenance-items').innerHTML=checks[category].map((item,n)=>`<label class="checkrow" for="check-${n}"><input type="checkbox" id="check-${n}" checked><span>${esc(item)} — aprovado</span></label>`).join('')}


  // ========================================
  // 5. EVENTOS E AÇÕES DA APLICAÇÃO
  // ========================================

  document.addEventListener('click',e=>{

    const page=e.target.closest('[data-page],[data-goto]');if(page){go(page.dataset.page||page.dataset.goto);if(page.dataset.action==='new-incident')newIncident();return}

    const incident=e.target.closest('[data-incident]');if(incident){incidentDetail(incident.dataset.incident);return}

    const eq=e.target.closest('[data-equipment]');if(eq){equipmentDetail(eq.dataset.equipment);return}

    if(e.target.closest('#new-incident'))newIncident();

    if(e.target.closest('#new-equipment'))newEquipment();

    if(e.target.closest('#modal-close'))closeModal();

    if(e.target===$('modal-layer'))closeModal();

    if(e.target.closest('#alert-shortcut'))go('alertas');

    if(e.target.closest('.export-demo'))message('Exportação indisponível neste protótipo estático. Consulte os dados na tela.','info');

    if(e.target.closest('#recovery-demo'))logout('recover');

  });

  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('modal-layer').classList.contains('hidden'))closeModal()});

  $('menu-btn').addEventListener('click',()=>{const open=$('sidebar').classList.toggle('open');$('menu-btn').setAttribute('aria-expanded',String(open))});

  $('logout-btn').addEventListener('click',()=>logout('login'));

  ['incident-search','incident-category','incident-status','incident-priority','dashboard-period','dashboard-category','report-period'].forEach(id=>$(id).addEventListener(id==='incident-search'?'input':'change',render));

  $('return-issue').addEventListener('change',()=>{const yes=$('return-issue').value==='Sim';$('return-extra').classList.toggle('hidden',!yes);['return-type','return-description'].forEach(id=>$(id).required=yes)});

  $('maintenance-category').addEventListener('change',renderChecks);

  document.addEventListener('submit',e=>{

    e.preventDefault();const form=e.target,btn=e.submitter;if(!btn)return;

    if(form.id==='create-incident')busy(btn,()=>{const id=createIncident({category:$('new-category').value,type:$('new-type').value,room:$('new-room').value.trim(),priority:$('new-priority').value,equipment:$('new-equipment-ref').value.trim(),description:$('new-description').value.trim()});closeModal();render();message(`${id} aberta nesta sessão de demonstração.`)});

    if(form.id==='status-form')busy(btn,()=>{const i=incidents.find(x=>x.id===$('modal-body').dataset.incident);i.status=$('detail-status').value;i.owner=$('detail-owner').value.trim();i.timeline.push({text:`${i.status} · ${i.owner}`,date:now().toISOString()});incidentDetail(i.id);render();message('Andamento atualizado nesta sessão.')});

    if(form.id==='comment-form')busy(btn,()=>{const i=incidents.find(x=>x.id===$('modal-body').dataset.incident);i.comments.push({author:user.name,text:$('detail-comment').value.trim(),date:now().toISOString()});incidentDetail(i.id);message('Comentário adicionado nesta sessão.')});

    if(form.id==='cart-open-form')busy(btn,()=>{const id=$('cart-id').value;if(carts.some(c=>c.id===id&&!c.close)){message('Esse carrinho já está aberto. Selecione outro.','error');return}carts.unshift({id,teacher:$('cart-teacher').value.trim(),course:$('cart-course').value.trim(),subject:$('cart-subject').value.trim(),className:$('cart-class').value.trim(),room:$('cart-room').value.trim(),open:now().toISOString(),close:null});form.reset();$('cart-teacher').value=user.name;$('cart-course').value='Desenvolvimento de Software Multiplataforma';render();message(`${id} aberto às ${fmt(now())}.`)});

    if(form.id==='cart-return-form')busy(btn,()=>{const c=carts.find(x=>x.id===$('return-cart').value&&!x.close);if(!c){message('Selecione um carrinho em uso.','error');return}if($('return-issue').value==='Não'&&($('return-count').value!=='20'||$('return-condition').value!=='Todos conferidos e em ordem')){message('Há divergência na conferência. Selecione “Sim” e descreva a ocorrência.','error');return}if($('return-issue').value==='Sim'){const id=createIncident({category:$('return-category').value,type:$('return-type').value.trim(),room:c.room,priority:'Média',equipment:$('return-equipment').value.trim()||c.id,description:$('return-description').value.trim(),author:c.teacher});message(`Devolução registrada e ocorrência ${id} aberta nesta sessão.`)}else message(`Devolução de ${c.id} registrada às ${fmt(now())}.`);c.close=now().toISOString();form.reset();$('return-extra').classList.add('hidden');render()});

    if(form.id==='create-equipment')busy(btn,()=>{const id=$('eq-id').value.trim();if(equipment.some(x=>x.id.toLowerCase()===id.toLowerCase())){message('Esse patrimônio já está cadastrado.','error');return}equipment.unshift({id,type:$('eq-type').value.trim(),model:$('eq-model').value.trim(),block:$('eq-block').value.trim(),room:$('eq-room').value.trim(),received:$('eq-date').value,status:$('eq-status').value,notes:$('eq-notes').value.trim(),moves:[{room:$('eq-room').value.trim(),date:now().toISOString()}]});closeModal();render();message('Equipamento cadastrado nesta sessão.')});

    if(form.id==='move-equipment')busy(btn,()=>{const eq=equipment.find(x=>x.id===$('modal-body').dataset.equipment);eq.room=$('move-room').value.trim();eq.moves.push({room:eq.room,date:now().toISOString()});equipmentDetail(eq.id);render();message('Movimentação registrada nesta sessão.')});

    if(form.id==='maintenance-form')busy(btn,()=>{const category=$('maintenance-category').value,failed=[...$('maintenance-items').querySelectorAll('input:not(:checked)')].map(input=>checks[category][Number(input.id.split('-')[1])]);maintenance.unshift({category,room:$('maintenance-room').value.trim(),agent:$('maintenance-agent').value.trim(),date:new Date($('maintenance-date').value).toISOString(),failed:failed.length});const ids=failed.map(item=>createIncident({category,type:item,room:$('maintenance-room').value.trim(),priority:'Média',equipment:'Vistoria preventiva',description:`Item reprovado na vistoria: ${item}. ${$('maintenance-notes').value.trim()}`.trim(),author:$('maintenance-agent').value.trim()}));render();message(ids.length?`Checklist concluído. Ocorrência(s) ${ids.join(', ')} criada(s) automaticamente.`:'Checklist concluído sem reprovações.');$('maintenance-room').value='';$('maintenance-notes').value='';renderChecks()});

    if(form.id==='settings-form')busy(btn,()=>message('Alterações aplicadas apenas nesta sessão de demonstração.','info'));

    if(form.id==='personal-form')busy(btn,()=>{const n=$('personal-name').value.trim();if(n&&n!==user.name){const old=user.name;user.name=n;incidents.forEach(i=>{if(i.author===old)i.author=n});carts.forEach(c=>{if(c.teacher===old)c.teacher=n});$('user-chip').textContent=`${n} · ${roleName[role]}`}message('Alterações aplicadas apenas nesta sessão de demonstração.','info')});

  });


  // ========================================
  // 6. AUTENTICAÇÃO E USUÁRIOS
  // ========================================

  const roleName={professor:'Professor',auxiliar:'Auxiliar Docente',gestor:'Gestor / Coordenação'};

  const roleDesc={professor:'Abertura de ocorrência, carrinhos e histórico pessoal',auxiliar:'Atendimento, equipamentos, manutenção preventiva e aprovação de cadastros',gestor:'Visão gerencial, relatórios e parâmetros'};

  let users=[

    {name:'Marina Costa',email:'marina.costa@fatec.sp.gov.br',role:'professor',pass:'Fatec@2026',status:'Ativo'},

    {name:'Alex Santos',email:'alex.santos@fatec.sp.gov.br',role:'auxiliar',pass:'Fatec@2026',status:'Ativo'},

    {name:'Patrícia Lima',email:'patricia.lima@fatec.sp.gov.br',role:'gestor',pass:'Fatec@2026',status:'Ativo'},

    {name:'Carlos Mendes',email:'carlos.mendes@fatec.sp.gov.br',role:'professor',pass:'Fatec@2026',status:'Pendente'}

  ];

  let pendingUser=null,loginCode=null,codeTries=0,resetUser=null;

  const emailOk = v => /^[^\s@]+@fatec\.sp\.gov\.br$/i.test(v);

  const passOk=v=>v.length>=8&&/[A-Za-z]/.test(v)&&/\d/.test(v);

  const newCode=()=>String(crypto.getRandomValues(new Uint32Array(1))[0]%900000+100000);

  const maskEmail=e=>{const [a,b]=e.split('@');return a.slice(0,2)+'•••@'+b};

  const userBadge=u=>u.status==='Ativo'?'<span class="badge">● Ativo</span>':u.status==='Pendente'?'<span class="badge warn">● Aguardando aprovação</span>':'<span class="badge danger">● Recusado</span>';

  function authMsg(text,type='error'){$('auth-flash').innerHTML=`<div class="notice ${type}">${esc(text)}</div>`}

  function showAuth(view){document.body.classList.remove('authed');document.querySelectorAll('[data-auth]').forEach(el=>{el.hidden=el.dataset.auth!==view});$('auth-flash').replaceChildren();window.scrollTo(0,0);const first=document.querySelector(`[data-auth="${view}"] input`);if(first)setTimeout(()=>first.focus(),30)}

    // ========================================
  // 7. ENTRADA E SAÍDA DO SISTEMA
  // ========================================

  function logout(view) {
    closeModal();

    user = null;
    role = null;
    current = 'dashboard';

    document.body.classList.remove('gestor-theme');

    showAuth(view);

    if (view === 'login') {
        authMsg('Você saiu do sistema.', 'info');
    }
  }


  function enter(u) {
    user = u;
    role = u.role;
    pendingUser = null;
    loginCode = null;

    document.body.classList.add('authed');

    // Ativa o tema vermelho e cinza somente para o gestor
    document.body.classList.toggle('gestor-theme', u.role === 'gestor');

    $('user-chip').textContent = `${u.name} · ${roleName[u.role]}`;
    $('personal-name').value = u.name;
    $('personal-email').value = u.email;
    $('cart-teacher').value = u.name;

    if (u.role === 'auxiliar') {
        $('maintenance-agent').value = u.name;
    }

    ['login-form', 'code-form'].forEach(id => $(id).reset());

    go('dashboard');

    message(
        `Bem-vindo(a), ${u.name.split(' ')[0]}. Você entrou como ${roleName[u.role]}.`,
        'info'
    );
  }


  function startCode(u){pendingUser=u;loginCode=newCode();codeTries=0;$('code-target').textContent=maskEmail(u.email);$('demo-code').textContent=loginCode;showAuth('code')}


  // ========================================
  // 8. APROVAÇÃO DE CADASTROS E ACESSOS
  // ========================================

  function renderAccess(){

    const rank={Pendente:0,Ativo:1,Recusado:1};

    const rows=users.filter(u=>u.status==='Pendente'||u.reviewed);

    $('approval-total').textContent=`${users.filter(u=>u.status==='Pendente').length} aguardando`;

    $('approval-rows').innerHTML=rows.sort((a,b)=>rank[a.status]-rank[b.status]).map(u=>`<tr><td><strong>${esc(u.name)}</strong></td><td>${esc(u.email)}</td><td>${esc(roleName[u.role])}</td><td>${userBadge(u)}</td><td>${u.status==='Pendente'?`<button type="button" class="btn small primary" data-approve="${esc(u.email)}">Aprovar</button> <button type="button" class="btn small" data-reject="${esc(u.email)}">Recusar</button>`:'—'}</td></tr>`).join('')||'<tr><td colspan="5" class="subtle" style="padding:26px">Nenhuma solicitação de acesso no momento.</td></tr>';

    $('users-list').innerHTML=users.map(u=>`<li><strong>${esc(u.name)}</strong> · ${esc(roleName[u.role])} ${userBadge(u)}<br><span class="subtle">${esc(u.email)} · ${esc(roleDesc[u.role])}</span></li>`).join('');

    const rs=['professor','auxiliar','gestor'];

    $('permission-matrix').innerHTML=`<table class="data-table"><thead><tr><th>Tela</th>${rs.map(r=>`<th>${esc(roleName[r])}</th>`).join('')}</tr></thead><tbody>${pages.map(p=>`<tr><td>${esc(p[1])}</td>${rs.map(r=>permission[r].includes(p[0])?'<td aria-label="Permitido">✓</td>':'<td aria-label="Sem acesso" class="subtle">—</td>').join('')}</tr>`).join('')}</tbody></table>`;

  }


  document.addEventListener('click',e=>{

    const g=e.target.closest('[data-auth-go]');if(g){showAuth(g.dataset.authGo);return}

    if(e.target.closest('#code-resend')){loginCode=newCode();codeTries=0;$('demo-code').textContent=loginCode;authMsg('Novo código enviado ao e-mail institucional.','success');return}

    if(e.target.closest('#open-reset')){showAuth('reset');return}

    const a=e.target.closest('[data-approve],[data-reject]');

    if(a&&role==='auxiliar'){const email=a.dataset.approve||a.dataset.reject,u=users.find(x=>x.email===email);if(!u)return;const ok=Boolean(a.dataset.approve);u.status=ok?'Ativo':'Recusado';u.reviewed=true;render();message(ok?`Cadastro de ${u.name} aprovado. O acesso já está liberado.`:`Cadastro de ${u.name} recusado.`,ok?'success':'info')}

  });


  // ========================================
  // 9. EVENTOS DOS FORMULÁRIOS DE AUTENTICAÇÃO
  // ========================================

  $('login-form').addEventListener('submit',e=>{e.preventDefault();busy(e.submitter||e.target.querySelector('[type=submit]'),()=>{

    const id=$('login-id').value.trim().toLowerCase(),pass=$('login-pass').value;

    const u=users.find(x=>x.email.toLowerCase()===id||x.email.split('@')[0].toLowerCase()===id);

    if(!u||u.pass!==pass){authMsg('Identificação ou senha inválida. Confira os dados e tente novamente.');return}

    if(u.status==='Pendente'){authMsg('Seu cadastro aguarda aprovação de um Auxiliar Docente. Você poderá entrar assim que for aprovado.','info');return}

    if(u.status==='Recusado'){authMsg('Seu cadastro não foi aprovado. Procure um Auxiliar Docente da unidade.');return}

    startCode(u)})});


  $('code-form').addEventListener('submit',e=>{e.preventDefault();busy(e.submitter||e.target.querySelector('[type=submit]'),()=>{

    if(!pendingUser){showAuth('login');return}

    if($('code-input').value.trim()===loginCode){enter(pendingUser);return}

    codeTries++;

    if(codeTries>=5){pendingUser=null;loginCode=null;showAuth('login');authMsg('Muitas tentativas incorretas. Entre novamente para receber outro código.');return}

    authMsg(`Código incorreto. Restam ${5-codeTries} tentativa(s).`)})});


  $('register-form').addEventListener('submit',e=>{e.preventDefault();busy(e.submitter||e.target.querySelector('[type=submit]'),()=>{

    const name=$('reg-name').value.trim().replace(/\s+/g,' '),email=$('reg-email').value.trim().toLowerCase(),prof=$('reg-profile').value,p1=$('reg-pass').value,p2=$('reg-pass2').value;

    if(name.length<3||!name.includes(' ')){authMsg('Informe o nome completo.');return}

    if(!emailOk(email)){authMsg('Use o e-mail institucional, no formato nome.sobrenome@fatec.sp.gov.br.');return}

    if(!prof){authMsg('Selecione o perfil de acesso.');return}

    if(users.some(u=>u.email===email)){authMsg('Já existe um cadastro com esse e-mail. Entre ou redefina a senha.');return}

    if(!passOk(p1)){authMsg('A senha precisa ter pelo menos 8 caracteres, com letras e números.');return}

    if(p1!==p2){authMsg('As senhas não coincidem.');return}

    users.push({name,email,role:prof,pass:p1,status:'Pendente'});

    $('register-form').reset();showAuth('login');authMsg('Cadastro enviado. Um Auxiliar Docente vai analisar a solicitação antes do seu primeiro acesso.','success')})});


  $('recover-form').addEventListener('submit',e=>{e.preventDefault();busy(e.submitter||e.target.querySelector('[type=submit]'),()=>{

    const email=$('rec-email').value.trim().toLowerCase();

    if(!emailOk(email)){authMsg('Informe o e-mail institucional, no formato nome.sobrenome@fatec.sp.gov.br.');return}

    resetUser=users.find(u=>u.email===email)||null;

    $('recover-form').reset();showAuth('recover-sent');$('demo-reset').hidden=!resetUser})});


  $('reset-form').addEventListener('submit',e=>{e.preventDefault();busy(e.submitter||e.target.querySelector('[type=submit]'),()=>{

    const p1=$('reset-pass').value,p2=$('reset-pass2').value;

    if(!resetUser){showAuth('recover');authMsg('O link expirou. Solicite a redefinição novamente.');return}

    if(!passOk(p1)){authMsg('A senha precisa ter pelo menos 8 caracteres, com letras e números.');return}

    if(p1!==p2){authMsg('As senhas não coincidem.');return}

    resetUser.pass=p1;resetUser=null;$('reset-form').reset();showAuth('login');authMsg('Senha redefinida. Entre com a nova senha.','success')})});


  // ========================================
  // 10. INICIALIZAÇÃO DO SISTEMA
  // ========================================

  $('maintenance-date').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);

  renderChecks();
  showAuth('login');

})();