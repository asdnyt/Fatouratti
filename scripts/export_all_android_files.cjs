const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const script = `
import { ANDROID_FILES } from '../src/services/androidProjectGenerator.ts';
import * as fs from 'fs';
import * as path from 'path';

for (const file of ANDROID_FILES) {
  const fullPath = path.join('android', file.path);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, file.content, 'utf-8');
}

fs.mkdirSync('android/gradle/wrapper', { recursive: true });
fs.writeFileSync(
  'android/gradle/wrapper/gradle-wrapper.properties',
  'distributionBase=GRADLE_USER_HOME\\ndistributionPath=wrapper/dists\\ndistributionUrl=https\\\\://services.gradle.org/distributions/gradle-8.5-bin.zip\\nzipStoreBase=GRADLE_USER_HOME\\nzipStorePath=wrapper/dists\\n'
);

fs.writeFileSync(
  'android/app/proguard-rules.pro',
  '# Room SQLite ProGuard rules\\n-keep class * extends androidx.room.RoomDatabase\\n-dontwarn androidx.room.paging.**\\n'
);

console.log('All ' + ANDROID_FILES.length + ' Android Kotlin files exported to ./android/');
`;

fs.writeFileSync('scripts/temp_export.ts', script);
try {
  execSync('npx tsx scripts/temp_export.ts', { stdio: 'inherit' });
} finally {
  if (fs.existsSync('scripts/temp_export.ts')) {
    fs.unlinkSync('scripts/temp_export.ts');
  }
}
