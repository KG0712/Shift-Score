// Native helpers for the App Store / Google Play builds of Shift Score.
// Loaded only inside the iOS and Android apps; the website never loads this file.
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Preferences } from "@capacitor/preferences";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { StatusBar, Style } from "@capacitor/status-bar";

const KEY = "shiftscore.v1";
const REMIND_ID = 4201;
const REMIND_AFTER_H = 9;

function isNative() { return Capacitor.isNativePlatform(); }

// 1) Storage. The phone can clear a web view's localStorage when space runs low,
//    so every save is mirrored to the app's own storage and restored on launch.
let pending = null;
function persist(key, json) {
  pending = { key, json };
  clearTimeout(persist.t);
  persist.t = setTimeout(flush, 250);
}
function flush() {
  if (!pending) return;
  const { key, json } = pending; pending = null;
  (json == null ? Preferences.remove({ key }) : Preferences.set({ key, value: json })).catch(() => {});
}
async function restoreIfNeeded() {
  let local = null;
  try { local = localStorage.getItem(KEY); } catch (e) {}
  if (local) { persist(KEY, local); return; }           // keep the backup copy current
  const { value } = await Preferences.get({ key: KEY });
  if (value) {
    try { localStorage.setItem(KEY, value); } catch (e) { return; }
    location.reload();                                    // start again with the restored data
  }
}

// 2) Files. Phones can't "download" from an app, so exports open the share sheet
//    (Save to Files, AirDrop, Mail, Messages, print from Pages, and so on).
function toBase64(data) {
  if (typeof data === "string") data = new TextEncoder().encode(data);
  else if (data instanceof ArrayBuffer) data = new Uint8Array(data);
  let s = "";
  for (let i = 0; i < data.length; i += 0x8000) s += String.fromCharCode.apply(null, data.subarray(i, i + 0x8000));
  return btoa(s);
}
async function saveFile(name, data) {
  const res = await Filesystem.writeFile({ path: name, data: toBase64(data), directory: Directory.Cache });
  await Share.share({ title: name, files: [res.uri], dialogTitle: "Save or send " + name });
}

// 3) Feel. A tap you can feel when the clock starts and stops.
function buzz(kind) {
  if (kind === "in") return Haptics.notification({ type: NotificationType.Success }).catch(() => {});
  if (kind === "out") return Haptics.notification({ type: NotificationType.Success }).catch(() => {});
  if (kind === "win") return Haptics.notification({ type: NotificationType.Success }).catch(() => {});
  if (kind === "warn") return Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
  return Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

// 4) "Still on the clock?" reminder, so a forgotten clock-out doesn't pad your hours.
async function clockedIn(at) {
  buzz("in");
  try {
    let p = await LocalNotifications.checkPermissions();
    if (p.display === "prompt" || p.display === "prompt-with-rationale") p = await LocalNotifications.requestPermissions();
    if (p.display !== "granted") return;
    await LocalNotifications.cancel({ notifications: [{ id: REMIND_ID }] });
    const when = new Date(at + REMIND_AFTER_H * 3600000);
    if (when.getTime() <= Date.now()) return;
    await LocalNotifications.schedule({ notifications: [{
      id: REMIND_ID, title: "Still on the clock?",
      body: "You've been clocked in for " + REMIND_AFTER_H + " hours. Tap to clock out or keep going.",
      schedule: { at: when, allowWhileIdle: true }
    }] });
  } catch (e) {}
}
async function clockedOut() {
  buzz("out");
  try { await LocalNotifications.cancel({ notifications: [{ id: REMIND_ID }] }); } catch (e) {}
}

// 5) Balance floor alerts: a notification the moment the balance drops below the floor.
const ALERT_ID = 4202;
async function askAlerts() {
  let p = await LocalNotifications.checkPermissions();
  if (p.display === "prompt" || p.display === "prompt-with-rationale") p = await LocalNotifications.requestPermissions();
  return p.display === "granted";
}
async function alertNow(title, body) {
  try {
    if (!(await askAlerts())) return;
    await LocalNotifications.schedule({ notifications: [{ id: ALERT_ID, title, body, schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true } }] });
  } catch (e) {}
}
function setDark(dark) { StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {}); }

if (isNative()) {
  document.documentElement.classList.add("native", "native-" + Capacitor.getPlatform());
  restoreIfNeeded().catch(() => {});
  // The pay counter is based on clock-in time, so it is exact after the app was in the background;
  // this just redraws it the moment you come back.
  App.addListener("resume", () => document.dispatchEvent(new Event("visibilitychange")));
  App.addListener("pause", flush);
  setDark(document.documentElement.getAttribute("data-theme") !== "light");
  window.ShiftNative = { platform: Capacitor.getPlatform(), persist, saveFile, buzz, clockedIn, clockedOut, askAlerts, alertNow, setDark };
}
