import{s as B,c as F,o as R}from"../chunks/scheduler.JgTxvg8Y.js";import{S as j,i as L,e as u,o as M,s as z,t as A,c as p,a as g,p as N,d as f,f as E,q as P,b as D,l as b,g as O,h as s,r as U,u as G,j as J,m as K,n as Q,v as W}from"../chunks/index.natcDwZ0.js";import{H as X,A as Y,I as Z,m as tt,a as et}from"../chunks/head.9VgDrf0p.js";class st{static isReady(){return!!globalThis.window.opener}}function at(l){let t,n,o,m,e,i,_="Logged-in with success!",x,d,w,q,y,I,v,c,T="Close",h,S,V;return o=new X({props:{status:Y.Success}}),{c(){t=u("div"),n=u("div"),M(o.$$.fragment),m=z(),e=u("div"),i=u("p"),i.textContent=_,x=z(),d=u("p"),w=A("Auto closing in "),q=A(l[0]),y=A("..."),I=z(),v=u("div"),c=u("button"),c.textContent=T,this.h()},l(a){t=p(a,"DIV",{class:!0});var r=g(t);n=p(r,"DIV",{class:!0});var k=g(n);N(o.$$.fragment,k),k.forEach(f),m=E(r),e=p(r,"DIV",{class:!0});var C=g(e);i=p(C,"P",{"data-svelte-h":!0}),P(i)!=="svelte-1hmuaiw"&&(i.textContent=_),x=E(C),d=p(C,"P",{});var $=g(d);w=D($,"Auto closing in "),q=D($,l[0]),y=D($,"..."),$.forEach(f),C.forEach(f),I=E(r),v=p(r,"DIV",{class:!0});var H=g(v);c=p(H,"BUTTON",{class:!0,"data-svelte-h":!0}),P(c)!=="svelte-1apmqqb"&&(c.textContent=T),H.forEach(f),r.forEach(f),this.h()},h(){b(n,"class","success__head svelte-qzo6p4"),b(e,"class","success__body svelte-qzo6p4"),b(c,"class","success__btn svelte-qzo6p4"),b(v,"class","success__foot svelte-qzo6p4"),b(t,"class","success svelte-qzo6p4")},m(a,r){O(a,t,r),s(t,n),U(o,n,null),s(t,m),s(t,e),s(e,i),s(e,x),s(e,d),s(d,w),s(d,q),s(d,y),s(t,I),s(t,v),s(v,c),h=!0,S||(V=G(c,"click",l[1]),S=!0)},p(a,[r]){(!h||r&1)&&J(q,a[0])},i(a){h||(K(o.$$.fragment,a),h=!0)},o(a){Q(o.$$.fragment,a),h=!1},d(a){a&&f(t),W(o),S=!1,V()}}}const nt=1e3;function ot(l,t,n){let o,m;F(l,et,_=>n(3,m=_));let e=3;const i=()=>{st.isReady()&&Z.send(tt.AuthSucceded,{token:m.token}),window.close()};return R(()=>{const _=setInterval(()=>{n(2,--e)===0&&(i(),clearInterval(_))},nt)}),l.$$.update=()=>{l.$$.dirty&4&&n(0,o=`${e} second${e===1?"":"s"}`)},[o,i,e]}class ct extends j{constructor(t){super(),L(this,t,ot,at,B,{})}}export{ct as component};
