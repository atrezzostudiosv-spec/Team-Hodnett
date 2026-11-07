import test from 'node:test';
import assert from 'node:assert/strict';
import {detectAssistantLanguage,resolveAssistantDestination} from '../public/src/assistant-navigation.mjs';

const properties=[
 {id:'a1',title:'10029 Lakeside Drive',address:'10029 Lakeside Dr, Fort Worth',city:'Fort Worth',status:'For Sale',beds:4,price:800000,has_pool:false,zip:'76179',search_text:''},
 {id:'a2',title:'101 Oak Lane',address:'101 Oak Lane, Argyle',city:'Argyle',status:'For Sale',beds:4,price:850000,has_pool:true,zip:'76226',search_text:''},
 {id:'a3',title:'201 Oak Lane',address:'201 Oak Lane, Argyle',city:'Argyle',status:'Sold',beds:3,price:null,has_pool:false,zip:'76226',search_text:''},
 {id:'a4',title:'100 Hillside Drive',address:'100 Hillside Drive, Southlake',city:'Southlake',status:'For Sale',beds:5,price:1400000,has_pool:true,zip:'76092',search_text:''}
];
const entries=[
 {type:'Community guide',title:'Westlake',description:'Westlake community',text:'Westlake Texas neighborhoods',href:'neighborhoods/westlake/'},
 {type:'Community guide',title:'Southlake',description:'Explore Southlake',text:'Southlake lifestyle',href:'neighborhoods/southlake/'},
 {type:'The team',title:'Meet Sharon Hodnett',description:'Sharon Hodnett',text:'Real estate team',href:'about/'}
];
const route=(q,lang='en-US')=>resolveAssistantDestination(q,properties,entries,'/Team-Hodnett/',lang);

test('spoken Spanish property search returns a single filtered link, not cards',()=>{
 const result=route('Busco casas en Argyle');
 assert.equal(result.language,'es');
 assert.equal(result.kind,'homes');
 assert.match(result.href,/^\/Team-Hodnett\/homes\/\?/);
 assert.match(result.href,/city=Argyle/);
 assert.match(result.href,/status=/);
 assert.equal(result.matchCount,2);
 assert.equal(result.label,'Ver propiedades');
});
test('community-only request opens its guide, rather than an arbitrary property',()=>{
 const result=route('Tell me about Westlake');
 assert.equal(result.kind,'community');
 assert.equal(result.href,'/Team-Hodnett/neighborhoods/westlake/');
});
test('specific address navigates directly to its listing even with abbreviated street type',()=>{
 const result=route('Quiero ver la propiedad 10029 Lakeside Dr');
 assert.equal(result.kind,'property');
 assert.equal(result.href,'/Team-Hodnett/properties/a1/');
 assert.equal(result.language,'es');
});
test('unique street name is a direct property request',()=>{
 const result=route('Lakeside Drive');
 assert.equal(result.kind,'property');
 assert.equal(result.href,'/Team-Hodnett/properties/a1/');
});
test('price and city request retains parameters on the destination page',()=>{
 const result=route('Show me 4 bedroom homes in Argyle with a pool under $1m for sale');
 assert.equal(result.kind,'homes');
 const url=new URL(result.href,'https://example.test');
 assert.equal(url.searchParams.get('city'),'Argyle');
 assert.equal(url.searchParams.get('status'),'For Sale');
 assert.equal(url.searchParams.get('beds'),'4');
 assert.equal(url.searchParams.get('pool'),'1');
 assert.equal(url.searchParams.get('max'),'1000000');
 assert.equal(result.matchCount,1);
});
test('team questions link to the grounded website page',()=>{
 const result=route('Who is Sharon Hodnett?');
 assert.equal(result.kind,'page');
 assert.equal(result.href,'/Team-Hodnett/about/');
});
test('speech reply language inferred from recognized question, otherwise browser locale',()=>{
 assert.equal(detectAssistantLanguage('Quiero casas en Southlake','en-US'),'es');
 assert.equal(detectAssistantLanguage('Show homes in Southlake','es-ES'),'en');
 assert.equal(detectAssistantLanguage('Westlake','es-ES'),'es');
});
