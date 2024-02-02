const puppeteer = require('puppeteer');
const fs = require('fs').promises;

(async () => {
  console.clear();
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  page.on('dialog', async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.dismiss(); // You can also use dialog.accept() to accept the dialog
    // await dialog.accept();
  });

  try {
    const fileContent = await fs.readFile('faturar.txt', 'utf-8');
    const lines = fileContent.trim().split('\n');

    await page.goto('https://portal.unimedpalmas.coop.br/');
    const iframes = await page.frames();
    for (const iframe of iframes) {
      if (iframe.name() === 'principal') {
        // LOGIN PROCESS
        await iframe.waitForSelector('#tipoUsuario');
        await iframe.select('select#tipoUsuario', 'P');
        await iframe.type('#nmUsuario', 'fisiocep');
        await iframe.type('#dsSenha', 'fisiocep2022');
        await iframe.waitForSelector('#btn_entrar');
        await iframe.$eval('#btn_entrar', (button) => button.click());

        // NAVIGATE TO PAGE
        await iframe.waitForNavigation();
        await iframe.goto(
          'https://portal.unimedpalmas.coop.br/pls_montarListaProtocolosDigitacao.action'
        );

        // // CLICK ON ANCHOR ELEMENT AND GET PROTOCOL NUMBER
        const firstAnchorElement = await iframe.$('a');
        const hrefContent = await iframe.evaluate(
          (anchor) => anchor.getAttribute('href'),
          firstAnchorElement
        );
        const nrSeqProtocoloValue = extractNrSeqProtocolo(hrefContent);
        await firstAnchorElement.evaluate((a) => a.click());

        // CLICK TO EVALUATE
        await iframe.waitForNavigation();
        await iframe.goto(
          `https://portal.unimedpalmas.coop.br/pls_montarTelaDigitacaoContasMedicas.action?nrSeqProtocolo=${nrSeqProtocoloValue}&ieTipoGuia=4`
        );

        for (const [index, line] of lines.entries()) {
          const [codigoGuia, crmSolicitante] = line.trim().split(';');
          console.log('FATURANDO:', codigoGuia, crmSolicitante);
          // TYPE IN CLIENT DATA AND SEARCH
          await iframe.waitForSelector('#nr_crm_solicitante');
          await iframe.$eval(
            '#nr_crm_solicitante',
            (input, value) => (input.value = value),
            crmSolicitante
          );
          await page.keyboard.press('Tab');
          await page.waitForTimeout(1000);

          await iframe.waitForSelector('#CD_PRESTADOR_EXEC');
          await iframe.$eval(
            '#CD_PRESTADOR_EXEC',
            (input, value) => (input.value = value),
            '30001343'
          );
          await page.keyboard.press('Tab');
          await page.waitForTimeout(1000);

          await iframe.waitForSelector('#id_grau_participacao_filtro');
          await iframe.select('select#id_grau_participacao_filtro', '10');
          await page.waitForTimeout(1000);

          await iframe.waitForSelector('#nr_crm_participante');
          await iframe.$eval(
            '#nr_crm_participante',
            (input, value) => (input.value = value),
            '152447'
          );
          await page.keyboard.press('Tab');
          await page.waitForTimeout(1000);

          await iframe.waitForSelector('#nm_medico_participante');
          await iframe.$eval(
            '#nm_medico_participante',
            (input, value) => (input.value = value),
            'DAYANNE LIMA VALDIVINO'
          );
          await page.keyboard.press('Tab');
          await page.waitForTimeout(1000);

          await iframe.waitForSelector('#idListaMedico_participante');
          await iframe.select('select#idListaMedico_participante', '221669');
          await page.waitForTimeout(1000);

          // ACCESS NEW FRAME CONTAINING BUTTON
          const iframes = page.frames();
          for (const iframe of iframes) {
            if (iframe.name() === 'frame_2') {
              await iframe.waitForSelector('#btnNovaConta');
              await iframe.$eval('#btnNovaConta', (button) => button.click());
              await page.waitForTimeout(1000);

              // FILL IN FORMAT WITH CLIENT DATA
              await iframe.waitForSelector('#cd_guia');
              await iframe.type('#cd_guia', codigoGuia);
              await page.keyboard.press('Tab');
              await page.waitForTimeout(2000);

              await iframe.waitForSelector('#IE_CARATER_INTERNACAO');
              await iframe.select('select#IE_CARATER_INTERNACAO', 'E');

              await iframe.waitForSelector('#NR_SEQ_TIPO_ATENDIMENTO');
              await iframe.select('select#NR_SEQ_TIPO_ATENDIMENTO', '3');

              await iframe.waitForSelector('#IE_INDICACAO_ACIDENTE');
              await iframe.select('select#IE_INDICACAO_ACIDENTE', '9');

              await iframe.waitForSelector('#IE_REGIME_ATENDIMENTO');
              await iframe.select('select#IE_REGIME_ATENDIMENTO', '01');

              await iframe.waitForSelector('#btnSalvar');
              await iframe.$eval('#btnSalvar', (button) => button.click());
              console.log(`${index} FATURADO COM SUCESSO`);
              await page.waitForTimeout(2000);

              if (index === lines.length - 1) {
                await iframe.waitForSelector('#btnVoltar');
              await iframe.$eval('#btnVoltar', (button) => button.click());
              console.log(`${index} FATURAMENTOS CONCLUIDOS!`);
              await page.waitForTimeout(2000);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // await browser.close();
  }
})();

function extractNrSeqProtocolo(url) {
  const match = url.match(/nrSeqProtocolo=(\d+)/);
  return match ? match[1] : null;
}
