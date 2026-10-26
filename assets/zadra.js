(() => {
  'use strict';
  function initialize(root = document) {
    root.querySelectorAll('[data-scroll]').forEach(button => {
      if (button.dataset.bound) return; button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const rail = document.getElementById(button.dataset.target);
        rail?.scrollBy({left: Number(button.dataset.scroll) * rail.clientWidth * .8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      });
    });
    root.querySelectorAll('[data-rail]').forEach(rail => {
      if(rail.dataset.bound) return; rail.dataset.bound='true';
      const update=()=>document.querySelectorAll('[data-target="'+rail.id+'"]').forEach(b=>{b.disabled=Number(b.dataset.scroll)<0?rail.scrollLeft<2:rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2;});
      rail.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(rail);update();
    });
    root.querySelectorAll('[data-gallery-image]').forEach(link => {
      if (link.dataset.bound) return; link.dataset.bound = 'true';
      link.addEventListener('click', event => {
        const image = link.closest('.product-gallery').querySelector('.main-media img'); if (!image) return;
        event.preventDefault(); image.src = link.dataset.galleryImage; image.removeAttribute('srcset'); image.alt = link.dataset.galleryAlt || '';
        link.parentElement.querySelectorAll('a').forEach(a=>a.removeAttribute('aria-current'));link.setAttribute('aria-current','true');
      });
    });
    root.querySelectorAll('[data-variant-select]').forEach(select => {
      if (select.dataset.bound) return; select.dataset.bound='true';
      const info=select.closest('.product-info'), data=info.querySelector('[data-variants]'); if(!data)return;
      let variants;try{variants=JSON.parse(data.textContent);}catch{return;}
      select.addEventListener('change',()=>{
        const v=variants.find(v=>String(v.id)===select.value);if(!v)return;
        info.querySelector('[data-product-price]').textContent=v.price;
        const compare=info.querySelector('[data-compare-price]');compare.textContent=v.compare;compare.hidden=!v.sale;
        const add=info.querySelector('[data-add-to-cart]');add.disabled=!v.available;add.textContent=v.available?'Agregar a la bolsa':'Agotado';info.querySelector('[data-stock]').textContent=v.available?'Disponible':'Agotado';
        const qty=info.querySelector('[name="quantity"]');qty.min=v.min;qty.step=v.step;if(v.max!=null)qty.max=v.max;else qty.removeAttribute('max');qty.value=v.min;
        const image=select.closest('.product-detail').querySelector('.main-media img');if(v.image&&image){image.src=v.image;image.removeAttribute('srcset');}
        const url=new URL(location.href);url.searchParams.set('variant',v.id);history.replaceState(null,'',url);
        const live=document.getElementById('LiveStatus');if(live)live.textContent=select.selectedOptions[0].textContent;
      });
    });
    root.querySelectorAll('.product-form').forEach(form=>{
      if(form.dataset.bound)return;form.dataset.bound='true';
      form.addEventListener('submit',async event=>{
        if(!window.Shopify?.routes?.root)return; // Native form stays usable without Shopify JS context.
        event.preventDefault();const button=form.querySelector('[data-add-to-cart]'),status=form.querySelector('.form-feedback');
        if(button.disabled)return;button.disabled=true;button.setAttribute('aria-busy','true');const original=button.textContent;button.textContent='Agregando…';status.textContent='';
        try{const response=await fetch(window.Shopify.routes.root+'cart/add.js',{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});const data=await response.json();if(!response.ok)throw new Error(data.description||'No pudimos agregar el producto. Revisá la disponibilidad.');location.assign(window.Shopify.routes.root+'cart');}
        catch(error){status.textContent=error.message||'No pudimos confirmar la operación. Revisá tu bolsa antes de volver a intentar.';}
        finally{button.disabled=false;button.removeAttribute('aria-busy');button.textContent=original;}
      });
    });
  }
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.querySelectorAll('.site-header details[open]').forEach(d=>{d.open=false;d.querySelector('summary')?.focus();});}});
  document.addEventListener('click',event=>document.querySelectorAll('.site-header details[open]').forEach(d=>{if(!d.contains(event.target)||event.target.closest('a'))d.open=false;}));
  document.addEventListener('shopify:section:load',event=>initialize(event.target));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>initialize());else initialize();
})();
