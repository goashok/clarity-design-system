import { registerClarityElements } from '../src/components.js';
import { icon } from '../src/index.js';
import { escapeHTML as esc } from '../src/component-utils.js';
registerClarityElements();
export const demoData = {
  chat:{
    thread:{label:'Conversation',assistantName:'Assistant',empty:{title:'What are we working on?',description:'Ask about the documents in context. Replies here are simulated.',prompts:['Draft a status update for the team','Find risks in the publication plan','Compare the brief with the review notes','Summarize the key changes']}},
    input:{placeholder:'Ask about your documents…',attachments:true,maxFileSize:10485760},
    docs:{brief:{id:'brief',label:'Project brief',meta:'PDF · 4 pages'},notes:{id:'notes',label:'Review notes',meta:'Doc · edited today'},checklist:{id:'checklist',label:'Onboarding checklist',meta:'Sheet · 12 rows'}},
    sources:[{title:'Project brief',excerpt:'Target publication: Friday. Review follows the final draft.'},{title:'Review notes',excerpt:'Source checks will continue into next week, before review begins.'}],
    followUps:['Make it shorter','Add a risks section','Who approved the change?'],
    conversations:[
      {id:'plan',title:'Publication plan',time:'Today',context:['brief','notes'],messages:[
        {id:'m1',role:'user',content:'Is the publication plan still on track?',time:'9:41',editable:true},
        {id:'m2',role:'assistant',state:'complete',time:'9:41',
          steps:[{label:'Read Project brief',state:'complete',detail:'4 pages'},{label:'Read Review notes',state:'complete',detail:'Edited today'},{label:'Compared dates and owners',state:'complete'}],
          content:'Mostly, but the two documents disagree on timing.\n\n- The brief targets **Friday** for publication [1].\n- The review notes say source checks continue **into next week** [2].\n\nMoving publication to Wednesday keeps review after source checks, without changing owners.',
          sources:'default',
          action:{id:'reschedule',title:'Move publication to Wednesday',detail:'Updates the plan date and notifies 3 reviewers.',consequence:'Simulated. Nothing in your workspace changes.',state:'pending',approveLabel:'Move date',declineLabel:'Keep Friday'}}
      ]},
      {id:'research',title:'Q3 research summary',time:'Yesterday',context:['notes'],messages:[
        {id:'r1',role:'user',content:'Give me the three biggest themes from the Q3 interviews.',time:'Yesterday',editable:true},
        {id:'r2',role:'assistant',state:'complete',time:'Yesterday',content:'Three themes came up repeatedly:\n\n1. **Setup takes too long.** Most teams wanted a template to start from.\n2. **Reviews are hard to track.** People lose sight of who approved what.\n3. **Search misses older work.** Archived projects rarely appear in results.'}
      ]},
      {id:'onboarding',title:'Onboarding checklist',time:'Mon',context:['checklist'],messages:[
        {id:'o1',role:'user',content:'Which onboarding steps are still open?',time:'Mon',editable:true},
        {id:'o2',role:'assistant',state:'failed',time:'Mon',error:'The checklist could not be read. It may have moved or you may not have access.'}
      ]}
    ]
  },

  projects:{rows:Array.from({length:13},(_,i)=>({id:`project-${i+1}`,name:['Design foundations','Research workspace','Source review','Publication draft','Team onboarding','Evidence library','Portfolio overview'][i%7]+(i>6?' II':''),owner:['Alex Lee','Sam Taylor','Morgan Chen'][i%3],status:['Active','Draft','Review'][i%3]}))},
  evidence:{title:'Why review the publication date?',summary:'The selected notes disagree about when the report will be ready. Confirm the date before publishing.',inputs:['Two sample documents are included.','Assumption: both documents refer to the same report.'],sources:[{title:'Project brief — sample',excerpt:'Target publication: Friday.',state:'provided',date:'Illustrative source'},{title:'Review notes — sample',excerpt:'Source checks will continue into next week.',state:'conflicting',date:'Illustrative source'},{title:'Final publication schedule',excerpt:'No accessible copy was supplied.',state:'unavailable'}]},
  generation:{state:'idle',note:'Interactive simulation. No model or external service is connected.'},
  execution:{title:'Sample publication workflow',steps:[{id:'read',label:'Read selected sources',state:'complete',detail:'Two sample documents processed.'},{id:'draft',label:'Create a draft',state:'complete',detail:'A local demonstration draft is ready.'},{id:'publish',label:'Publish the approved draft',state:'failed',detail:'Simulated destination unavailable. No content was sent.',retryable:true}],note:'Illustrative execution states, not a record of real external actions.'}
};
const catalog = [
 ['capability','Capability introduction','G1–2','Explain what assistance can do, its limits, and useful starting requests.'],
 ['suggestion','Suggestion review','G3–4, G7–9','Accept, edit, dismiss, or undo a contextual suggestion.'],
 ['clarification','Uncertainty & clarification','G2, G10','Ask for an interpretation instead of inventing certainty.'],
 ['evidence','Explanation & evidence','G11','Inspect relevant inputs, assumptions, conflicting sources, and unavailable evidence.'],
 ['correction','Correction & comparison','G9','Compare original wording with an editable revision and recover earlier text.'],
 ['feedback','Granular feedback','G15–16','Identify a problem with a particular claim and explain where feedback goes.'],
 ['context','Context & recent history','G12','Inspect, reference, remove, and clear the context used for subsequent requests.'],
 ['preferences','AI preferences','G13, G17','Choose assistance, personalization, and context access. The application enforces these choices.'],
 ['change-notice','Behavior-change notice','G14, G18','Explain new capabilities and their impact, then acknowledge the change.'],
 ['composer','Prompt composer','Extension','Compose requests with selected context, local attachments, and suggested prompts.'],
 ['generation','Generation states','Extension','Represent waiting, generating, complete, stopped, incomplete, and failed results.'],
 ['action-review','Action review & approval','Extension','Inspect consequences and select exactly which actions to authorize.'],
 ['execution','Execution activity','Extension','Show application-reported results and request recovery for failed steps.']
];
export function corePage({head,block}) {
  return `${head('CORE COMPONENTS','More possibilities. The same clarity.','Reusable native controls and optional web components. No framework or runtime dependencies.')}<div class="cl-alert"><p>Interactive components are registered with <code>registerClarityElements()</code>. They inherit the Clarity styles and emit events to your application. <a href="./docs/components.md">Read the component API</a>.</p></div>
${block('Menus, popovers & tooltips','<div class="cl-row"><cl-menu label="Project actions"></cl-menu><cl-popover label="Visibility details"></cl-popover><cl-tooltip label="Access information" text="Only invited people can see this project."></cl-tooltip></div>','Menu: arrow keys, Home/End, Escape, and outside dismissal. Popovers use the browser top layer.')}
${block('Searchable combobox','<cl-combobox label="Choose a team"></cl-combobox>','Choose an option with the pointer or Arrow keys and Enter. Escape restores the last selection.')}
${block('Multiselect & removable chips','<cl-multiselect label="Project categories"></cl-multiselect>','Filter choices, select multiple categories, and remove them individually.')}
${block('Dates & date ranges','<div class="cl-stack"><label class="cl-field">Due date<input class="cl-input" type="date"></label><cl-date-range label="Reporting period"></cl-date-range></div>','Native date pickers respect browser and locale conventions. Date ranges validate chronological order.')}
${block('Switches & radio groups','<div class="cl-stack"><label class="cl-switch"><input type="checkbox" role="switch" checked><span class="cl-switch-track" aria-hidden="true"></span>Email notifications</label><label class="cl-switch"><input type="checkbox" role="switch" disabled><span class="cl-switch-track" aria-hidden="true"></span>Managed by your organization</label><fieldset class="cl-fieldset"><legend>Notification frequency</legend><label class="cl-check"><input type="radio" name="frequency" value="daily" checked>Daily digest</label><label class="cl-check"><input type="radio" name="frequency" value="weekly">Weekly digest</label></fieldset></div>')}
${block('Loading & progress','<div class="cl-stack"><div class="cl-row" role="status"><span class="cl-spinner" aria-hidden="true"></span>Loading project details…</div><div aria-busy="true" aria-label="Loading project preview"><div class="cl-skeleton" style="width:65%;margin-bottom:12px"></div><div class="cl-skeleton" style="width:90%"></div></div><label class="cl-field">Upload progress — sample<progress class="cl-progress" value="65" max="100" aria-label="Sample upload progress">65%</progress></label><div><button class="cl-btn cl-btn--primary" data-loading-demo>Try loading button</button></div><p class="cl-help" data-loading-status role="status"></p></div>','Loading buttons disable duplicate activation. Reduced-motion preferences remove animation.')}
${block('Drawer / mobile sheet','<cl-drawer label="Inspect project"></cl-drawer>','A native modal dialog opens as a side panel on desktop and a full-width sheet on mobile.')}
${block('Accordion & disclosure','<div class="cl-stack"><details class="cl-disclosure" name="project-help"><summary>Who can access this workspace?</summary><p>Only invited members can access its documents and projects.</p></details><details class="cl-disclosure" name="project-help"><summary>Can I change this later?</summary><p>You can change workspace settings at any time, subject to your application’s permissions.</p></details></div>','Native disclosure controls work with Enter and Space. A shared name makes this group exclusive.')}
${block('Files & drop zone','<cl-upload label="Attach source documents" accept=".pdf,.txt,.csv" max-size="10485760"></cl-upload>','Local selection, type/size validation, drag-and-drop, and removal. No files are uploaded by this component.')}
${block('Data table, filters & pagination','<cl-data-table data-demo="projects" label="Example projects"></cl-data-table>','Search, applied-filter chips, sorting, page selection, bulk-action events, and pagination. Set element.data to your rows and columns; see the API guide.')}
${block('Multi-step form','<cl-stepper></cl-stepper>','Native required-field validation, back navigation, a review step, and a completion event.')}
<div class="cl-alert" role="status" id="core-event">Interact with a component to see its event here.</div>`;
}
export function haxPage({head,block}) {
  return `${head('HUMAN–AI INTERACTION','Assistance that keeps people in control.','Thirteen reusable patterns for expectations, evidence, correction, feedback, and action review.')}<div class="cl-alert"><p>Inspired by <a href="https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/" target="_blank" rel="noopener noreferrer">Microsoft HAX</a>. These are Clarity implementations, not official HAX components or a compliance certification. All examples use local sample data. <a href="./docs/hax.md">Pattern and behavior guide</a>.</p></div><nav class="cl-pattern-index" aria-label="AI patterns">${catalog.map(([id,title])=>`<a href="#hax" data-scroll-pattern="${id}">${title}</a>`).join('')}</nav>${catalog.map(([id,title,mapping,description])=>`<section id="pattern-${id}">${block(title,`<cl-ai-${id} ${['evidence','generation','execution'].includes(id)?`data-demo="${id}"`:''}></cl-ai-${id}>${id==='generation'?'<div class="cl-row cl-spaced"><button class="cl-btn cl-btn--secondary" data-simulate="start">Simulate generation</button><button class="cl-btn cl-btn--secondary" data-simulate="fail">Show failure</button><button class="cl-btn cl-btn--secondary" data-simulate="partial">Show incomplete result</button></div>':''}`,`<span class="cl-badge cl-badge--info">${mapping}</span> ${description}`)}</section>`).join('')}<div class="cl-alert" role="status" id="hax-event">Interact with a pattern to see its event here. Nothing is sent to an AI service.</div>`;
}
export function chatPage({head}) {
  return `${head('CHAT INTERFACE','An assistant that shows its work.','Conversation, reasoning steps, citations, clarification, and approvals in one workspace. Your application owns the model, history, and actions.')}<div class="cl-alert"><p>Built from <code>cl-chat-thread</code>, <code>cl-chat-input</code>, and the <code>.cl-chat-app</code> layout. Everything below is simulated. <a href="./docs/components.md#chat-interface">Read the chat API</a>.</p></div>
<section class="component-block"><div class="section-heading"><h2>Assistant workspace</h2></div><p>Try a suggestion, open the step trail, hover a citation, answer the question, and approve the proposed action. The layout adapts to its container: the context panel becomes an overlay below 1000px, and history hides below 680px.</p>
<div class="chat-demo cl-chat-app">
<aside class="cl-chat-app__history" aria-label="Conversations"><button type="button" class="cl-btn cl-btn--secondary" data-chat-new>${icon('plus')}New chat</button><p class="cl-chat-history__label">Recent</p><ul class="cl-chat-history" data-chat-history></ul></aside>
<div class="cl-chat"><div class="cl-chat__header"><div><h3 class="cl-chat__title" data-chat-title></h3><p class="cl-chat__subtitle" data-chat-subtitle></p></div><button type="button" class="cl-icon-btn" data-chat-panel-toggle aria-label="Context and sources" title="Context and sources">${icon('layers')}</button></div><cl-chat-thread></cl-chat-thread><div class="cl-chat__footer"><cl-chat-input></cl-chat-input></div></div>
<aside class="cl-chat-app__panel" aria-label="Context and sources" data-chat-panel></aside>
</div></section>
<div class="cl-alert" role="status" id="chat-event">Interact with the conversation to see its events here.</div>`;
}
export function mountExtended(root) {
  const controller=new AbortController();const timers=new Set();const later=(fn,delay)=>{const id=setTimeout(()=>{timers.delete(id);if(root.isConnected)fn();},delay);timers.add(id);};
  root.querySelectorAll('[data-demo]').forEach(el=>{el.data=structuredClone(demoData[el.dataset.demo]);});
  const events=['menu-select','change','selection','bulk-action','save','files','complete','invoke','suggestion','clarify','dismiss','correction','feedback','reference','context-change','preferences','acknowledge','request','stop','retry','decision','retry-step','message-action'];
  for(const event of events)root.addEventListener(`cl-${event}`,ev=>{const output=root.querySelector('#core-event,#hax-event,#chat-event');if(output)output.textContent=`${ev.type}: ${JSON.stringify(ev.detail,(_,v)=>v instanceof File?{name:v.name,size:v.size}:v)}`;},{signal:controller.signal});
  const generation=root.querySelector('cl-ai-generation');let generationRun=0;
  function simulate(){if(!generation)return;const run=++generationRun;generation.data={...demoData.generation,state:'waiting'};later(()=>{if(run===generationRun)generation.data={...demoData.generation,state:'generating',text:'Reviewing the selected sample documents…'};},500);later(()=>{if(run===generationRun)generation.data={...demoData.generation,state:'complete',text:'Sample draft: The project brief and review notes disagree about the publication date. Confirm the date before sharing the summary.'};},1800);}
  root.addEventListener('cl-stop',event=>{if(event.target.localName!=='cl-ai-generation')return;generationRun++;if(generation)generation.data={...demoData.generation,state:'interrupted',text:generation.data?.text};},{signal:controller.signal});
  root.addEventListener('cl-retry',event=>{if(event.target.localName==='cl-ai-generation')simulate();},{signal:controller.signal});
  root.addEventListener('cl-retry-step',event=>{const el=event.target;if(el.localName!=='cl-ai-execution')return;el.data={...el.data,steps:el.data.steps.map(s=>s.id===event.detail.id?{...s,state:'running',detail:'Simulating a retry…'}:s)};later(()=>{if(el.isConnected)el.data={...el.data,steps:el.data.steps.map(s=>s.id===event.detail.id?{...s,state:'complete',detail:'Simulation complete. No external action occurred.'}:s)};},900);},{signal:controller.signal});
  const chatApp=root.querySelector('.cl-chat-app');
  if(chatApp){
    const chat=demoData.chat,thread=chatApp.querySelector('cl-chat-thread'),input=chatApp.querySelector('cl-chat-input'),on={signal:controller.signal};
    const withSources=m=>m.sources==='default'?{...m,sources:chat.sources}:m;
    const conversations=structuredClone(chat.conversations).map(c=>({...c,messages:c.messages.map(withSources)}));
    let current=conversations[0],run=0,serial=0;
    const busy=()=>['waiting','generating'].includes(current.messages.at(-1)?.state);
    const find=id=>current.messages.find(m=>m.id===id);
    function history(){chatApp.querySelector('[data-chat-history]').innerHTML=conversations.map(c=>`<li><button type="button" class="cl-chat-history__item" data-conversation="${esc(c.id)}" ${c===current?'aria-current="true"':''}><span>${esc(c.title)}</span><small>${esc(c.time)}</small></button></li>`).join('');}
    function panel(){
      const docs=current.context.map(id=>chat.docs[id]),cited=current.messages.findLast(m=>m.sources?.length&&m.state==='complete')?.sources||[];
      chatApp.querySelector('[data-chat-panel]').innerHTML=`<div class="cl-chat-panel__head"><h3>Context</h3><button type="button" class="cl-icon-btn" data-chat-panel-toggle aria-label="Close context panel" title="Close">${icon('close',{size:15})}</button></div><section><h4 class="cl-chat-panel__label">In context</h4>${docs.length?`<ul class="cl-chat-docs">${docs.map(d=>`<li><span class="cl-chat-doc__icon">${icon('book',{size:15})}</span><div><strong>${esc(d.label)}</strong><small>${esc(d.meta)}</small></div></li>`).join('')}</ul>`:'<p class="cl-chat-panel__empty">No documents in context.</p>'}</section><section><h4 class="cl-chat-panel__label">Sources in latest answer</h4>${cited.length?`<ol class="cl-chat-panel-sources">${cited.map((c,i)=>`<li><span class="cl-chat-source__n">${i+1}</span><div><strong>${esc(c.title)}</strong><p>${esc(c.excerpt||'')}</p></div></li>`).join('')}</ol>`:'<p class="cl-chat-panel__empty">Sources appear here after a cited answer.</p>'}</section>`;
    }
    function show(){
      chatApp.querySelector('[data-chat-title]').textContent=current.title;
      chatApp.querySelector('[data-chat-subtitle]').textContent=`${current.context.length||'No'} document${current.context.length===1?'':'s'} in context`;
      thread.data={...chat.thread,messages:[...current.messages]};
      const last=current.messages.at(-1);
      input.data={...chat.input,context:current.context.map(id=>chat.docs[id]),generating:busy(),suggestions:last?.role==='assistant'&&last.state==='complete'&&!last.clarify&&!last.action?chat.followUps:[]};
      panel();
    }
    const patch=(id,change)=>{current.messages=current.messages.map(m=>m.id===id?{...m,...change}:m);show();};
    const guard=(mine,conv)=>mine===run&&conv===current;
    function reply(id){
      const mine=++run,conv=current,labels=['Reading documents in context','Checking dates and owners','Drafting the update'];
      const steps=i=>labels.map((label,j)=>({label,state:j<i?'complete':j===i?'running':'pending'}));
      const words=`Here is a draft based on the brief [1] and the review notes [2]:\n\n**Status:** on track for Wednesday, two days later than planned.\n\n- Source checks now run before review [2].\n- The brief still lists Friday and needs an update [1].\n- Owners are unchanged.\n\n\`\`\`text\nPublication moves to Wednesday so source checks can finish first.\n\`\`\``.split(/(?<=\s)/);
      let step=0,count=0;
      patch(id,{state:'waiting',content:'',steps:steps(0),sources:undefined,clarify:undefined,action:undefined,error:undefined});
      const stream=()=>{if(!guard(mine,conv))return;count+=2;const done=count>=words.length;patch(id,{state:done?'complete':'generating',content:words.slice(0,count).join(''),...(done?{sources:chat.sources,clarify:{question:'Who should receive this update?',options:['Review team','Whole workspace','Just me']}}:{})});if(!done)later(stream,40);};
      const advance=()=>{if(!guard(mine,conv))return;step++;if(step<labels.length){patch(id,{state:'generating',steps:steps(step)});later(advance,700);}else{patch(id,{steps:steps(labels.length)});stream();}};
      later(advance,700);
    }
    function send(prompt,files=[]){
      if(!current.messages.length)current.title=prompt.length>34?`${prompt.slice(0,32)}…`:prompt;
      const id=`u${++serial}`,rid=`a${serial}`;
      current.messages=[...current.messages,{id,role:'user',content:prompt,files:files.map(f=>({name:f.name})),editable:true,time:'Now'},{id:rid,role:'assistant',time:'Now'}];
      history();reply(rid);
    }
    function open(conv){run++;current=conv;history();show();}
    history();show();
    input.addEventListener('cl-request',event=>send(event.detail.prompt,event.detail.files),on);
    input.addEventListener('cl-stop',()=>{run++;const last=current.messages.at(-1);if(last)patch(last.id,{state:last.content?'interrupted':'failed',error:'Stopped before any output arrived.',steps:last.steps?.map(s=>s.state==='complete'?s:{...s,state:'pending'})});},on);
    input.addEventListener('cl-context-change',event=>{current.context=event.detail.items.map(i=>i.id);show();},on);
    thread.addEventListener('cl-invoke',event=>send(event.detail.prompt),on);
    thread.addEventListener('cl-message-action',event=>{
      const {action,id}=event.detail,message=find(id),conv=current,mine=run;if(!message)return;
      if(action==='edit'){input.value=message.content;input.focus();}
      if(action==='retry'||action==='regenerate')reply(id);
      if(action==='clarify'){
        const answer=event.detail.answer,rid=`a${++serial}`;
        patch(id,{clarify:{...message.clarify,answer}});
        current.messages=[...current.messages,{id:rid,role:'assistant',state:'waiting'}];show();
        later(()=>{if(guard(mine,conv))patch(rid,{state:'complete',time:'Now',content:`Got it. I'll send the draft to **${answer.toLowerCase()}** once you approve.`,action:{id:'send',title:`Send the status update to ${answer.toLowerCase()}`,detail:'Posts the draft above and notifies each recipient.',consequence:'Recipients see it immediately. This demo sends nothing.',state:'pending',approveLabel:'Send update',declineLabel:'Not now'}});},900);
      }
      if(action==='approve'){
        patch(id,{action:{...message.action,state:'running',statusText:'Working…'}});
        later(()=>{const m=conv.messages.find(x=>x.id===id);if(m&&conv===current)patch(id,{action:{...m.action,state:'done',statusText:'Done · simulated'}});},1200);
      }
      if(action==='decline')patch(id,{action:{...message.action,state:'declined',statusText:'Declined'}});
    },on);
    chatApp.addEventListener('click',event=>{
      const conv=event.target.closest('[data-conversation]');if(conv){open(conversations.find(c=>c.id===conv.dataset.conversation));return;}
      if(event.target.closest('[data-chat-new]')){const fresh={id:`new-${++serial}`,title:'New conversation',time:'Now',context:['brief','notes'],messages:[]};conversations.unshift(fresh);open(fresh);input.focus();return;}
      const toggle=event.target.closest('[data-chat-panel-toggle]');
      if(toggle){const opening=!toggle.closest('[data-chat-panel]');const panelEl=chatApp.querySelector('[data-chat-panel]'),visible=getComputedStyle(panelEl).display!=='none';chatApp.dataset.panel=visible?'closed':'open';chatApp.querySelector('.cl-chat__header [data-chat-panel-toggle]').setAttribute('aria-expanded',String(!visible));if(!opening)chatApp.querySelector('.cl-chat__header [data-chat-panel-toggle]').focus();}
    },on);
    chatApp.addEventListener('keydown',event=>{if(event.key==='Escape'&&chatApp.dataset.panel==='open'){chatApp.dataset.panel='closed';chatApp.querySelector('.cl-chat__header [data-chat-panel-toggle]').focus();}},on);
  }
  root.addEventListener('click',event=>{const target=event.target.closest('[data-scroll-pattern],[data-simulate],[data-loading-demo]');if(!target)return;if(target.dataset.scrollPattern){event.preventDefault();root.querySelector(`#pattern-${target.dataset.scrollPattern}`)?.scrollIntoView({block:'start'});}if(target.dataset.simulate){generationRun++;if(target.dataset.simulate==='start')simulate();else generation.data={...demoData.generation,state:target.dataset.simulate==='fail'?'failed':'incomplete',text:target.dataset.simulate==='partial'?'Sample partial result: The brief suggests…':'',error:target.dataset.simulate==='fail'?'Simulated service unavailable. Your input is preserved.':''};}if(target.hasAttribute('data-loading-demo')){target.disabled=true;target.setAttribute('aria-busy','true');target.textContent='Saving…';later(()=>{target.disabled=false;target.removeAttribute('aria-busy');target.textContent='Try loading button';root.querySelector('[data-loading-status]').textContent='Simulation complete. No data was saved.';},900);}},{signal:controller.signal});
  return ()=>{controller.abort();generationRun++;timers.forEach(clearTimeout);};
}
