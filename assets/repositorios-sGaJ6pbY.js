import{b as C}from"./index-CubMQrjb.js";import{B,o as $,c as I,m as b,a as T,av as l,aw as u,ax as y,ay as _,az as f,aA as O}from"./index-D4yXbplw.js";var M=`
    .p-progressspinner {
        position: relative;
        margin: 0 auto;
        width: 100px;
        height: 100px;
        display: inline-block;
    }

    .p-progressspinner::before {
        content: '';
        display: block;
        padding-top: 100%;
    }

    .p-progressspinner-spin {
        height: 100%;
        transform-origin: center center;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        animation: p-progressspinner-rotate 2s linear infinite;
    }

    .p-progressspinner-circle {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: 0;
        stroke: dt('progressspinner.colorOne');
        animation:
            p-progressspinner-dash 1.5s ease-in-out infinite,
            p-progressspinner-color 6s ease-in-out infinite;
        stroke-linecap: round;
    }

    @keyframes p-progressspinner-rotate {
        100% {
            transform: rotate(360deg);
        }
    }
    @keyframes p-progressspinner-dash {
        0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
        }
        100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
        }
    }
    @keyframes p-progressspinner-color {
        100%,
        0% {
            stroke: dt('progressspinner.color.one');
        }
        40% {
            stroke: dt('progressspinner.color.two');
        }
        66% {
            stroke: dt('progressspinner.color.three');
        }
        80%,
        90% {
            stroke: dt('progressspinner.color.four');
        }
    }
`,N={root:"p-progressspinner",spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},P=B.extend({name:"progressspinner",style:M,classes:N}),z={name:"BaseProgressSpinner",extends:C,props:{strokeWidth:{type:String,default:"2"},fill:{type:String,default:"none"},animationDuration:{type:String,default:"2s"}},style:P,provide:function(){return{$pcProgressSpinner:this,$parentInstance:this}}},A={name:"ProgressSpinner",extends:z,inheritAttrs:!1,computed:{svgStyle:function(){return{"animation-duration":this.animationDuration}}}},E=["fill","stroke-width"];function j(t,n,e,s,r,i){return $(),I("div",b({class:t.cx("root"),role:"progressbar"},t.ptmi("root")),[($(),I("svg",b({class:t.cx("spin"),viewBox:"25 25 50 50",style:i.svgStyle},t.ptm("spin")),[T("circle",b({class:t.cx("circle"),cx:"50",cy:"50",r:"20",fill:t.fill,"stroke-width":t.strokeWidth,strokeMiterlimit:"10"},t.ptm("circle")),null,16,E)],16))],16)}A.render=j;function w(){try{const t=localStorage.getItem("fc_auth");if(t)return JSON.parse(t).username||null}catch{}return null}function S(t,n){const e=w();return{_id:`${t}_${f()}`,type:t,usuario_id:e,created_at:new Date().toISOString(),...n}}function m(t){const n=w();return n?{...t,usuario_id:n}:t}const G={async listar(){return _(m({type:"cuenta"}))},async crear(t){const n=S("cuenta",{activa:!0,saldo_inicial:0,moneda:"PEN",...t});return y(n)},async actualizar(t,n){const e=await l(t);return u({...e,...n,updated_at:new Date().toISOString()})},async eliminar(t){const n=await l(t);return u({...n,activa:!1,updated_at:new Date().toISOString()})}},W=[{nombre:"Alimentación",icono:"pi-shopping-cart",color:"#f59e0b",tipo_transaccion:"gasto"},{nombre:"Transporte",icono:"pi-car",color:"#3b82f6",tipo_transaccion:"gasto"},{nombre:"Entretenimiento",icono:"pi-star",color:"#8b5cf6",tipo_transaccion:"gasto"},{nombre:"Salud",icono:"pi-heart",color:"#ef4444",tipo_transaccion:"gasto"},{nombre:"Servicios",icono:"pi-bolt",color:"#06b6d4",tipo_transaccion:"gasto"},{nombre:"Educación",icono:"pi-book",color:"#10b981",tipo_transaccion:"gasto"},{nombre:"Ropa",icono:"pi-shopping-bag",color:"#f97316",tipo_transaccion:"gasto"},{nombre:"Hogar",icono:"pi-home",color:"#64748b",tipo_transaccion:"gasto"},{nombre:"Salario",icono:"pi-wallet",color:"#10b981",tipo_transaccion:"ingreso"},{nombre:"Freelance",icono:"pi-briefcase",color:"#6366f1",tipo_transaccion:"ingreso"},{nombre:"Otros ingresos",icono:"pi-plus-circle",color:"#84cc16",tipo_transaccion:"ingreso"}],R={async listar(){return _(m({type:"categoria"}))},async crear(t){const n=S("categoria",{activa:!0,icono:"pi-tag",color:"#6366f1",tipo_transaccion:"gasto",...t});return y(n)},async actualizar(t,n){const e=await l(t);return u({...e,...n,updated_at:new Date().toISOString()})},async eliminar(t){const n=await l(t);return u({...n,activa:!1,updated_at:new Date().toISOString()})},async seed(){if(!((await this.listar()).length>0))for(const n of W)await this.crear(n)}},H={async listar(t={}){const n=m({type:"transaccion",...t});return(await _(n)).sort((s,r)=>(r.fecha||"").localeCompare(s.fecha||""))},async crear(t){if(t.es_tarjeta_credito&&t.cuotas>1)return this._crearConCuotas(t);const n=S("transaccion",{estado:"activo",cuotas:1,cuota_actual:1,es_tarjeta_credito:!1,transaccion_padre_id:null,nota:"",tags:[],...t,monto:Number(t.monto)});return y(n)},async _crearConCuotas(t){const n=`transaccion_${f()}`,e=Math.round(Number(t.monto)/t.cuotas),s=new Date(t.fecha),r=[];r.push({_id:n,type:"transaccion",...t,monto:Number(t.monto),monto_cuota:e,transaccion_padre_id:null,estado:"activo",created_at:new Date().toISOString()});for(let i=0;i<t.cuotas;i++){const p=new Date(s);p.setMonth(p.getMonth()+i),r.push({_id:`transaccion_${f()}`,type:"transaccion",tipo:t.tipo,monto:e,descripcion:`${t.descripcion} (${i+1}/${t.cuotas})`,categoria_id:t.categoria_id,cuenta_id:t.cuenta_id,fecha:p.toISOString().slice(0,10),mes_corte:p.toISOString().slice(0,7),es_tarjeta_credito:!0,cuotas:t.cuotas,cuota_actual:i+1,transaccion_padre_id:n,estado:"pendiente",nota:t.nota||"",tags:t.tags||[],created_at:new Date().toISOString()})}return await O(r),r},async actualizar(t,n){const e=await l(t);return u({...e,...n,updated_at:new Date().toISOString()})},async eliminar(t){const n=await l(t);return u({...n,_deleted:!0})},async resumen(t,n){const e=`${n}-${String(t).padStart(2,"0")}`,s=await _({type:"transaccion"}),r=s.filter(o=>{var a;return((a=o.fecha)==null?void 0:a.startsWith(e))&&!o._deleted}),i=r.filter(o=>o.tipo==="ingreso").reduce((o,a)=>o+(a.monto||0),0),p=r.filter(o=>o.tipo==="gasto").reduce((o,a)=>o+(a.monto||0),0),d={};for(const o of r.filter(a=>a.tipo==="gasto")){const a=o.categoria_id||"sin-categoria";d[a]=(d[a]||0)+(o.monto||0)}const h=[];for(let o=5;o>=0;o--){let a=t-o,k=n;a<=0&&(a+=12,k--);const v=`${k}-${String(a).padStart(2,"0")}`,D=s.filter(c=>{var g;return((g=c.fecha)==null?void 0:g.startsWith(v))&&!c._deleted});h.push({mes:v,ingresos:D.filter(c=>c.tipo==="ingreso").reduce((c,g)=>c+(g.monto||0),0),gastos:D.filter(c=>c.tipo==="gasto").reduce((c,g)=>c+(g.monto||0),0)})}const x=[...s].filter(o=>!o._deleted).sort((o,a)=>(a.fecha||"").localeCompare(o.fecha||"")).slice(0,5);return{ingresos:i,gastos:p,balance:i-p,porCategoria:d,evolucion:h,recientes:x}},async calcularSaldos(){const t=await _(m({type:"transaccion"})),n={};for(const e of t.filter(s=>!s._deleted))e.cuenta_id&&(n[e.cuenta_id]||(n[e.cuenta_id]=0),n[e.cuenta_id]+=e.tipo==="ingreso"?e.monto||0:-(e.monto||0));return n},async crearTransferencia({cuenta_origen:t,cuenta_destino:n,monto:e,fecha:s,nota:r}){const i=w(),p=`tx_par_${f()}`,d={type:"transaccion",usuario_id:i,es_transferencia:!0,transferencia_par_id:p,cuotas:1,cuota_actual:1,es_tarjeta_credito:!1,monto:Number(e),fecha:s,nota:r||"",tags:[],created_at:new Date().toISOString()},h=[{...d,_id:`transaccion_${f()}`,tipo:"gasto",cuenta_id:t,descripcion:"Transferencia → cuenta"},{...d,_id:`transaccion_${f()}`,tipo:"ingreso",cuenta_id:n,descripcion:"Transferencia ← cuenta"}];return await O(h),h}},J={async listar(t,n){const e=m(t&&n?{type:"presupuesto",mes:t,anio:n}:{type:"presupuesto"});return _(e)},async crear(t){const n=S("presupuesto",{monto_limite:0,...t});return y(n)},async actualizar(t,n){const e=await l(t);return u({...e,...n,updated_at:new Date().toISOString()})},async eliminar(t){const n=await l(t);return u({...n,_deleted:!0})},async conGastos(t,n,e={}){return(await this.listar(t,n)).map(r=>({...r,gastado:e[r.categoria_id]||0,pct:r.monto_limite>0?Math.min(100,Math.round((e[r.categoria_id]||0)/r.monto_limite*100)):0}))}};export{G as C,J as P,H as T,R as a,A as s};
