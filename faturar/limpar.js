const puppeteer = require('puppeteer');
const fs = require('fs').promises;

function extractNumberFromOnClick(onClickAttribute) {
  const aux = onClickAttribute.toString();
  const aux2 = aux.match(/onclick="(.*?)"/)[1];
  const match = aux2.match(/\b\d+\b/);
  return match ? parseInt(match[0]) : null;
}

(async () => {
  console.clear();
  for (let i = 0; i < 9; i++) {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    const page = await browser.newPage();

    page.on('dialog', async (dialog) => {
      const logMessage = `Dialog message: ${dialog.message()}\n`;
      console.log(logMessage);
      await dialog.accept();
    });

    try {
      await page.goto('https://portal.unimedpalmas.coop.br/');
      const iframes = page.frames();
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

          const firstAnchorElement = await iframe.$('a');
          await firstAnchorElement.evaluate((a) => a.click());
          await iframe.waitForTimeout(300);

          const targetValue = 'Possui inconsistências';
          const tdElements = await iframe.$$('td');
          for (const td of tdElements) {
            const textContent = await iframe.evaluate(
              (td) => td.textContent.trim(),
              td
            );
            if (textContent === targetValue) {
              await iframe.waitForTimeout(500);
              const anchorElement = await iframe.evaluate((td) => {
                const row = td.closest('tr');
                const anchor = row.querySelector('a');
                return anchor.outerHTML;
              }, td);

              if (anchorElement) {
                await iframe.evaluate((anchorHTML) => {
                  const tempContainer = document.createElement('div');
                  tempContainer.innerHTML = anchorHTML;
                  const anchorElement2 = tempContainer.firstChild;

                  anchorElement2.click();
                }, anchorElement);
                await iframe.waitForSelector('#btnExcluir');
                await iframe.$eval('#btnExcluir', (button) => button.click());
                
                const extractedNumber = extractNumberFromOnClick(anchorElement);
                console.log(extractedNumber);
                await fs.appendFile('guias inconsistentes.txt', extractedNumber.toString() + '\n');
                await iframe.waitForTimeout(500);
              } else {
                console.log('Anchor element not found in the same row.');
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      await browser.close();
    }
  }
})();
