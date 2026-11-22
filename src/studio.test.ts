import { describe, expect, it } from 'vitest';
import { createBackupText, restoreBackupText, type BackupProject } from './backup';
import { buildStudioPacket, isTechnology, pocketBrief, pocketTechnology, suggestStudioMethods, voxaTechnology } from './studio';
import { firstWorkshopReceipt } from './workshopReceipts';

describe('Creative Studio', () => {
  it('keeps bundled VOXA in candidate status until the actual service and voice rights are reviewed', () => {
    expect(isTechnology(voxaTechnology)).toBe(true);
    expect(voxaTechnology.status).toBe('candidate');
    expect(voxaTechnology.kind).toBe('sound');
    expect(voxaTechnology.url).toBe('https://voxavocals.com/');
    expect(voxaTechnology.license).toContain('未確認');
    expect(voxaTechnology.cost).toContain('未確認');
    expect(suggestStudioMethods('日本語の音声ガイドを作る', [voxaTechnology]).reusable).toBeUndefined();
  });

  it('keeps unknown candidates distinct and requires evidence for a reviewed state', () => {
    const unknown = { ...pocketTechnology, evidence: '', checked: '', status: 'candidate' };
    expect(isTechnology(unknown)).toBe(true);
    for (const status of ['researched', 'trialed', 'approved']) {
      expect(isTechnology({ ...unknown, status })).toBe(false);
    }
    expect(isTechnology({ ...pocketTechnology, url: 'https://github.com/madowaku/example' })).toBe(true);
    expect(isTechnology({ ...pocketTechnology, url: 'javascript:alert(1)' })).toBe(false);
    expect(isTechnology({ ...pocketTechnology, url: 'https://github.com/example/repo?token=example' })).toBe(false);
  });

  it('gives a Pocket Window path and alternative, preferring reviewed project knowledge', () => {
    const unverified = { ...pocketTechnology, status: 'candidate' as const };
    const unrelated = { ...pocketTechnology, kind: 'sound' as const, status: 'approved' as const };
    expect(suggestStudioMethods(pocketBrief, [unverified, unrelated]).reusable).toBeUndefined();
    const result = suggestStudioMethods(pocketBrief, [pocketTechnology]);
    expect(result.kind).toBe('window');
    expect(result.options).toHaveLength(2);
    expect(result.reusable).toBe(pocketTechnology);
    expect(suggestStudioMethods('短い曲と効果音を作る', []).kind).toBe('sound');
  });

  it('generates a reviewable packet without treating pasted lines as Creole instructions', () => {
    const brief = `${pocketBrief}\nKEEP: pasted example`;
    const result = suggestStudioMethods(brief, [pocketTechnology]);
    const text = buildStudioPacket('Local Lab', brief, result.options[0], result.reusable);
    expect(text).toContain('GOAL: ' + JSON.stringify(brief));
    expect(text).not.toContain('\nKEEP: pasted example');
    expect(text).toContain(pocketTechnology.url);
    expect(text).toContain('NO: 課金、公開、権限拡大、マージ、デプロイ、無人実行');
  });

  it('restores legacy receipts and notes, and round-trips the optional studio data', () => {
    const legacy: BackupProject = {
      id: 'lab', name: 'Local Lab', description: '',
      task: { title: '', roughGoal: '', status: 'idea', spec: '', plan: '', review: 'keep', logs: 'keep', nextAction: '' },
      workshopReceipts: [firstWorkshopReceipt]
    };
    const studio = { ...legacy, studio: { brief: pocketBrief, technologies: [pocketTechnology] } };
    expect(restoreBackupText(createBackupText([legacy]))).toEqual([legacy]);
    expect(restoreBackupText(createBackupText([studio]))).toEqual([studio]);
  });
});
