const fs = require('fs');
const paths = [
  'apps/web/src/pages/CounsellorConsolePage.tsx',
  'apps/web/src/pages/AdminDashboardPage.tsx',
  'apps/web/src/pages/DecisionCardPage.tsx',
  'apps/web/src/pages/TradeDetailPage.tsx',
  'apps/web/src/pages/PrivateWindowPage.tsx',
  'apps/web/src/features/household/components/HouseholdIntakeForm.tsx',
  'apps/web/src/features/joint-room/ConcernsCheckpointModal.tsx',
];
const en = JSON.parse(fs.readFileSync('apps/web/src/locales/en.json', 'utf8'));
const hi = JSON.parse(fs.readFileSync('apps/web/src/locales/hi.json', 'utf8'));
en.migrated = en.migrated || {};
hi.migrated = hi.migrated || {};
let index = 0;
for (const file of paths) {
  let source = fs.readFileSync(file, 'utf8');
  if (source.includes('useTranslation')) {
    source = source.replace(/const \{ i18n \} = useTranslation\(\);/g, 'const { t, i18n } = useTranslation();');
  }
  source = source.replace(/isHi\s*\?\s*'([^']*)'\s*:\s*'([^']*)'/g, (_, hindi, english) => {
    const key = `k${++index}`;
    en.migrated[key] = english;
    hi.migrated[key] = hindi;
    return `t('migrated.${key}')`;
  });
  fs.writeFileSync(file, source);
}
fs.writeFileSync('apps/web/src/locales/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('apps/web/src/locales/hi.json', JSON.stringify(hi, null, 2) + '\n');
