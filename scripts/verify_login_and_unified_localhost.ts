import fs from 'fs';
import path from 'path';
import { TRANSLATIONS, type SupportedLanguage } from '../src/locales/translations';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('===========================================================');
console.log('🔐 VERIFYING UNIFIED LOGIN & SINGLE LOCALHOST INTEGRATION');
console.log('===========================================================');

// 1. Check LoginPage component exists
const loginPagePath = path.resolve('src/components/auth/LoginPage.tsx');
assert(fs.existsSync(loginPagePath), 'src/components/auth/LoginPage.tsx exists');
const loginPageContent = fs.readFileSync(loginPagePath, 'utf8');
assert(loginPageContent.includes('export const LoginPage'), 'LoginPage component is exported');
assert(loginPageContent.includes('onSelectRole'), 'LoginPage accepts onSelectRole callback');
assert(loginPageContent.includes('loginAsPatient'), 'LoginPage provides Patient login trigger for Meera Joshi');
assert(loginPageContent.includes('loginAsCaregiver'), 'LoginPage provides Caregiver login trigger for Anita Joshi');

// 2. Check App.tsx single-localhost router
const appPath = path.resolve('src/App.tsx');
assert(fs.existsSync(appPath), 'src/App.tsx exists');
const appContent = fs.readFileSync(appPath, 'utf8');
assert(appContent.includes("type AuthView = 'login' | 'patient' | 'caregiver'"), 'App defines AuthView type');
assert(appContent.includes('detectInitialView'), 'App has detectInitialView logic supporting login fallback');
assert(appContent.includes('smriti_auth_view'), 'App stores active view session in smriti_auth_view');
assert(appContent.includes('handleLogin'), 'App handles user login');
assert(appContent.includes('handleLogout'), 'App handles user logout to login screen');
assert(appContent.includes('<LoginPage'), 'App renders LoginPage when activeView is login');
assert(appContent.includes('<PatientPortal'), 'App renders PatientPortal when activeView is patient');
assert(appContent.includes('<CaregiverPortal'), 'App renders CaregiverPortal when activeView is caregiver');

// 3. Check translations for all 8 auth keys across all 4 languages
const languages: SupportedLanguage[] = ['en', 'as', 'bn', 'hi'];
const authKeys = [
  'login',
  'logout',
  'patientLogin',
  'caregiverLogin',
  'selectRole',
  'welcomeBack',
  'loginAsPatient',
  'loginAsCaregiver',
] as const;

console.log('\n===========================================================');
console.log('🌐 VERIFYING 4-LANGUAGE LOCALIZATION OF AUTHENTICATION KEYS');
console.log('===========================================================');

for (const lang of languages) {
  const dict = TRANSLATIONS[lang];
  assert(Boolean(dict), `Translation dictionary for ${lang} is available`);
  for (const key of authKeys) {
    const val = dict[key];
    assert(typeof val === 'string' && val.length > 0, `[${lang}] "${key}" is translated: "${val?.slice(0, 30)}..."`);
  }
}

// 4. Check PatientPortal & CaregiverPortal onLogout integration
console.log('\n===========================================================');
console.log('🚪 VERIFYING LOGOUT CONTROLS IN PORTALS');
console.log('===========================================================');

const patientPortalPath = path.resolve('src/components/portals/PatientPortal.tsx');
const patientContent = fs.readFileSync(patientPortalPath, 'utf8');
assert(patientContent.includes('onLogout?: () => void;'), 'PatientPortal accepts onLogout prop');
assert(patientContent.includes('onLogout &&'), 'PatientPortal renders logout action button in header');

const caregiverPortalPath = path.resolve('src/components/portals/CaregiverPortal.tsx');
const caregiverContent = fs.readFileSync(caregiverPortalPath, 'utf8');
assert(caregiverContent.includes('onLogout?: () => void;'), 'CaregiverPortal accepts onLogout prop');
assert(caregiverContent.includes('onLogout &&'), 'CaregiverPortal renders logout action in sidebar footer');

// 5. Check package.json dev port configuration
const pkgPath = path.resolve('package.json');
const pkgContent = fs.readFileSync(pkgPath, 'utf8');
const pkgJson = JSON.parse(pkgContent);
assert(pkgJson.scripts.dev.includes('--port 5173'), 'package.json dev script explicitly binds to port 5173');

console.log('\n===========================================================');
console.log(`🏁 SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('===========================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL UNIFIED LOGIN & SINGLE LOCALHOST CHECKS PASSED PERFECTLY!');
}
