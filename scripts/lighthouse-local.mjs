import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from '@playwright/test';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

const url = process.argv[2] ?? 'http://127.0.0.1:4173';
const mobileRuns = Number(process.argv[3] ?? 5);
const desktopRuns = Number(process.argv[4] ?? 3);
const outputDir = resolve('lighthouse-reports');

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const summarize = (lhr) => ({
  performance: Math.round(lhr.categories.performance.score * 100),
  accessibility: Math.round(lhr.categories.accessibility.score * 100),
  bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
  seo: Math.round(lhr.categories.seo.score * 100),
  fcp: Math.round(lhr.audits['first-contentful-paint'].numericValue),
  lcp: Math.round(lhr.audits['largest-contentful-paint'].numericValue),
  speedIndex: Math.round(lhr.audits['speed-index'].numericValue),
  tbt: Math.round(lhr.audits['total-blocking-time'].numericValue),
  cls: Number(lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
});

await mkdir(outputDir, { recursive: true });
const chrome = await chromeLauncher.launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});

const results = { mobile: [], desktop: [] };

try {
  for (const [formFactor, count] of [['mobile', mobileRuns], ['desktop', desktopRuns]]) {
    for (let index = 1; index <= count; index += 1) {
      const config = formFactor === 'desktop' ? desktopConfig : undefined;
      const run = await lighthouse(url, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      }, config);
      if (!run) throw new Error(`Lighthouse failed on ${formFactor} run ${index}`);
      const summary = summarize(run.lhr);
      results[formFactor].push(summary);
      await writeFile(resolve(outputDir, `${formFactor}-${index}.json`), run.report);
      process.stdout.write(`${formFactor} ${index}/${count}: ${JSON.stringify(summary)}\n`);
    }
  }
} finally {
  try {
    await chrome.kill();
  } catch (error) {
    if (error?.code !== 'EPERM') {
      process.stderr.write(`Chrome cleanup warning: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }
}

const medians = Object.fromEntries(Object.entries(results).filter(([, runs]) => runs.length > 0).map(([formFactor, runs]) => [
  formFactor,
  Object.fromEntries(Object.keys(runs[0]).map((metric) => [metric, median(runs.map((run) => run[metric]))])),
]));

await writeFile(resolve(outputDir, 'summary.json'), JSON.stringify({ url, results, medians }, null, 2));
process.stdout.write(`medians: ${JSON.stringify(medians)}\n`);
