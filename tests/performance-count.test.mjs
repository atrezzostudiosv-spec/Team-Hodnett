import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCountValue} from '../public/src/performance-count.mjs';

test('all nine original archived numeric formats count without changing their final meaning',()=>{
 const samples=[
  ['30+',30,'0+'],
  ['$2.3 Billion',2.3,'$0.0 Billion'],
  ['1,750 +',1750,'0 +'],
  ['1.0%',1,'0.0%'],
  ['$1.5 M',1.5,'$0.0 M'],
  ['9 Yrs',9,'0 Yrs'],
  ['4th',4,'0th'],
  ['1st',1,'0st'],
  ['5,000',5000,'0']
 ];
 for(const [original,target,start] of samples){
  const stat=parseCountValue(original);
  assert.ok(stat,original+' should parse');
  assert.equal(stat.target,target);
  assert.equal(stat.format(0),start);
  assert.equal(stat.format(stat.target),original);
 }
});

test('non-numeric labels do not invent or animate values',()=>{
 assert.equal(parseCountValue('Legacy'),null);
 assert.equal(parseCountValue(''),null);
});

test('intermediate values preserve grouping, currency, decimals, suffixes',()=>{
 assert.equal(parseCountValue('1,750 +').format(1250),'1,250 +');
 assert.equal(parseCountValue('$2.3 Billion').format(1.7),'$1.7 Billion');
 assert.equal(parseCountValue('1.0%').format(.4),'0.4%');
});
