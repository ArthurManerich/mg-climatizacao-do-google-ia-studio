import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(), select: vi.fn(), eq: vi.fn(),
  response: { data: null as unknown, error: null as { message: string } | null },
}));
vi.mock('../lib/supabase', () => ({
  hasSupabaseConfig: () => true, supabase: { from: mocks.from },
}));
import { faqService } from './faqService';
import { testimonialsService } from './testimonialsService';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.response = { data: null, error: null };
  mocks.select.mockImplementation(async () => mocks.response);
  mocks.eq.mockReturnValue({ select: mocks.select });
  mocks.from.mockReturnValue({ delete: () => ({ eq: mocks.eq }) });
});

describe.each([['faq', faqService], ['testimonials', testimonialsService]] as const)('%s confirmed deletion', (table, service) => {
  it('requires exactly the requested ID', async () => {
    mocks.response.data = [{ id: 7 }];
    await expect(service.delete(7)).resolves.toBeUndefined();
    expect(mocks.from).toHaveBeenCalledWith(table);
    expect(mocks.eq).toHaveBeenCalledWith('id', 7);
    expect(mocks.select).toHaveBeenCalledWith('id');
  });
  it.each([[], null, [{ id: 8 }], [{ id: 7 }, { id: 8 }], [{ id: '7' }], { id: 7 }].map(data => ({ data })))('rejects unconfirmed result $data', async ({ data }) => {
    mocks.response.data = data;
    await expect(service.delete(7)).rejects.toThrow('confirmar a exclusão');
  });
  it('rejects database errors even with matching data', async () => {
    mocks.response = { data: [{ id: 7 }], error: { message: 'mock deletion failed' } };
    await expect(service.delete(7)).rejects.toThrow('mock deletion failed');
  });
});
