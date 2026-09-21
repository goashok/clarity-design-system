/** Chat interface. Elements render application-supplied messages and emit events; they never call models, run actions, upload files, or store history. */
export function registerChat({Base,define,e,icon,safeURL,generationStates,formatMessage}) {
  const live=['waiting','generating'];
  const stopped=['interrupted','incomplete'];
  const stateOf=message=>generationStates.includes(message.state)&&message.state!=='idle'?message.state:'complete';
  const roleOf=message=>message.role==='user'?'user':message.role==='system'?'system':'assistant';
  const plain=text=>String(text??'').replace(/```[^\n]*\n?/g,' ').replace(/\[(\d{1,2})\]/g,'').replace(/\s+/g,' ').trim();
  // Chat-specific glyphs on the Clarity grid: 24px viewBox, 1.65 stroke, round caps and joins.
  const glyph=(paths,size=16)=>`<svg class="cl-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const thumb='<path d="M7 10v11H3V10h4Z"/><path d="M7 10l4-7c1.7 0 2.8 1.3 2.4 3L13 9h5.5a2 2 0 0 1 2 2.4l-1.5 7.5a2 2 0 0 1-2 1.6H7"/>';
  const glyphs={
    copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    regenerate:'<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
    up:thumb,
    down:`<g transform="matrix(1 0 0 -1 0 24)">${thumb}</g>`,
    edit:'<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13 7 4 4"/>',
    send:'<path d="M12 19V5M6 11l6-6 6 6"/>',
    attach:'<path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7"/>',
    stop:'<rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" stroke="none"/>',
    jump:'<path d="M12 5v14M6 13l6 6 6-6"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>',
    doc:'<path d="M6 3h8l5 5v13H6V3Z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
    bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    question:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>'
  };
  const spinner='<span class="cl-spinner cl-chat-spin" aria-hidden="true"></span>';
  const action=(name,label,extra='')=>`<button type="button" class="cl-chat-action" data-msg-action="${name}" aria-label="${label}" title="${label}" ${extra}>${glyph(glyphs[name])}</button>`;
  async function copyText(text){try{await navigator.clipboard.writeText(text);return true;}catch{return false;}}
  function flash(button,paths){button.innerHTML=glyph(glyphs.check);setTimeout(()=>{if(button.isConnected)button.innerHTML=glyph(paths);},1500);}

  define('cl-chat-thread',class extends Base {
    constructor(){super();this.nodes=new Map();this.sigs=new Map();this.states=null;this.ratings=new Map();this.openSteps=new Set();this.pinned=true;}
    connectedCallback(){
      super.connectedCallback();
      const signal=this.abort.signal;
      this.addEventListener('scroll',()=>this.follow(),{capture:true,signal});
      // Remember which step trails are expanded; streaming updates rebuild the message.
      this.addEventListener('toggle',event=>{const el=event.target;if(!el.matches?.('.cl-chat-steps'))return;const id=el.closest('[data-id]')?.dataset.id;if(id)el.open?this.openSteps.add(id):this.openSteps.delete(id);},{capture:true,signal});
      // Link inline citations and their source pills in both directions.
      const link=on=>event=>{const el=event.target.closest?.('[data-cite],[data-source]');const message=el?.closest('[data-id]');if(!message)return;const n=el.dataset.cite||el.dataset.source;message.querySelectorAll(`[data-cite="${n}"],[data-source="${n}"]`).forEach(x=>x.classList.toggle('is-active',on));};
      for(const [type,on] of [['pointerover',true],['pointerout',false],['focusin',true],['focusout',false]])this.addEventListener(type,link(on),{signal});
    }
    /* Optional `renderContent(text, message)` returns trusted HTML. Supply a sanitizing renderer; the default escapes everything. */
    get scroller(){return this.querySelector('.cl-chat-scroll');}
    get jump(){return this.querySelector('[data-action="jump"]');}
    follow(){const el=this.scroller;if(!el)return;this.pinned=el.scrollHeight-el.scrollTop-el.clientHeight<=48;if(this.pinned)this.jump.hidden=true;}
    scrollToEnd(){const el=this.scroller;if(!el)return;this.pinned=true;el.scrollTop=el.scrollHeight;this.jump.hidden=true;}
    name(m){return m.name||(roleOf(m)==='user'?'You':roleOf(m)==='system'?'System':this.data?.assistantName||'Assistant');}
    rating(m){const id=String(m.id);return this.ratings.has(id)?this.ratings.get(id):m.rating||null;}
    steps(m){
      const list=m.steps||[];if(!list.length)return '';
      const running=list.find(s=>s.state==='running'),failed=list.filter(s=>s.state==='failed').length;
      const summary=running?`${e(running.label)}…`:`Worked through ${list.length} step${list.length===1?'':'s'}${failed?` · ${failed} failed`:''}`;
      const marker=s=>s.state==='complete'?glyph(glyphs.check,11):s.state==='running'?spinner:s.state==='failed'?icon('close',{size:11}):'';
      return `<details class="cl-chat-steps" ${this.openSteps.has(String(m.id))?'open':''}><summary><span class="cl-chat-steps__lead">${running?spinner:glyph(glyphs.check,13)}</span><span>${summary}</span><span class="cl-chat-steps__chevron">${glyph(glyphs.chevron,13)}</span></summary><ol class="cl-chat-steps__list">${list.map(s=>`<li data-state="${e(s.state||'pending')}"><span class="cl-chat-steps__marker">${marker(s)}</span><span>${e(s.label)}${s.detail?`<small>${e(s.detail)}</small>`:''}</span></li>`).join('')}</ol></details>`;
    }
    approval(m){
      const a=m.action;if(!a)return '';
      const state=['pending','running','done','declined','failed'].includes(a.state)?a.state:'pending';
      const status={
        running:`<span class="cl-chat-approval__status">${spinner}${e(a.statusText||'Running…')}</span>`,
        done:`<span class="cl-badge cl-badge--success">${glyph(glyphs.check,11)}${e(a.statusText||'Done')}</span>`,
        declined:`<span class="cl-badge">${e(a.statusText||'Declined')}</span>`,
        failed:`<span class="cl-badge cl-badge--danger">${e(a.statusText||'Failed')}</span>`
      }[state];
      return `<div class="cl-chat-approval" data-state="${state}"><div class="cl-chat-approval__head"><span class="cl-chat-approval__icon" aria-hidden="true">${glyph(glyphs.bolt,15)}</span><div><span class="cl-chat-approval__eyebrow">${state==='pending'?'Needs your approval':'Proposed action'}</span><strong>${e(a.title)}</strong>${a.detail?`<p>${e(a.detail)}</p>`:''}</div></div>${a.consequence&&state==='pending'?`<p class="cl-chat-approval__note">${e(a.consequence)}</p>`:''}<div class="cl-chat-approval__foot">${state==='pending'?`<button type="button" class="cl-btn cl-btn--primary cl-btn--compact" data-msg-action="approve">${e(a.approveLabel||'Approve')}</button><button type="button" class="cl-btn cl-btn--secondary cl-btn--compact" data-msg-action="decline">${e(a.declineLabel||'Decline')}</button>`:status}</div></div>`;
    }
    clarify(m){
      const c=m.clarify;if(!c)return '';
      return `<div class="cl-chat-clarify"><p><span aria-hidden="true">${glyph(glyphs.question,15)}</span><strong>${e(c.question)}</strong></p><div class="cl-chat-chips" role="group" aria-label="${e(c.question)}">${(c.options||[]).map(o=>`<button type="button" class="cl-chat-chip" data-msg-action="clarify" data-answer="${e(o)}" aria-pressed="${c.answer===o}" ${c.answer!==undefined&&c.answer!==null?'disabled':''}>${e(o)}</button>`).join('')}</div></div>`;
    }
    body(m){
      const state=stateOf(m),role=roleOf(m),rating=this.rating(m),text=m.content??'',busy=live.includes(state);
      const sources=m.sources||[];
      const content=this.renderContent?this.renderContent(text,m):formatMessage(text,{citations:busy?0:sources.length});
      const files=(m.files||[]).length?`<ul class="cl-chat-attachments" aria-label="Attachments">${m.files.map(f=>`<li class="cl-chat-attachment">${glyph(glyphs.attach,14)}<span>${e(f.name??f)}</span></li>`).join('')}</ul>`:'';
      const note=state==='failed'
        ?`<div class="cl-chat-error" role="alert"><span>${e(m.error||'This response could not be completed.')}</span><button type="button" class="cl-btn cl-btn--secondary cl-btn--compact" data-msg-action="retry">${glyph(glyphs.regenerate,14)}Retry</button></div>`
        :stopped.includes(state)?`<p class="cl-chat-note">${state==='interrupted'?'Response stopped. Partial output shown.':'Response incomplete. Only part of it is available.'}</p>`:'';
      const buttons=busy||state==='failed'?'':[
        text?action('copy','Copy'):'',
        role==='user'&&m.editable?action('edit','Edit'):'',
        role==='assistant'&&m.regenerable!==false?action('regenerate','Regenerate'):'',
        role==='assistant'&&text&&m.rateable!==false?action('up','Good response',`aria-pressed="${rating==='up'}"`)+action('down','Poor response',`aria-pressed="${rating==='down'}"`):''
      ].join('');
      const time=m.time&&!busy?`<span class="cl-chat-time">${e(m.time)}</span>`:'';
      const bar=buttons||time?`<div class="cl-chat-actions" role="group" aria-label="Message actions">${role==='user'?time+buttons:buttons+time}</div>`:'';
      if(role==='system')return `<div class="cl-chat-body"><div class="cl-chat-content">${content}</div></div>`;
      if(role==='user')return `<div class="cl-chat-body"><span class="cl-sr-only">${e(this.name(m))}${m.time?`, ${e(m.time)}`:''}</span>${files}<div class="cl-chat-content">${content}</div>${bar}</div>`;
      const running=(m.steps||[]).some(s=>s.state==='running');
      const activity=state==='waiting'?'Thinking…':busy?(running?'Working…':'Writing…'):'';
      const typing=busy&&!text&&!(m.steps||[]).length?`<span class="cl-chat-typing" aria-hidden="true"><span></span><span></span><span></span></span>`:'';
      const sourceBlock=sources.length&&!busy?`<div class="cl-chat-sources-block"><span class="cl-chat-label">Sources</span><ol class="cl-chat-sources" aria-label="Sources">${sources.map((s,i)=>{const url=safeURL(s.url||''),inner=`<span class="cl-chat-source__n">${i+1}</span><span class="cl-chat-source__title">${e(s.title)}</span>`;return `<li>${url?`<a class="cl-chat-source" data-source="${i+1}" href="${e(url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`:`<span class="cl-chat-source" data-source="${i+1}" tabindex="0">${inner}</span>`}</li>`;}).join('')}</ol></div>`:'';
      const card=[this.steps(m),typing,text?`<div class="cl-chat-content">${content}</div>`:'',this.clarify(m),this.approval(m),sourceBlock,note].join('');
      return `<div class="cl-chat-avatar" aria-hidden="true">${icon('sparkles',{size:15})}</div><div class="cl-chat-body"><div class="cl-chat-meta"><strong>${e(this.name(m))}</strong>${activity?`<span>${activity}</span>`:''}</div>${files}<div class="cl-chat-card">${card}</div>${bar}</div>`;
    }
    decorate(node,m){
      // Code blocks get a language label and a copy button; the cursor sits at the end of streaming text.
      node.querySelectorAll('.cl-chat-content pre').forEach(pre=>{
        const block=document.createElement('div');block.className='cl-code-block';
        block.innerHTML=`<div class="cl-code-head"><span>${e(pre.dataset.lang||'code')}</span><button type="button" class="cl-chat-action" data-copy-code aria-label="Copy code" title="Copy code">${glyph(glyphs.copy,14)}</button></div>`;
        pre.replaceWith(block);block.append(pre);
      });
      if(stateOf(m)==='generating'&&m.content){
        const content=node.querySelector('.cl-chat-content'),last=content?.lastElementChild;
        const host=last?.matches('ul,ol')?last.lastElementChild:last?.matches('p')?last:content;
        host?.insertAdjacentHTML('beforeend','<span class="cl-chat-caret" aria-hidden="true"></span>');
      }
    }
    render(){
      const d=this.data||{},messages=(d.messages||[]).filter(m=>m&&m.id!==undefined);
      if(!this.scroller)this.innerHTML=`<div class="cl-chat-scroll" tabindex="0" role="log" aria-live="off"><div data-empty></div><ol class="cl-chat-messages"></ol></div><button type="button" class="cl-chat-jump" data-action="jump" hidden>${glyph(glyphs.jump,14)}Jump to latest</button><p class="cl-sr-only" role="status" data-status></p>`;
      this.scroller.setAttribute('aria-label',d.label||'Conversation');
      const list=this.querySelector('.cl-chat-messages'),empty=this.querySelector('[data-empty]'),info=d.empty||{};
      empty.innerHTML=messages.length?'':`<div class="cl-chat-empty"><div class="cl-chat-empty__mark" aria-hidden="true">${icon('sparkles',{size:24})}</div><h3>${e(info.title||'Start a conversation')}</h3><p>${e(info.description||'Ask a question or choose a suggestion to begin.')}</p>${(info.prompts||[]).length?`<div class="cl-chat-prompts">${info.prompts.map((p,i)=>`<button type="button" class="cl-chat-prompt" data-action="prompt-${i}"><span>${e(p)}</span>${glyph(glyphs.send,14)}</button>`).join('')}</div>`:''}</div>`;
      const wasNear=this.pinned,ids=new Set(),announce=[];let added=false,userAdded=false,changed=false;
      const latest=messages.findLastIndex(m=>roleOf(m)==='assistant');
      this.byId=new Map(messages.map(m=>[String(m.id),m]));
      messages.forEach((m,index)=>{
        const id=String(m.id),state=stateOf(m);ids.add(id);
        let node=this.nodes.get(id);
        if(!node){node=document.createElement('li');node.dataset.id=id;this.nodes.set(id,node);added=true;if(roleOf(m)==='user'&&this.states)userAdded=true;}
        node.className=`cl-chat-message cl-chat-message--${roleOf(m)}${index===latest?' cl-chat-message--latest':''}`;
        const sig=JSON.stringify([m,this.rating(m)]);
        if(this.sigs.get(id)!==sig){
          node.dataset.state=state;node.setAttribute('aria-busy',String(live.includes(state)));
          const focus=node.contains(document.activeElement)?document.activeElement.dataset.msgAction:null;
          node.innerHTML=this.body(m);this.decorate(node,m);
          if(focus)node.querySelector(`[data-msg-action="${focus}"]`)?.focus();
          this.sigs.set(id,sig);changed=true;
          if(this.states&&roleOf(m)==='assistant'){
            const before=this.states.get(id);
            if(live.includes(state)&&!before)announce.push(`${this.name(m)} is responding.`);
            else if(before!==state&&state==='complete'&&m.content)announce.push(`${this.name(m)}: ${plain(m.content).slice(0,600)}`);
            else if(before!==state&&state==='failed')announce.push('The response failed. Retry is available.');
            else if(before!==state&&stopped.includes(state))announce.push('The response stopped.');
          }
        }
        if(list.children[index]!==node)list.insertBefore(node,list.children[index]||null);
      });
      for(const [id,node] of this.nodes)if(!ids.has(id)){node.remove();this.nodes.delete(id);this.sigs.delete(id);this.ratings.delete(id);this.openSteps.delete(id);}
      this.states=new Map(messages.map(m=>[String(m.id),stateOf(m)]));
      if(announce.length)this.status(announce.at(-1));
      if(userAdded||wasNear)this.scrollToEnd();else if(added||changed)this.jump.hidden=false;
    }
    async click(event){
      if(event.target.closest('[data-action="jump"]')){this.scrollToEnd();this.scroller.focus();return;}
      const prompt=event.target.closest('[data-action^="prompt-"]');if(prompt){this.emit('invoke',{prompt:(this.data?.empty?.prompts||[])[Number(prompt.dataset.action.slice(7))]});return;}
      const cite=event.target.closest('[data-cite]');
      if(cite){const source=cite.closest('[data-id]').querySelector(`[data-source="${cite.dataset.cite}"]`);source?.focus();source?.scrollIntoView({block:'nearest'});return;}
      const codeButton=event.target.closest('[data-copy-code]');
      if(codeButton){const ok=await copyText(codeButton.closest('.cl-code-block').querySelector('code').textContent);if(ok)flash(codeButton,glyphs.copy);this.status(ok?'Code copied.':'Copy is unavailable in this browser. Select the code and copy it manually.');return;}
      const button=event.target.closest('[data-msg-action]');if(!button||button.disabled)return;
      const id=button.closest('[data-id]').dataset.id,act=button.dataset.msgAction,message=this.byId.get(id);
      if(act==='copy'){const ok=await copyText(message?.content??'');if(ok)flash(button,glyphs.copy);this.status(ok?'Copied to clipboard.':'Copy is unavailable in this browser. Select the text and copy it manually.');this.emit('message-action',{action:act,id});return;}
      if(act==='up'||act==='down'){const next=this.rating(message)===act?null:act;this.ratings.set(id,next);this.render();this.status(next?`Marked as a ${act==='up'?'good':'poor'} response.`:'Rating cleared.');this.emit('message-action',{action:'rate',id,rating:next});return;}
      if(act==='approve'||act==='decline'){
        // Prevent a double decision while the application updates the action state.
        button.closest('.cl-chat-approval').querySelectorAll('button').forEach(b=>{b.disabled=true;});
        this.emit('message-action',{action:act,id,actionId:message?.action?.id??null});return;
      }
      if(act==='clarify'){button.closest('.cl-chat-chips').querySelectorAll('button').forEach(b=>{b.disabled=true;});button.setAttribute('aria-pressed','true');this.emit('message-action',{action:act,id,answer:button.dataset.answer});return;}
      this.emit('message-action',{action:act,id});
    }
  });

  define('cl-chat-input',class extends Base {
    constructor(){super();this.files=[];}
    get value(){return this.querySelector('textarea')?.value??'';}
    set value(text){const field=this.querySelector('textarea');if(field){field.value=String(text??'');this.resize();this.count();this.sync();}}
    focus(){this.querySelector('textarea')?.focus();}
    render(){
      const d=this.data||{},max=d.maxLength||4000,busy=!!d.generating;
      if(!this.querySelector('form'))this.innerHTML=`<form class="cl-chat-input"><div data-suggestions></div><div class="cl-chat-input__box"><div class="cl-chat-input__tags" data-tags></div><label class="cl-sr-only" for="${this.uid}-message" data-label></label><textarea id="${this.uid}-message" class="cl-chat-input__field" rows="1"></textarea><div class="cl-chat-input__bar"><span data-attach></span><span class="cl-chat-input__end"><span class="cl-chat-input__count" data-count></span><span data-send></span></span></div></div><p class="cl-chat-input__status" role="status" data-status></p></form>`;
      const field=this.querySelector('textarea');
      this.querySelector('[data-label]').textContent=d.label||'Message';
      Object.assign(field,{placeholder:d.placeholder||'Send a message…',maxLength:max,disabled:!!d.disabled});
      this.context=[...(d.context||[])];
      const suggestions=d.suggestions||[];
      const suggestionKey=JSON.stringify(suggestions);
      if(this.suggestionKey!==suggestionKey){this.suggestionKey=suggestionKey;this.querySelector('[data-suggestions]').innerHTML=suggestions.length?`<div class="cl-chat-chips cl-chat-suggestions" role="group" aria-label="Suggested follow-ups">${suggestions.map((s,i)=>`<button type="button" class="cl-chat-chip" data-action="suggest-${i}">${e(s)}</button>`).join('')}</div>`:'';}
      // Rebuild controls only when their state changes, so keyboard focus survives streaming updates.
      const key=JSON.stringify([busy,!!d.disabled,!!d.attachments,d.accept||'']);
      if(this.controlsKey!==key){
        this.controlsKey=key;
        this.querySelector('[data-attach]').innerHTML=d.attachments?`<button type="button" class="cl-chat-action" data-action="attach" aria-label="Attach files" title="Attach files" ${d.disabled?'disabled':''}>${glyph(glyphs.attach,18)}</button><input type="file" multiple hidden ${d.accept?`accept="${e(d.accept)}"`:''}>`:'';
        this.querySelector('[data-send]').innerHTML=busy
          ?`<button type="button" class="cl-chat-send cl-chat-send--stop" data-action="stop" aria-label="Stop response" title="Stop response">${glyph(glyphs.stop)}</button>`
          :`<button type="submit" class="cl-chat-send" aria-label="Send message" title="Send message">${glyph(glyphs.send)}</button>`;
      }
      if(d.disabled&&d.disabledReason)this.status(d.disabledReason);
      this.tags();this.count();this.sync();
    }
    sync(){const send=this.querySelector('.cl-chat-send[type="submit"]');if(send)send.disabled=!!this.data?.disabled||!this.value.trim();}
    tags(){
      const context=this.context.map(c=>`<li class="cl-chat-tag cl-chat-tag--context">${glyph(glyphs.doc,13)}<span>${e(c.label)}</span><button type="button" class="cl-chat-action" data-action="uncontext-${e(c.id)}" aria-label="Remove ${e(c.label)} from context" title="Remove from context">${icon('close',{size:11})}</button></li>`);
      const files=this.files.map((f,i)=>`<li class="cl-chat-tag">${glyph(glyphs.attach,13)}<span>${e(f.name)}</span><button type="button" class="cl-chat-action" data-action="remove-${i}" aria-label="Remove ${e(f.name)}" title="Remove">${icon('close',{size:11})}</button></li>`);
      this.querySelector('[data-tags]').innerHTML=context.length||files.length?`<ul aria-label="Included with your message">${context.join('')}${files.join('')}</ul>`:'';
    }
    count(){const max=this.data?.maxLength||4000,n=this.value.length;this.querySelector('[data-count]').textContent=n>=max*.8?`${n} / ${max}`:'';}
    resize(){const field=this.querySelector('textarea');field.style.height='auto';field.style.height=`${Math.min(field.scrollHeight,200)}px`;}
    input(event){if(event.target.matches('textarea')){this.resize();this.count();this.sync();}}
    change(event){
      if(!event.target.matches('[type="file"]'))return;
      const limit=this.data?.maxFileSize,added=[...event.target.files],big=limit?added.filter(f=>f.size>limit):[];
      this.files=[...this.files,...added.filter(f=>!big.includes(f))];event.target.value='';this.tags();
      this.status(big.length?`${big.map(f=>f.name).join(', ')} exceeds the size limit and was not attached.`:`${added.length} file${added.length===1?'':'s'} attached.`);
    }
    click(event){
      const act=event.target.closest('[data-action]')?.dataset.action;if(!act)return;
      if(act==='attach')this.querySelector('[type="file"]').click();
      else if(act==='stop'){this.emit('stop');this.status('Stop requested.');}
      else if(act.startsWith('suggest-')){this.value=(this.data?.suggestions||[])[Number(act.slice(8))]||'';this.focus();}
      else if(act.startsWith('remove-')){const [gone]=this.files.splice(Number(act.slice(7)),1);this.tags();this.status(`Removed ${gone?.name??'file'}.`);this.focus();}
      else if(act.startsWith('uncontext-')){const id=act.slice(10),gone=this.context.find(c=>String(c.id)===id);this.context=this.context.filter(c=>String(c.id)!==id);this.tags();this.status(`Removed ${gone?.label??'item'} from context.`);this.focus();this.emit('context-change',{items:[...this.context]});}
    }
    key(event){if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.target.matches('textarea')){event.preventDefault();this.submit();}}
    submit(){
      const prompt=this.value.trim();
      if(this.data?.disabled)return;
      if(this.data?.generating){this.status('Wait for the response to finish, or stop it.');return;}
      if(!prompt){this.status('Enter a message before sending.');return;}
      const files=[...this.files];this.emit('request',{prompt,context:this.context.map(c=>c.id),files});
      this.value='';this.files=[];this.tags();this.status('');this.focus();
    }
  });
}
