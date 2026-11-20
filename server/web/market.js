import { drawIcon } from './map.js';
const $=id=>document.getElementById(id);
const names={corn:'Milho',feed:'Ração',egg:'Ovos'};
const defaults={corn:2,feed:6,egg:9};
const fmt=n=>Number(n).toLocaleString('pt-BR');
function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}

export class MarketUI {
  constructor(context){
    this.context=context;this.farm=null;this.data=null;this.loading=null;this.selected=null;this.tradeError='';this.signature='';this.epoch=0;
    $('marketShortcut').onclick=()=>this.open();
    $('marketToggle').onclick=()=>this.toggle();
    $('marketRefresh').onclick=()=>this.refresh(true);
    $('sellItem').onchange=()=>this.updateForm(true);
    $('sellQuantity').oninput=$('sellPrice').oninput=()=>this.updateForm();
    $('sellForm').onsubmit=e=>{e.preventDefault();void this.sell();};
    document.querySelector('.market-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-market-tab]');if(b)this.selectTab(b.dataset.marketTab);});
    document.querySelector('.market-tabs').addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      const tabs=[...document.querySelectorAll('[data-market-tab]')],current=tabs.indexOf(e.target);if(current<0)return;
      e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(current+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      this.selectTab(tabs[next].dataset.marketTab);tabs[next].focus();
    });
    $('marketContent').addEventListener('click',e=>{
      const b=e.target.closest('[data-market-action]');if(!b)return;
      if(b.dataset.marketAction==='buy')this.purchaseDialog(b.dataset.id);
      if(b.dataset.marketAction==='cancel')void this.context.command({type:'market_cancel',listingId:b.dataset.id},'Anúncio cancelado. O lote voltou para o armazém.');
    });
    $('tradeConfirm').onclick=()=>{const listing=this.selected;if(listing)void this.context.command({type:'market_buy',listingId:listing.id},'Compra concluída. O lote chegou ao seu armazém.');};
    $('tradeDialog').addEventListener('close',()=>{this.selected=null;this.tradeError='';});
    this.selectTab('offers');
  }
  setFarm(snapshot){
    const changed=this.farm?.farm.id!==snapshot.farm.id;
    if(changed){this.selectTab('offers');this.epoch++;this.data=null;this.signature='';this.selected=null;this.tradeError='';$('tradeDialog').close();$('sellForm').reset();this.clearCards();}
    this.farm=snapshot;this.updateForm(changed);this.setLocked();this.renderPurchase();
    if(!$('marketContent').hidden)void this.refresh();
  }
  reset(){
    this.selectTab('offers');this.epoch++;this.farm=null;this.data=null;this.selected=null;this.tradeError='';this.signature='';
    $('tradeDialog').close();$('marketContent').hidden=true;$('marketToggle').setAttribute('aria-expanded','false');$('marketToggle').textContent='Visitar feira';this.clearCards();$('sellForm').reset();
  }
  clearCards(){for(const id of ['marketOffers','marketMine','marketTrades'])$(id).replaceChildren();}
  open(){
    $('marketContent').hidden=false;$('marketToggle').setAttribute('aria-expanded','true');$('marketToggle').textContent='Recolher feira';
    $('marketSection').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    void this.refresh();
  }
  toggle(){if($('marketContent').hidden)this.open();else{$('marketContent').hidden=true;$('marketToggle').setAttribute('aria-expanded','false');$('marketToggle').textContent='Visitar feira';}}
  async refresh(force=false){
    if(!this.farm)return false;
    if(this.loading){const previousFarm=this.loadingFarmId,result=await this.loading;return force||previousFarm!==this.farm?.farm.id?this.refresh():result;}
    const farmId=this.farm.farm.id,epoch=this.epoch,generation=this.context.generation();this.loadingFarmId=farmId;
    this.loading=(async()=>{
      try{
        const data=await this.context.request('/api/market');
        if(this.epoch!==epoch||this.farm?.farm.id!==farmId||data.farmId!==farmId||generation!==this.context.generation())return false;
        this.data=data;this.render();this.message();return true;
      }catch{if(this.epoch===epoch&&this.farm?.farm.id===farmId)$('marketMessage').textContent='Não foi possível atualizar as bancas. Tente “Atualizar feira”.';return false;}
      finally{this.loading=null;}
    })();return this.loading;
  }
  selectTab(tab){
    for(const b of document.querySelectorAll('[data-market-tab]')){const active=b.dataset.marketTab===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}
    for(const [key,id]of [['offers','marketOffersPanel'],['mine','marketMinePanel'],['trades','marketTradesPanel']])$(id).hidden=key!==tab;
  }
  render(){
    if(!this.data)return;
    const signature=JSON.stringify([this.data.listings,this.data.myListings,this.data.trades]);
    if(signature!==this.signature){
      this.signature=signature;
      this.list($('marketOffers'),this.data.listings.filter(l=>!l.mine),'As bancas estão quietinhas. Anuncie um lote ou volte depois para encontrar colheitas da vizinhança.');
      this.list($('marketMine'),this.data.myListings,'Sua banca está esperando a primeira colheita. Escolha um produto ao lado para anunciar.');
      const history=$('marketTrades');history.replaceChildren();
      if(!this.data.trades.length)history.append(node('p','market-empty','Seus negócios concluídos vão aparecer aqui.'));
      for(const trade of this.data.trades){
        const card=node('article','market-trade');card.dataset.side=trade.side;
        const copy=node('div');copy.append(node('h3','',`${trade.side==='sell'?'Venda':'Compra'} · ${trade.quantity} × ${names[trade.item]}`));
        const date=new Date(trade.createdAt);copy.append(node('p','',`${trade.otherFarmName} · ${Number.isNaN(date.getTime())?'':date.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}`));
        card.append(copy,node('strong','',`${trade.side==='sell'?'+':'−'}${fmt(trade.totalPrice)} moedas`));history.append(card);
      }
    }
    this.updateForm();this.setLocked();this.renderPurchase();
  }
  list(container,listings,empty){
    container.replaceChildren();if(!listings.length){container.append(node('p','market-empty',empty));return;}
    for(const listing of listings){
      const card=node('article','market-card');card.dataset.listing=listing.id;
      const heading=node('div','market-card-head'),icon=document.createElement('canvas');icon.setAttribute('aria-hidden','true');drawIcon(icon,listing.item);
      const copy=node('div');copy.append(node('h3','',`${listing.quantity} × ${names[listing.item]}`),node('p','',listing.mine?'Sua fazenda':listing.sellerName));heading.append(icon,copy);card.append(heading);
      const price=node('div','market-card-price');price.append(node('span','',`${fmt(listing.unitPrice)} por unidade`),node('strong','',`${fmt(listing.totalPrice)} moedas`));card.append(price);
      if(listing.status==='active'){
        const button=node('button','button market-mutation',listing.mine?'Cancelar anúncio':'Ver lote');button.type='button';button.dataset.marketAction=listing.mine?'cancel':'buy';button.dataset.id=listing.id;
        button.setAttribute('aria-label',`${listing.mine?'Cancelar anúncio de':'Ver lote de'} ${listing.quantity} ${names[listing.item]}${listing.mine?'':' de '+listing.sellerName}`);card.append(button);
      }else{const badge=node('span','market-badge',listing.status==='sold'?'Vendido':'Cancelado');badge.dataset.status=listing.status;card.append(badge);}
      container.append(card);
    }
  }
  updateForm(changeItem=false){
    const item=$('sellItem').value,available=this.farm?.inventory.find(i=>i.item===item)?.quantity??0,rule=this.data?.rules.prices[item];
    const limit=this.data?.rules.maxQuantity??100;
    $('sellQuantity').max=String(Math.max(1,Math.min(limit,available)));
    if(changeItem){$('sellQuantity').value='1';if(rule)$('sellPrice').value=String(Math.max(rule.min,Math.min(rule.max,defaults[item])));}
    if(rule){$('sellPrice').min=rule.min;$('sellPrice').max=rule.max;}
    const quantity=Number($('sellQuantity').value),unitPrice=Number($('sellPrice').value);
    $('sellTotal').textContent=`${fmt(Number.isFinite(quantity*unitPrice)?quantity*unitPrice:0)} moedas`;
    $('sellAvailable').textContent=`No armazém: ${available}.${rule?' Preço permitido: '+rule.min+' a '+rule.max+' moedas por unidade.':''}`;
    this.setLocked();
  }
  setLocked(){
    const locked=this.context.locked(),snapshot=this.farm;
    const item=$('sellItem').value,available=snapshot?.inventory.find(i=>i.item===item)?.quantity??0,qty=Number($('sellQuantity').value),price=Number($('sellPrice').value),rule=this.data?.rules.prices[item];
    const active=this.data?.myListings.filter(l=>l.status==='active').length??0;
    $('sellSubmit').disabled=locked||!snapshot||!rule||!Number.isInteger(qty)||qty<1||qty>available||qty>this.data.rules.maxQuantity||!Number.isInteger(price)||price<rule.min||price>rule.max||active>=this.data.rules.maxActiveListings;
    for(const b of document.querySelectorAll('[data-market-action]')){
      const listings=b.dataset.marketAction==='buy'?this.data?.listings:this.data?.myListings;
      const listing=listings?.find(l=>l.id===b.dataset.id);
      b.disabled=locked||!listing||listing.status!=='active';
    }
    const current=this.data?.listings.find(l=>l.id===this.selected?.id);
    $('tradeConfirm').disabled=locked||!!this.tradeError||!this.canBuy(current);
    this.message();
  }
  message(){if(this.context.locked())$('marketMessage').textContent='Há uma ação aguardando confirmação. Acompanhe o aviso no topo da fazenda.';else if(this.data)$('marketMessage').textContent='Moedas do jogo · produtos reservados até a venda ou cancelamento.';}
  canBuy(listing){if(!listing||!this.farm||listing.mine||listing.status!=='active')return false;const used=this.farm.inventory.reduce((sum,i)=>sum+i.quantity,0)+this.farm.reservedCapacity;return this.farm.coins>=listing.totalPrice&&used+listing.quantity<=this.farm.farm.capacity;}
  purchaseDialog(id){if(this.context.locked()){this.message();return;}const listing=this.data?.listings.find(l=>l.id===id&&!l.mine);if(!listing)return;this.selected={...listing};this.tradeError='';this.renderPurchase();$('tradeDialog').showModal();}
  renderPurchase(){
    if(!this.selected)return;const latest=this.data?.listings.find(l=>l.id===this.selected.id);if(latest)this.selected={...latest};
    const l=this.selected;$('tradeTitle').textContent=`${l.quantity} × ${names[l.item]}`;$('tradeDescription').textContent=`Banca: ${l.sellerName}. O lote inteiro será entregue ao seu armazém.`;$('tradePrice').textContent=`${fmt(l.totalPrice)} moedas`;
    const used=(this.farm?.inventory.reduce((sum,i)=>sum+i.quantity,0)??0)+(this.farm?.reservedCapacity??0);
    const unavailable=!latest||latest.status!=='active';
    $('tradeMessage').textContent=this.tradeError||(unavailable?'Este lote já saiu da feira. Escolha outra oferta.':this.farm.coins<l.totalPrice?'Ainda faltam moedas para este lote.':used+l.quantity>this.farm.farm.capacity?'Seu armazém precisa de mais espaço para receber este lote.':'O pagamento e a entrega são concluídos juntos.');
    $('tradeConfirm').disabled=this.context.locked()||!!this.tradeError||unavailable||!this.canBuy(l);
  }
  async sell(){
    if(!$('sellForm').reportValidity()||this.context.locked())return;
    await this.context.command({type:'market_list',item:$('sellItem').value,quantity:Number($('sellQuantity').value),unitPrice:Number($('sellPrice').value)},'Lote anunciado. Os produtos ficaram reservados na sua banca.');
  }
  confirmed(command){if(command.type==='market_buy')$('tradeDialog').close();if(command.type==='market_list'){this.selectTab('mine');$('sellQuantity').value='1';}if(command.type.startsWith('market_'))void this.refresh(true);}
  failed(command,message,farmId){
    if(this.farm?.farm.id!==farmId)return;
    if(command.type==='market_buy'&&this.selected?.id===command.listingId){this.tradeError=message;this.renderPurchase();}
    void this.refresh(true);
  }
}
