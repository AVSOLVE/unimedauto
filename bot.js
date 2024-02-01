const puppeteer = require('puppeteer');
const fs = require('fs').promises;

(async () => {
  console.clear();
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  try {
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
          'https://portal.unimedpalmas.coop.br/pls_montarTelaExecucaoRequisicao.action'
        );

        // TYPE IN CLIENT DATA AND SEARCH
        await iframe.waitForSelector('#CD_USUARIO_PLANO');
        await iframe.type('#CD_USUARIO_PLANO', '02223167000166001');
        await page.keyboard.press('Tab');
        await iframe.$eval('#btnConsultar', (button) => button.click());

        // CHECKBOXES
        const checkboxesSelector = 'input[type="checkbox"]';
        await page.waitForSelector(checkboxesSelector);
        const checkboxes = await page.$$(checkboxesSelector);
        for (const checkbox of checkboxes) {
          await checkbox.click();
        }

        // CLICK TO EVALUATE
        const btnConfirma = await page.$('#btnConfirma');
        await btnConfirma.click();
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // await browser.close();
  }
})();

// const url = 'https://portal.unimedpalmas.coop.br/pls_principalPrestador.jsp'
// await page.goto(url, { waitUntil: 'networkidle0' });
// https://portal.unimedpalmas.coop.br/montaTelaLogin.action?item_0=:
// index_pls.jsp
// principal (login.action)
// paginaPrincipal (pls_montarTelaExecucaoRequisicao.action)
