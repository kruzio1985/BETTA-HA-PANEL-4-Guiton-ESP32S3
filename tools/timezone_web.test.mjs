import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../components/webui/www/app.js", import.meta.url), "utf8");
const code = source.slice(source.indexOf("const timezonePicker ="), source.indexOf("async function loadSettings("));
const catalog = JSON.parse(readFileSync(new URL("./i18n/catalogs/web-en.json", import.meta.url)));
const names = Object.keys(JSON.parse(readFileSync(new URL("../main/net/tzdb/zones.json", import.meta.url))));
function setup() {
  const nodes = new Map();
  function node() { return { value: "", textContent: "", hidden: true, children: [], attrs: {}, offsetParent: {},
    classList: { toggle() {} }, setAttribute(k,v) { this.attrs[k]=v; }, removeAttribute(k) { delete this.attrs[k]; },
    replaceChildren(...v) { this.children=v; }, append(v) { this.children.push(v); }, scrollIntoView() {}, select() {},
    focus() { this.onfocus?.(); }, contains() { return false; } }; }
  const get = id => { if (!nodes.has(id)) nodes.set(id,node()); return nodes.get(id); };
  let now = 0, intervals = 0, requests = 0;
  const clock = { clock_valid:true, local_time:"2026-09-23T05:42:31", active_timezone:"Africa/Ceuta" };
  const context = vm.createContext({
    el:{settingsTimezone:get("settingsTimezone")}, editor:{settings:{ui:{language:"en"}}},
    document:{getElementById:get,createElement:node,hidden:false},
    window:{setInterval(){intervals++;},setTimeout(){},clearTimeout(){}},
    performance:{now:()=>now}, t:key=>catalog[key], Intl, Date, AbortController,
    apiGet:async path=>{assert.equal(path,"/api/settings?time_only=1");requests++;return clock;},
  });
  vm.runInContext(code,context);
  const time = {...clock,timezone:"Africa/Ceuta",timezones:names};
  context.renderTimezoneSettings(time);
  return {context,get,time,advance:ms=>{now+=ms;},intervals:()=>intervals,requests:()=>requests};
}
test("search shang returns Shanghai and selection keeps exact identifier",()=>{
  const {context:c,get}=setup();
  get("settingsTimezoneSearch").value="shang";
  get("settingsTimezoneSearch").oninput();
  const options=get("settingsTimezoneOptions");
  assert.deepEqual(options.children.map(n=>n.textContent),["Asia/Shanghai"]);
  options.children[0].onclick();
  assert.equal(get("settingsTimezone").value,"Asia/Shanghai");
  assert.equal(get("settingsTimezoneSearch").value,"Asia/Shanghai");
  assert.equal(options.hidden,true);
  c.renderTimezoneSettings({timezone:"Asia/Shanghai",timezones:names});
  assert.equal(get("settingsTimezoneSearch").value,"Asia/Shanghai");
});
test("keyboard selection, no results and Escape preserve valid selection",()=>{
  const {context:c,get}=setup();
  c.showTimezoneOptions("SHANG");
  c.timezoneKeydown({key:"ArrowDown",preventDefault(){}});
  assert.equal(get("settingsTimezoneSearch").attrs["aria-activedescendant"],"timezone-option-0");
  c.timezoneKeydown({key:"Enter",preventDefault(){}});
  assert.equal(get("settingsTimezone").value,"Asia/Shanghai");
  c.showTimezoneOptions("no_such_zone");
  assert.equal(get("settingsTimezoneOptions").children[0].textContent,"No matching timezones");
  c.timezoneKeydown({key:"Escape",preventDefault(){}});
  assert.equal(get("settingsTimezoneSearch").value,"Asia/Shanghai");
});
test("legacy values remain stored but are not exposed as editable POSIX text",()=>{
  const {context:c,get,intervals}=setup();
  const legacy="CET-1CEST,M3.5.0,M10.5.0/3";
  c.renderTimezoneSettings({timezone:legacy,timezones:names});
  assert.equal(get("settingsTimezone").value,legacy);
  assert.equal(get("settingsTimezoneSearch").value,"");
  assert.match(get("settingsTimezoneHint").textContent,/preserved/);
  assert.equal(intervals(),1);
});
test("clock uses device local time, ticks, and expires stale data",()=>{
  const {context:c,get,advance,time}=setup();
  assert.equal(get("settingsLocalTime").textContent,"23 Sept 2026, 05:42:31");
  advance(2000);c.updateTimezoneClock();
  assert.match(get("settingsLocalTime").textContent,/05:42:33/);
  c.renderTimezoneSettings(time); // rerender must not reset the device snapshot
  assert.match(get("settingsLocalTime").textContent,/05:42:33/);
  advance(15000);c.updateTimezoneClock();
  assert.match(get("settingsLocalTime").textContent,/unavailable/);
});
test("clock polling is throttled and paused when hidden",async()=>{
  const {context:c,advance,requests}=setup();
  await c.tickTimezoneClock();assert.equal(requests(),0);
  advance(5000);await c.tickTimezoneClock();assert.equal(requests(),1);
  advance(5000);c.document.hidden=true;await c.tickTimezoneClock();assert.equal(requests(),1);
});
