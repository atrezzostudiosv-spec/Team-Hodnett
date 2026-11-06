import test from 'node:test';
import assert from 'node:assert/strict';
import {interpretQuestion,findWebsiteAnswers} from '../public/src/assistant-core.mjs';
import {searchProperties} from '../public/src/search-core.mjs';
const rows=[
 {title:'101 Oak Lane',city:'Argyle',address:'101 Oak Lane, Argyle',status:'For Sale',beds:4,price:850000,has_pool:true,search_text:'bright home',id:'101',zip:'76226'},
 {title:'201 Oak Lane',city:'Argyle',address:'201 Oak Lane, Argyle',status:'Sold',beds:3,price:null,has_pool:false,search_text:'historical sale',id:'201',zip:'76226'},
 {title:'100 Hillside Drive',city:'Southlake',address:'100 Hillside Drive, Southlake',status:'For Sale',beds:5,price:1400000,has_pool:true,search_text:'modern home',id:'100',zip:'76092'}
];
test('Spanish spoken request for Argyle returns all archived and active city properties',()=>{
 const query=interpretQuestion('Busco casas en Argyle',rows);
 assert.equal(query.kind,'properties');assert.equal(query.city,'Argyle');assert.equal(query.status,'');
 const results=searchProperties(rows,query);
 assert.deepEqual(results.map(p=>p.title).sort(),['101 Oak Lane','201 Oak Lane']);
});
test('English voice search narrows city, beds, pool, price and sale status',()=>{
 const query=interpretQuestion('Show me 4 bedroom homes in Argyle with a pool under $1m for sale',rows);
 assert.equal(query.beds,4);assert.equal(query.pool,true);assert.equal(query.maxPrice,1000000);assert.equal(query.status,'For Sale');
 assert.deepEqual(searchProperties(rows,query).map(p=>p.title),['101 Oak Lane']);
});
test('Unrecognized city Argyle remains a strict location filter when no Argyle records are present',()=>{
 const query=interpretQuestion('Show homes in Argyle',rows.slice(2));
 assert.equal(query.city,'Argyle');
 assert.deepEqual(searchProperties(rows.slice(2),query),[]);
});
test('Questions about people consult website knowledge and never invent answers',()=>{
 const query=interpretQuestion('Who is Sharon Hodnett?',rows);
 assert.equal(query.kind,'knowledge');
 const answers=findWebsiteAnswers('Sharon Hodnett',[{title:'Meet Sharon Hodnett',description:'Real estate in Southlake',text:'Sharon Hodnett works with buyers and sellers',href:'about/',type:'The team'}]);
 assert.equal(answers[0].entry.href,'about/');
 assert.deepEqual(findWebsiteAnswers('unrelated galaxies',[]),[]);
});
