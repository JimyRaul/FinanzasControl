import{B as q,o as u,c,k as I,m as _,l as J,f as y,j as K,a as t,t as b,_ as W,a3 as H,a4 as Q,J as R,b as r,d as s,F as E,A as X,g as Y,E as C,M as Z,C as N,w as ee,r as z}from"./index-D4yXbplw.js";import{b as te,f as ae,s as v}from"./index-CubMQrjb.js";import{b as oe,a as ie}from"./index-B7kpHtsI.js";import{s as ne}from"./index-Dd3LGBax.js";import{s as V}from"./index-BZDK8OqM.js";import{a as h}from"./index-Bv36is8d.js";import{s as se}from"./repositorios-sGaJ6pbY.js";import{u as le}from"./cuentas-Dy5VC7lv.js";import"./index-DEf-bt_W.js";var re=`
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: dt('tag.primary.background');
        color: dt('tag.primary.color');
        font-size: dt('tag.font.size');
        font-weight: dt('tag.font.weight');
        padding: dt('tag.padding');
        border-radius: dt('tag.border.radius');
        gap: dt('tag.gap');
    }

    .p-tag-icon {
        font-size: dt('tag.icon.size');
        width: dt('tag.icon.size');
        height: dt('tag.icon.size');
    }

    .p-tag-rounded {
        border-radius: dt('tag.rounded.border.radius');
    }

    .p-tag-success {
        background: dt('tag.success.background');
        color: dt('tag.success.color');
    }

    .p-tag-info {
        background: dt('tag.info.background');
        color: dt('tag.info.color');
    }

    .p-tag-warn {
        background: dt('tag.warn.background');
        color: dt('tag.warn.color');
    }

    .p-tag-danger {
        background: dt('tag.danger.background');
        color: dt('tag.danger.color');
    }

    .p-tag-secondary {
        background: dt('tag.secondary.background');
        color: dt('tag.secondary.color');
    }

    .p-tag-contrast {
        background: dt('tag.contrast.background');
        color: dt('tag.contrast.color');
    }
`,de={root:function(i){var d=i.props;return["p-tag p-component",{"p-tag-info":d.severity==="info","p-tag-success":d.severity==="success","p-tag-warn":d.severity==="warn","p-tag-danger":d.severity==="danger","p-tag-secondary":d.severity==="secondary","p-tag-contrast":d.severity==="contrast","p-tag-rounded":d.rounded}]},icon:"p-tag-icon",label:"p-tag-label"},ue=q.extend({name:"tag",style:re,classes:de}),ce={name:"BaseTag",extends:te,props:{value:null,severity:null,rounded:Boolean,icon:String},style:ue,provide:function(){return{$pcTag:this,$parentInstance:this}}};function k(a){"@babel/helpers - typeof";return k=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(i){return typeof i}:function(i){return i&&typeof Symbol=="function"&&i.constructor===Symbol&&i!==Symbol.prototype?"symbol":typeof i},k(a)}function pe(a,i,d){return(i=me(i))in a?Object.defineProperty(a,i,{value:d,enumerable:!0,configurable:!0,writable:!0}):a[i]=d,a}function me(a){var i=ge(a,"string");return k(i)=="symbol"?i:i+""}function ge(a,i){if(k(a)!="object"||!a)return a;var d=a[Symbol.toPrimitive];if(d!==void 0){var p=d.call(a,i);if(k(p)!="object")return p;throw new TypeError("@@toPrimitive must return a primitive value.")}return(i==="string"?String:Number)(a)}var T={name:"Tag",extends:ce,inheritAttrs:!1,computed:{dataP:function(){return ae(pe({rounded:this.rounded},this.severity,this.severity))}}},fe=["data-p"];function ve(a,i,d,p,m,g){return u(),c("span",_({class:a.cx("root"),"data-p":g.dataP},a.ptmi("root")),[a.$slots.icon?(u(),I(J(a.$slots.icon),_({key:0,class:a.cx("icon")},a.ptm("icon")),null,16,["class"])):a.icon?(u(),c("span",_({key:1,class:[a.cx("icon"),a.icon]},a.ptm("icon")),null,16)):y("",!0),a.value!=null||a.$slots.default?K(a.$slots,"default",{key:2},function(){return[t("span",_({class:a.cx("label")},a.ptm("label")),b(a.value),17)]}):y("",!0)],16,fe)}T.render=ve;const be={class:"page-header"},ye={key:0,class:"loading-center"},ke={key:1,class:"empty-state card"},_e={key:2,class:"cuentas-grid"},Ce={class:"cuenta-top"},Ve={class:"cuenta-icon"},$e={class:"cuenta-acciones"},we={class:"cuenta-nombre"},Se={class:"cuenta-tipo"},Pe={key:0,class:"cuenta-limite"},je={class:"cuenta-saldo"},Ee={class:"cuenta-moneda text-muted"},Ne={class:"field"},ze={key:0,class:"error"},he={class:"field"},Te={class:"field"},xe={class:"field"},De={class:"field-row"},Oe={class:"field"},Ue={class:"field"},Ae={class:"field"},Be={class:"dialog-footer"},Le={__name:"CuentasView",setup(a){const i=le(),d=H(),p=Q(),m=C(!1),g=C(!1),$=C(!1),w=C(null),x=[{label:"Efectivo",value:"efectivo"},{label:"Cuenta de Débito",value:"debito"},{label:"Tarjeta de Crédito",value:"credito"}],S=()=>({nombre:"",tipo:"debito",moneda:"PEN",limite_credito:0,dia_corte:15,dia_pago:5,saldo_inicial:0}),l=z(S()),f=z({});R(()=>i.cargar());function P(){g.value=!1,w.value=null,Object.assign(l,S()),Object.assign(f,{}),m.value=!0}function D(o){g.value=!0,w.value=o,Object.assign(l,{nombre:o.nombre,tipo:o.tipo,moneda:o.moneda||"COP",limite_credito:o.limite_credito||0,dia_corte:o.dia_corte||15,dia_pago:o.dia_pago||5,saldo_inicial:o.saldo_inicial||0}),Object.assign(f,{}),m.value=!0}function O(){return Object.assign(f,{}),l.nombre.trim()||(f.nombre="El nombre es requerido"),Object.keys(f).length===0}async function U(){if(O()){$.value=!0;try{const o={...l};l.tipo!=="credito"&&(delete o.limite_credito,delete o.dia_corte,delete o.dia_pago),g.value?(await i.actualizar(w.value._id,o),p.add({severity:"success",summary:"Cuenta actualizada",life:3e3})):(await i.crear(o),p.add({severity:"success",summary:"Cuenta creada",life:3e3})),m.value=!1}catch(o){p.add({severity:"error",summary:"Error",detail:o.message,life:5e3})}finally{$.value=!1}}}function A(o){d.require({message:`¿Desactivar la cuenta "${o.nombre}"?`,header:"Confirmar",icon:"pi pi-exclamation-triangle",acceptLabel:"Sí, desactivar",rejectLabel:"Cancelar",acceptClass:"p-button-danger",accept:async()=>{await i.eliminar(o._id),p.add({severity:"info",summary:"Cuenta desactivada",life:3e3})}})}const B=o=>({efectivo:"pi-money-bill",debito:"pi-building-columns",credito:"pi-credit-card"})[o]||"pi-wallet",L=o=>({efectivo:"#10b981",debito:"#6366f1",credito:"#f59e0b"})[o]||"#94a3b8",F=o=>({efectivo:"Efectivo",debito:"Débito",credito:"Crédito"})[o]||o,G=o=>({efectivo:"success",debito:"info",credito:"warn"})[o]||"secondary",j=o=>o!=null?`S/ ${Number(o).toLocaleString("es-PE",{minimumFractionDigits:2,maximumFractionDigits:2})}`:"S/ 0.00";return(o,e)=>(u(),c("div",null,[t("div",be,[e[9]||(e[9]=t("div",null,[t("h1",{class:"page-title"},"Cuentas"),t("p",{class:"page-subtitle"},"Administra tus cuentas de efectivo, débito y tarjetas de crédito")],-1)),r(s(v),{label:"Nueva cuenta",icon:"pi pi-plus",onClick:P})]),s(i).cargando?(u(),c("div",ye,[r(s(se),{strokeWidth:"3"})])):s(i).cuentasActivas.length===0?(u(),c("div",ke,[e[10]||(e[10]=t("i",{class:"pi pi-credit-card empty-icon"},null,-1)),e[11]||(e[11]=t("p",{class:"empty-title"},"No tienes cuentas registradas",-1)),e[12]||(e[12]=t("p",{class:"empty-sub"},"Agrega tu primera cuenta para empezar a registrar movimientos",-1)),r(s(v),{label:"Agregar cuenta",icon:"pi pi-plus",onClick:P,class:"mt-4"})])):(u(),c("div",_e,[(u(!0),c(E,null,X(s(i).cuentasActivas,n=>(u(),c("div",{key:n._id,class:"cuenta-card card",style:Z(`--accent: ${L(n.tipo)}`)},[t("div",Ce,[t("div",Ve,[t("i",{class:N(["pi",B(n.tipo)])},null,2)]),t("div",$e,[r(s(v),{icon:"pi pi-pencil",text:"",rounded:"",size:"small",onClick:M=>D(n)},null,8,["onClick"]),r(s(v),{icon:"pi pi-trash",text:"",rounded:"",size:"small",severity:"danger",onClick:M=>A(n)},null,8,["onClick"])])]),t("div",we,b(n.nombre),1),t("div",Se,[r(s(T),{value:F(n.tipo),severity:G(n.tipo)},null,8,["value","severity"])]),n.tipo==="credito"?(u(),c("div",Pe,[e[13]||(e[13]=t("span",{class:"text-muted"},"Límite:",-1)),t("span",null,b(j(n.limite_credito)),1)])):y("",!0),t("div",je,[e[14]||(e[14]=t("span",{class:"text-muted",style:{"font-size":"0.72rem"}},"Saldo actual",-1)),t("span",{class:N(["saldo-valor",s(i).saldoCuenta(n._id)>=0?"text-success":"text-danger"])},b(j(s(i).saldoCuenta(n._id))),3)]),t("div",Ee,b(n.moneda||"PEN"),1)],4))),128))])),r(s(oe),{visible:m.value,"onUpdate:visible":e[8]||(e[8]=n=>m.value=n),header:g.value?"Editar cuenta":"Nueva cuenta",style:{width:"440px"},modal:"",draggable:!1},{default:Y(()=>[t("form",{onSubmit:ee(U,["prevent"]),class:"dialog-form"},[t("div",Ne,[e[15]||(e[15]=t("label",null,"Nombre *",-1)),r(s(ne),{modelValue:l.nombre,"onUpdate:modelValue":e[0]||(e[0]=n=>l.nombre=n),placeholder:"ej. Visa Gold, Cuenta Nómina",fluid:""},null,8,["modelValue"]),f.nombre?(u(),c("small",ze,b(f.nombre),1)):y("",!0)]),t("div",he,[e[16]||(e[16]=t("label",null,"Tipo *",-1)),r(s(h),{modelValue:l.tipo,"onUpdate:modelValue":e[1]||(e[1]=n=>l.tipo=n),options:x,optionLabel:"label",optionValue:"value",placeholder:"Selecciona el tipo",fluid:""},null,8,["modelValue"])]),t("div",Te,[e[17]||(e[17]=t("label",null,"Moneda",-1)),r(s(h),{modelValue:l.moneda,"onUpdate:modelValue":e[2]||(e[2]=n=>l.moneda=n),options:["PEN","USD"],placeholder:"PEN",fluid:""},null,8,["modelValue"])]),l.tipo==="credito"?(u(),c(E,{key:0},[t("div",xe,[e[18]||(e[18]=t("label",null,"Límite de crédito",-1)),r(s(V),{modelValue:l.limite_credito,"onUpdate:modelValue":e[3]||(e[3]=n=>l.limite_credito=n),mode:"decimal",min:0,useGrouping:!0,placeholder:"5,000,000",fluid:""},null,8,["modelValue"])]),t("div",De,[t("div",Oe,[e[19]||(e[19]=t("label",null,"Día de corte",-1)),r(s(V),{modelValue:l.dia_corte,"onUpdate:modelValue":e[4]||(e[4]=n=>l.dia_corte=n),min:1,max:31,fluid:""},null,8,["modelValue"])]),t("div",Ue,[e[20]||(e[20]=t("label",null,"Día de pago",-1)),r(s(V),{modelValue:l.dia_pago,"onUpdate:modelValue":e[5]||(e[5]=n=>l.dia_pago=n),min:1,max:31,fluid:""},null,8,["modelValue"])])])],64)):y("",!0),t("div",Ae,[e[21]||(e[21]=t("label",null,"Saldo inicial",-1)),r(s(V),{modelValue:l.saldo_inicial,"onUpdate:modelValue":e[6]||(e[6]=n=>l.saldo_inicial=n),mode:"decimal",useGrouping:!0,placeholder:"0",fluid:""},null,8,["modelValue"])]),t("div",Be,[r(s(v),{label:"Cancelar",severity:"secondary",text:"",onClick:e[7]||(e[7]=n=>m.value=!1)}),r(s(v),{label:g.value?"Guardar cambios":"Crear cuenta",icon:"pi pi-check",type:"submit",loading:$.value},null,8,["label","loading"])])],32)]),_:1},8,["visible","header"]),r(s(ie))]))}},Qe=W(Le,[["__scopeId","data-v-5370741f"]]);export{Qe as default};
