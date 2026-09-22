import { describe, it, expect } from 'vitest';

describe('pdfmake browser import', () => {
  it('should have createPdf accessible', async () => {
    const mod = await import('pdfmake/build/pdfmake');
    const pdfMake = mod.default || mod;

    console.log('typeof mod:', typeof mod);
    console.log('typeof mod.default:', typeof mod.default);
    console.log('typeof pdfMake:', typeof pdfMake);
    console.log('pdfMake.createPdf:', typeof pdfMake?.createPdf);

    expect(pdfMake).toBeDefined();
    expect(pdfMake.createPdf).toBeDefined();
  });

  it('should set vfs and create PDF', async () => {
    const pdfmakeModule = await import('pdfmake/build/pdfmake');
    const fontsModule = await import('pdfmake/build/vfs_fonts');

    const pdfMake = pdfmakeModule.default || pdfmakeModule;
    const fonts = fontsModule.default || fontsModule;

    pdfMake.vfs = fonts.vfs || fonts;

    expect(pdfMake.vfs).toBeTruthy();
    expect(pdfMake.createPdf).toBeDefined();

    const doc = pdfMake.createPdf({
      content: [{ text: 'Hello' }],
    });
    expect(doc).toBeDefined();
  });

  it('should test import from pdfmake directly', async () => {
    const mod = await import('pdfmake');
    console.log('Direct import keys:', Object.keys(mod));
    console.log('Has default:', 'default' in mod);
    console.log('Default keys:', mod.default ? Object.keys(mod.default) : 'N/A');
    console.log('Default.createPdf:', typeof (mod.default as any)?.createPdf);
  });
});
